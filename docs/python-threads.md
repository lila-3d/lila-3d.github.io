# Threads and big meshes

Scripts can read a mesh of millions of points as numpy arrays in milliseconds, crunch them on every core with worker threads, and write the result back as one undo step.

## Get mesh data fast

```python
import lila

ship = lila.node("Ship")
points = ship.points_array()                 # (N, 3) float64
counts, face_points = ship.face_arrays()     # corners per face, then every face's point indices in a row
normals = ship.normals_array()               # (C, 3) float32, one per face-vertex
uvs = ship.uvs_array("uv0")                  # (C, 2) float32, one per face-vertex
```

`points_array()` is a view of the mesh itself, so it costs nothing however big the mesh is. The other arrays are copies, made on every core.

The arrays are read-only snapshots. Editing the mesh later never changes an array you already have, so any thread can read it.

Don't use `Node.points` on big meshes. It builds one Python object per point, which is thousands of times slower.

## Use worker threads

numpy releases Python's GIL while it crunches, so threads from `threading` or `concurrent.futures` really run at the same time. Split the array into chunks and give each thread one:

```python
import os
from concurrent.futures import ThreadPoolExecutor

import numpy as np
import lila

points = lila.node("Ship").points_array()

def chunk_sum(lo, hi):
    return points[lo:hi].sum(axis=0)

workers = os.cpu_count()
bounds = np.linspace(0, len(points), workers + 1, dtype=np.int64)
with ThreadPoolExecutor(max_workers=workers) as pool:
    sums = list(pool.map(chunk_sum, bounds[:-1], bounds[1:]))
print("mean", np.sum(sums, axis=0) / len(points))
```

A plain `points.mean(axis=0)` is already fast. Threads pay off when each chunk does real work: distances, a KD-tree query, noise, per-face maths.

Pure Python loops (`for p in points:`) hold the GIL, so threads don't speed them up. Keep the inner loop in numpy.

See [Benchmark](python-threads.md#benchmark) for a full example with timings.

## Write results back

Compute on any thread, then write on the main thread:

```python
ship = lila.node("Ship")
points = ship.points_array(base=True)
ship.set_points(points * 1.1)                # one undo step
```

`set_points` moves every point of the base mesh (the mesh under its modifiers), so read with `base=True` when the mesh has modifiers. The array must have one row per point, in `points_array`'s order.

Vertex colors work the same way: `get_colors()` and `set_colors()`.

## Background jobs with progress

`lila.run_in_background` runs a function on a worker thread and calls you back on the main thread when it's done. Lila stays responsive meanwhile.

```python
import numpy as np
import lila

ship = lila.node("Ship")
points = ship.points_array(base=True)

def inflate(progress, pts):                   # worker thread: no scene calls here
    out = pts.copy()
    chunks = 100
    for i, chunk in enumerate(np.array_split(out, chunks)):
        if progress.cancelled:
            return None
        chunk *= 1.01                         # your real work
        progress.step()
    return out

def done(result):                             # main thread
    if result is not None and ship.exists:
        ship.set_points(result)

job = lila.run_in_background(inflate, done, args=(points,), title="Inflate", total=100)
```

With a `title`, the job shows as a progress indicator with a Cancel button, and the function gets a `progress` first: `progress.step(n)`, `progress.set_status(text)`, `progress.cancelled`. Without one it's called with just `args`.

Errors go to `on_error(exception)`, or to the script editor's log by default. `job.cancel()` asks the function to stop, and `job.result()` waits for it and returns its value.

In `lilabatch`, call `job.wait()` before the script ends. The batch exits when the script does, and `wait()` also runs `done`.

From a worker, `lila.tasks.call_on_main(fn, *args)` runs anything on the main thread and returns a `Future`.

## What's thread safe

| From a worker thread | Safe |
| --- | --- |
| Reading arrays from `points_array`, `face_arrays`, `normals_array`, `uvs_array`, `get_colors` | Yes |
| numpy, file reading and writing, your own data | Yes |
| `print` | Yes, it goes to the log |
| `lila.tasks.call_on_main`, `job.cancel()`, `progress.step()` | Yes |
| `lila.ops.*`, Node attributes, `points_array` and the other getters, `set_points`, `set_colors` | No: main thread only |

The main-thread-only calls raise a `CommandError` on any other thread rather than corrupting the scene. Get the arrays on the main thread first, then hand them to the workers.

The scene can change while a job runs, since the user keeps working. Check that what `done` edits still exists.

## C++ extensions

`<lila/Tasks.h>` gives extensions the same pieces, and TBB comes with the SDK:

```cpp
#include <lila/Command.h>
#include <lila/Extension.h>
#include <lila/Graph.h>
#include <lila/Log.h>
#include <lila/Mesh.h>
#include <lila/Tasks.h>

#include <tbb/combinable.h>

using namespace lila;

namespace
{
tasks::Job gJob;
}

LILA_EXTENSION_EXPORT int lilaExtensionInit(ext::Context& ctx)
{
    CommandDef average{
        .name = "averagePoints",
        .doc = "Logs the average point of a mesh, computed in the background.",
        .positionalDoc = "mesh",
        .undoable = false,
        .run = [](const Args& a) -> json {
            scene::Graph& g = scene::Graph::current();
            scene::Node* n = g.find(a.objects().at(0));
            if (!n || !n->type().isA("mesh"))
                throw CommandError("averagePoints: give a mesh");
            g.evaluate();
            // An immutable snapshot: safe to read on the worker while the user keeps editing.
            scene::MeshPtr mesh = n->as<scene::MeshPtr>(scene::MeshNode::kOutMesh);
            auto mean = std::make_shared<glm::dvec3>(0.0);
            gJob = tasks::runInBackground("Averaging", double(mesh->pointCapacity()),
                [mesh, mean](tasks::Task& t) {
                    tbb::combinable<glm::dvec3> sums([] { return glm::dvec3(0.0); });
                    tbb::parallel_for(tbb::blocked_range<geo::Index>(0, mesh->pointCapacity(), 1 << 16), [&](const auto& r) {
                        t.checkCancel();
                        glm::dvec3& s = sums.local();
                        for (geo::Index p = r.begin(); p < r.end(); ++p)
                            if (mesh->pointValid(p))
                                s += mesh->position(p);
                        t.progress.step(double(r.size()));
                    });
                    *mean = sums.combine([](const glm::dvec3& x, const glm::dvec3& y) { return x + y; }) / double(mesh->numPoints());
                },
                [mean](std::exception_ptr error) {
                    if (!error)
                        log::info("average {} {} {}", mean->x, mean->y, mean->z);
                });
            return nullptr;
        },
    };
    return ctx.registerCommand(std::move(average)) ? 0 : 1;
}

LILA_EXTENSION_EXPORT void lilaExtensionUninit(ext::Context&)
{
    gJob.cancel();
    gJob.wait();
}
```

- `tasks::runInBackground(title, total, work, onDone)` runs `work(Task&)` on a new thread under a background progress indicator, then `onDone(error)` on the main thread. `error` is null on success, or what `work` threw (`tasks::Cancelled` after Cancel).
- `Task::progress` is a `progress::Scope`: `step()` it from any thread. `Task::cancelled()` and `checkCancel()` see Cancel and `Job::cancel()`.
- `tasks::runAndWait(fn)` runs `fn` on a worker and returns when it has, keeping the UI painting meanwhile. Use it inside a command that must finish before it returns. Open a `progress::Scope` around it for a title and bar.
- `tasks::postToMain(fn)` queues `fn` for the main thread from any thread. `tasks::isMainThread()` tells you where you are.
- `tbb::parallel_for` and the rest of TBB run on Lila's own thread pool, so they share the cores with Lila rather than fighting it.

Wait for every running job in `lilaExtensionUninit`: a job must not run the extension's code after it unloads.

## Troubleshooting

**"lila.ops.X was called from a worker thread".** A worker called a command or touched a Node. Do it in `done`, or through `lila.tasks.call_on_main`.

**"points_array uses the scene, so it runs on the main thread only".** Get arrays on the main thread and pass them to the worker, as in the examples above.

**"setMeshPoints: Ship has N points, got M".** The array doesn't match the base mesh. Read it with `points_array(base=True)`: modifiers can change the point count.

**"ValueError: assignment destination is read-only".** Arrays from the getters are snapshots. Copy before editing in place: `pts = ship.points_array().copy()`.

**Threads are no faster.** The work is a Python loop, which holds the GIL. Move the inner loop into numpy, or into a C++ extension.

**`done` never runs in lilabatch.** The script ended before the job did. Call `job.wait()` at the end.

## Options

| Call | Returns |
| --- | --- |
| `Node.points_array(base=False, world=False)` | `(N, 3)` float64 points. `base` reads the mesh under its modifiers, `world` gives world space (a copy). |
| `Node.face_arrays(base=False)` | `(counts, points)`, both uint32. Face `i` is `points[offsets[i]:offsets[i] + counts[i]]` with `offsets = numpy.cumsum(counts) - counts`. |
| `Node.normals_array(base=False)` | `(C, 3)` float32, per face-vertex: faces in order, corners around each face. The mesh's custom normals when it has them, else smooth normals split at hard edges. |
| `Node.uvs_array(uv_set="uv0", base=False)` | `(C, 2)` float32, per face-vertex in the same order. `Node.uv_sets` lists the sets. |
| `Node.set_points(points)` | Moves every base point; one undo step. Also `setMeshPoints(mesh, points=[[x, y, z], ...])`. |
| `lila.run_in_background(fn, on_done=None, *, args=(), kwargs=None, on_error=None, title=None, total=0)` | A `Job`: `running`, `finished`, `cancel()`, `wait(timeout)`, `result(timeout)`. |
| `lila.tasks.call_on_main(fn, *args, **kwargs)` | A `concurrent.futures.Future`. Don't wait on it from the main thread. |
| `lila.tasks.is_main_thread()` | `True` on the main thread. |

## Benchmark

The same per-vertex maths, timed in Lila and in Maya. Each app gathers every vertex position into an `(N, 3)` float64 numpy array, then runs `compute(points)` from `mesh_compute.py`: a 4x4 matrix per vertex built from its position and applied to it, then a normalise, an angle to a fixed axis, sin, cos and tan, and the mean and covariance of the results. It runs three ways: numpy on one thread, numpy split across `os.cpu_count()` worker threads, and pure Python with the `math` module on 100,000 vertices, extrapolated. The checksum (the mean and the covariance trace) shows every way and every app computed the same thing.

```
set LILA_EXAMPLE_MESH=X:/Tress/Art/Ship/Gen/manyships.obj
lilabatch -b python/examples/mesh_compute_benchmark.py
mayapy tools/benchmarks/maya_mesh_compute.py
```

The Maya script measures the meshes already in the scene, or imports `MAYA_BENCH_MESH` as OBJ when there are none. It gathers through `MFnMesh.getRawPoints` when it can, else `MFnMesh.getPoints`, and prints which.

| manyships.obj, 13.5M triangles, 6,748,920 vertices | Lila | Maya |
| --- | --- | --- |
| Gather | 0.0002 s | 0.022 s through `getRawPoints` and ctypes, 13.7 s through `getPoints` |
| numpy | 1.54 s | 1.33 s |
| numpy, threaded (32 workers) | 0.692 s | 0.711 s |
| Pure Python (extrapolated) | 22.5 s | 27.3 s |
| Checksum | mean -0.343375486 -0.065308194 0.008460365, cov trace 0.027830457 | the same |

`tools/benchmarks/mesh_compute.py`, shared by both:

```python
"""The mesh compute benchmark's maths, shared by every app's benchmark script so they all time the same work.

Plain numpy and the math module only: nothing app-specific. Each vertex gets a 4x4 matrix built from its position
(rotate about Y by atan2(z, x), about X by asin of the normalised y, scale by its length, translate by the position),
that matrix transforms the vertex, the result is normalised, its angle to a fixed axis goes through some sin, cos and
tan, and the weighted directions are reduced to a mean and a 3x3 covariance.

    mean, cov = compute(points)                      # points: (N, 3) float64
    mean, cov = compute_threaded(points, pool, workers)
    n, s, ss = python_partial(points[:100_000])      # the same maths per vertex in pure Python
"""

import math

import numpy as np

AXIS = np.array([1.0, 2.0, 3.0]) / math.sqrt(14.0)
CHUNK = 1 << 16


def _matrices(p):
    """(n, 4, 4) per-vertex matrices T(p) * Ry(yaw) * Rx(pitch) * S(|p|)."""
    x, y, z = p[:, 0], p[:, 1], p[:, 2]
    length = np.sqrt(x * x + y * y + z * z)
    safe = np.where(length > 0.0, length, 1.0)
    yaw = np.arctan2(z, x)
    pitch = np.arcsin(np.clip(y / safe, -1.0, 1.0))
    cy, sy = np.cos(yaw), np.sin(yaw)
    cp, sp = np.cos(pitch), np.sin(pitch)
    m = np.zeros((len(p), 4, 4))
    m[:, 0, 0] = cy * length
    m[:, 0, 1] = sy * sp * length
    m[:, 0, 2] = sy * cp * length
    m[:, 1, 1] = cp * length
    m[:, 1, 2] = -sp * length
    m[:, 2, 0] = -sy * length
    m[:, 2, 1] = cy * sp * length
    m[:, 2, 2] = cy * cp * length
    m[:, :3, 3] = p
    m[:, 3, 3] = 1.0
    return m


def partial(p):
    """(count, sum, sum of outer products) of the weighted directions of one chunk of points."""
    h = np.empty((len(p), 4))
    h[:, :3] = p
    h[:, 3] = 1.0
    q = np.einsum("nij,nj->ni", _matrices(p), h)[:, :3]
    norm = np.linalg.norm(q, axis=1)
    qn = q / np.where(norm > 0.0, norm, 1.0)[:, None]
    angle = np.arccos(np.clip(qn @ AXIS, -1.0, 1.0))
    mix = np.sin(angle) * np.cos(2.0 * angle) + np.tan(0.25 * angle)
    r = qn * mix[:, None]
    return len(r), r.sum(axis=0), r.T @ r


def combine(parts):
    """Mean and sample covariance from partial() results."""
    n = sum(c for c, _, _ in parts)
    s = np.sum([s for _, s, _ in parts], axis=0)
    ss = np.sum([ss for _, _, ss in parts], axis=0)
    mean = s / n
    cov = (ss - n * np.outer(mean, mean)) / (n - 1)
    return mean, cov


def _chunks(n, size):
    return [(lo, min(lo + size, n)) for lo in range(0, n, size)]


def compute(points):
    """Mean and 3x3 covariance of the weighted directions, on this thread, a chunk at a time."""
    p = np.asarray(points, dtype=np.float64)
    return combine([partial(p[lo:hi]) for lo, hi in _chunks(len(p), CHUNK)])


def compute_threaded(points, pool, workers):
    """compute() split across a concurrent.futures pool; numpy releases the GIL, so the chunks run in parallel."""
    p = np.asarray(points, dtype=np.float64)
    size = max(1024, min(CHUNK, -(-len(p) // (workers * 4))))
    return combine(list(pool.map(lambda r: partial(p[r[0]:r[1]]), _chunks(len(p), size))))


def python_partial(points):
    """partial() vertex by vertex with the math module, for the pure Python timing."""
    ax, ay, az = (float(v) for v in AXIS)
    n = 0
    s = [0.0, 0.0, 0.0]
    ss = [[0.0] * 3 for _ in range(3)]
    for x, y, z in points:
        length = math.sqrt(x * x + y * y + z * z)
        yaw = math.atan2(z, x)
        pitch = math.asin(max(-1.0, min(1.0, y / length))) if length > 0.0 else 0.0
        cy, sy, cp, sp = math.cos(yaw), math.sin(yaw), math.cos(pitch), math.sin(pitch)
        m = ((cy * length, sy * sp * length, sy * cp * length, x),
             (0.0, cp * length, -sp * length, y),
             (-sy * length, cy * sp * length, cy * cp * length, z))
        q = [row[0] * x + row[1] * y + row[2] * z + row[3] for row in m]
        norm = math.sqrt(q[0] * q[0] + q[1] * q[1] + q[2] * q[2]) or 1.0
        qn = [c / norm for c in q]
        angle = math.acos(max(-1.0, min(1.0, qn[0] * ax + qn[1] * ay + qn[2] * az)))
        mix = math.sin(angle) * math.cos(2.0 * angle) + math.tan(0.25 * angle)
        r = [c * mix for c in qn]
        n += 1
        for i in range(3):
            s[i] += r[i]
            for j in range(3):
                ss[i][j] += r[i] * r[j]
    return n, np.array(s), np.array(ss)


def checksum(mean, cov):
    """One line to compare across apps: the mean and the covariance's trace."""
    return f"mean {mean[0]:.9f} {mean[1]:.9f} {mean[2]:.9f}  cov trace {np.trace(cov):.9f}"
```

`python/examples/mesh_compute_benchmark.py`:

```python
"""Mesh compute benchmark for Lila: gather every vertex of a big mesh into numpy, then run the same per-vertex maths
(tools/benchmarks/mesh_compute.py) three ways: numpy, numpy across worker threads, and pure Python on 100,000
vertices, extrapolated. tools/benchmarks/maya_mesh_compute.py runs the identical maths in Maya.

    lilabatch -b python/examples/mesh_compute_benchmark.py

The mesh comes from LILA_EXAMPLE_MESH, else DEFAULT. LILA_BENCH_DIR overrides where mesh_compute.py is found.
"""

import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor

import numpy as np

import lila
from lila import ops

DEFAULT = "X:/Tress/Art/Ship/Gen/manyships.obj"
SUBSET = 100_000


def _bench_dir():
    if os.environ.get("LILA_BENCH_DIR"):
        return os.environ["LILA_BENCH_DIR"]
    here = os.path.dirname(os.path.abspath(globals().get("__file__") or "."))
    return os.path.join(os.path.dirname(os.path.dirname(here)), "tools", "benchmarks")


sys.path.insert(0, _bench_dir())
import mesh_compute  # noqa: E402


def timed(fn):
    start = time.perf_counter()
    value = fn()
    return value, time.perf_counter() - start


def gather(meshes):
    arrays = [m.points_array() for m in meshes]
    return arrays[0] if len(arrays) == 1 else np.concatenate(arrays)


def main():
    path = os.environ.get("LILA_EXAMPLE_MESH") or DEFAULT
    names, import_s = timed(lambda: ops.importFile(path))
    meshes = [lila.Node(n) for n in names if lila.Node(n).is_a("mesh")]
    if not meshes:
        raise RuntimeError(f"{path} has no meshes")
    print(f"import {path}: {import_s:.2f} s, {len(meshes)} mesh(es)")

    points, gather_s = timed(lambda: gather(meshes))
    print(f"vertices: {len(points):,}")
    print(f"gather:   {gather_s:.4f} s")

    (mean, cov), numpy_s = timed(lambda: mesh_compute.compute(points))
    print(f"numpy:    {numpy_s:.3f} s  {mesh_compute.checksum(mean, cov)}")

    workers = os.cpu_count() or 4
    with ThreadPoolExecutor(max_workers=workers) as pool:
        mesh_compute.compute_threaded(points[: workers * 1024], pool, workers)  # starts the threads outside the timing
        (tmean, tcov), threaded_s = timed(lambda: mesh_compute.compute_threaded(points, pool, workers))
    print(f"threaded: {threaded_s:.3f} s  {mesh_compute.checksum(tmean, tcov)}  ({workers} workers)")

    n = min(SUBSET, len(points))
    subset = points[:n].tolist()
    _, python_s = timed(lambda: mesh_compute.python_partial(subset))
    print(f"python:   {python_s * len(points) / n:.1f} s extrapolated ({python_s:.2f} s for {n:,} vertices)")


main()
```

`tools/benchmarks/maya_mesh_compute.py`:

```python
"""Mesh compute benchmark for Maya: the same gather and maths as Lila's python/examples/mesh_compute_benchmark.py,
with the maths imported from mesh_compute.py beside this file so both apps time identical code.

    mayapy tools/benchmarks/maya_mesh_compute.py
    # or in Maya's script editor (Python): exec(open(r"X:/Lila/tools/benchmarks/maya_mesh_compute.py").read())

Measures the meshes already in the scene; with none, imports MAYA_BENCH_MESH (else DEFAULT) as OBJ first. Needs numpy
in Maya's Python (mayapy -m pip install numpy). MAYA_BENCH_DIR overrides where mesh_compute.py is found.
"""

import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor

DEFAULT = "X:/Tress/Art/Ship/Gen/manyships.obj"
SUBSET = 100_000

if os.path.basename(sys.executable).lower().startswith("mayapy"):
    import maya.standalone

    maya.standalone.initialize(name="python")

import numpy as np
import maya.api.OpenMaya as om
from maya import cmds


def _bench_dir():
    if os.environ.get("MAYA_BENCH_DIR"):
        return os.environ["MAYA_BENCH_DIR"]
    if globals().get("__file__"):
        return os.path.dirname(os.path.abspath(__file__))
    return "X:/Lila/tools/benchmarks"


sys.path.insert(0, _bench_dir())
import mesh_compute  # noqa: E402


def timed(fn):
    start = time.perf_counter()
    value = fn()
    return value, time.perf_counter() - start


def mesh_paths():
    out = []
    it = om.MItDependencyNodes(om.MFn.kMesh)
    while not it.isDone():
        fn = om.MFnDagNode(it.thisNode())
        if not fn.isIntermediateObject:
            out.append(fn.getPath())
        it.next()
    return out


def _raw_points(path):
    """API 1 MFnMesh.getRawPoints: a pointer to Maya's own float32 xyz buffer, read through ctypes without a per-point
    Python object. None when that route isn't available."""
    try:
        import ctypes

        import maya.OpenMaya as om1

        sel = om1.MSelectionList()
        sel.add(path.fullPathName())
        dag = om1.MDagPath()
        sel.getDagPath(0, dag)
        fn = om1.MFnMesh(dag)
        n = fn.numVertices()
        ptr = fn.getRawPoints()
        buf = (ctypes.c_float * (n * 3)).from_address(int(ptr))
        return np.ctypeslib.as_array(buf).reshape(n, 3).astype(np.float64)
    except Exception:
        return None


def _api2_points(path):
    """API 2 MFnMesh.getPoints, then numpy over the MPointArray: (n, 4) homogeneous, w dropped."""
    pts = om.MFnMesh(path).getPoints(om.MSpace.kObject)
    return np.array(pts, dtype=np.float64)[:, :3]


def gather(paths, route):
    arrays = [route(p) for p in paths]
    return arrays[0] if len(arrays) == 1 else np.concatenate(arrays)


def main():
    paths = mesh_paths()
    if not paths:
        path = os.environ.get("MAYA_BENCH_MESH") or DEFAULT
        cmds.loadPlugin("objExport", quiet=True)
        _, import_s = timed(lambda: cmds.file(path, i=True, type="OBJ", ignoreVersion=True, options="mo=1"))
        paths = mesh_paths()
        print(f"import {path}: {import_s:.2f} s, {len(paths)} mesh(es)")

    route, name = _api2_points, "MFnMesh.getPoints + np.array"
    if _raw_points(paths[0]) is not None:
        route, name = (lambda p: _raw_points(p)), "MFnMesh.getRawPoints + ctypes"
    points, gather_s = timed(lambda: gather(paths, route))
    print(f"vertices: {len(points):,}")
    print(f"gather:   {gather_s:.4f} s ({name})")
    if route is not _api2_points:
        _, api2_s = timed(lambda: gather(paths, _api2_points))
        print(f"gather:   {api2_s:.4f} s (MFnMesh.getPoints + np.array)")

    (mean, cov), numpy_s = timed(lambda: mesh_compute.compute(points))
    print(f"numpy:    {numpy_s:.3f} s  {mesh_compute.checksum(mean, cov)}")

    workers = os.cpu_count() or 4
    with ThreadPoolExecutor(max_workers=workers) as pool:
        mesh_compute.compute_threaded(points[: workers * 1024], pool, workers)
        (tmean, tcov), threaded_s = timed(lambda: mesh_compute.compute_threaded(points, pool, workers))
    print(f"threaded: {threaded_s:.3f} s  {mesh_compute.checksum(tmean, tcov)}  ({workers} workers)")

    n = min(SUBSET, len(points))
    subset = points[:n].tolist()
    _, python_s = timed(lambda: mesh_compute.python_partial(subset))
    print(f"python:   {python_s * len(points) / n:.1f} s extrapolated ({python_s:.2f} s for {n:,} vertices)")


main()
```
