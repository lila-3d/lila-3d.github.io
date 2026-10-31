# C++ extensions

> For Python extensions, see [lila.extension](python/lila.extension.md). Both register into the same places Lila's own features do.

## Get it working

You need the Lila SDK package for your Lila version, MSVC 2022 and CMake 3.28 or later. UI extensions also need the exact Qt version Lila uses.

1. Make a folder with three files.

`extension.json`:

```json
{
    "id": "hello",
    "name": "Hello",
    "version": "1.0.0",
    "sdk": "1.0",
    "entry": {"windows": "hello.dll"}
}
```

`CMakeLists.txt`:

```cmake
cmake_minimum_required(VERSION 3.28)
project(Hello CXX)
find_package(LilaSDK 1.0 REQUIRED)
lila_add_extension(hello ID hello MANIFEST extension.json SOURCES Hello.cpp)
```

`Hello.cpp`:

```cpp
#include <lila/Command.h>
#include <lila/Extension.h>

using namespace lila;

LILA_EXTENSION_EXPORT int lilaExtensionInit(ext::Context& ctx)
{
    CommandDef hello{
        .name = "helloExtension",
        .doc = "Say hello from a C++ extension.",
        .undoable = false,
        .run = [](const Args&) -> json { return "Hello"; },
    };
    return ctx.registerCommand(std::move(hello)) ? 0 : 1;
}
```

2. Build it:

```
cmake -S . -B build -G Ninja -DCMAKE_PREFIX_PATH=<sdk folder>
cmake --build build
```

This writes the package `build/<config>/extensions/hello.lilaext/`, holding the manifest and the DLL.

3. Copy `hello.lilaext` into `%APPDATA%/Lila/extensions` (or point `LILA_EXTENSION_PATH` at the build's `extensions` folder), then run `loadExtension("hello")` in the script editor, or enable it in **Windows > Extension Manager**.

4. Run `helloExtension()`. It returns `'Hello'`.

Everything registered through `ctx` belongs to the extension and is removed when it unloads. The SDK's `examples` folder has more: node types, a viewport drawer and a UI mode. For worker threads, background jobs and TBB, see [Threads and big meshes](python-threads.md#c-extensions).

### Rebuilding while Lila runs

Windows locks a loaded DLL, so unload before you build: `unloadExtension("hello")`, build, then `loadExtension("hello")`. Unloading fails while the scene uses the extension's node types.

## Troubleshooting

**"built for SDK 2.0, but this Lila provides SDK 1.3 (the major version must match)".** Rebuild against the SDK package for your Lila version.

**"built for SDK 1.4, newer than this Lila's SDK 1.2".** The extension uses SDK additions this Lila doesn't have. Update Lila, or build against the older SDK.

**"does not export lilaExtensionSdkVersion".** A source file must include `<lila/Extension.h>`, which exports it.

**"could not load ...: The specified module could not be found".** A DLL the extension needs isn't next to it or on the PATH. Put its own dependencies in the package folder beside its DLL.

**"failed to initialize (code N)".** `lilaExtensionInit` returned N. Anything other than 0 is a failure, and Lila unloads it.

**The configure step fails with "includes Lila's internal header".** Include only `<lila/...>` headers. The rest of Lila's headers can change in any release.

**Crashes on load or when calling into Lila.** The extension was built with a different compiler, toolset or Qt version. C++ types such as `std::string`, `std::function` and Qt objects cross between Lila and the extension, so they must match exactly. The SDK's CMake warns when they don't.

## Compatibility

The SDK has a `major.minor` version, and the extension records the one it was built against. Lila checks it before running any of the extension's code:

- **Minor releases** only add to the SDK, so an extension built for 1.0 loads in any 1.x.
- **Major releases** can change it, so extensions need rebuilding.

The SDK is C++, not a C ABI. Binding it from another language means handling `std::string`, `std::function`, `nlohmann::json` and glm types with MSVC's layout.

## Options

`extension.json` fields:

| Field | Required | What it does |
| --- | --- | --- |
| `id` | Yes | Letters, digits, `_`, `-` and `.`. The package folder must be `<id>.lilaext`. |
| `version` | Yes | Your extension's version. |
| `sdk` | Yes | The SDK version it was built against, `"major.minor"`. |
| `entry` | One of `entry` or `python` | The DLL, as a path or `{"windows": ..., "linux": ..., "macos": ...}`. |
| `python` | One of `entry` or `python` | A Python module in the package, loaded alongside or instead of the DLL. |
| `resources` | No | Folder of icons, presets and other files. Defaults to `resources`. |
| `usdPlugins` | No | Folders of USD plugins, such as a Hydra render delegate for the viewport's Renderer menu. See [Viewport renderers](viewport-renderers.md). |
| `dependencies` | No | Extension ids, or `{"id": ..., "version": ...}`, loaded first. |
| `enabledByDefault` | No | Load at startup without the user enabling it. |
| `name`, `vendor`, `description` | No | Shown in the Extension Manager. |

`lila_add_extension(<target> ID <id> MANIFEST <file> SOURCES ... [RESOURCES <dir>] [UI] [OUTPUT_DIR <dir>])`: `UI` links Lila's UI library and Qt, for panels and other UI. `RESOURCES` copies a folder into the package.

Lila looks for packages in these folders, in order: `LILA_EXTENSION_PATH` (separated by `;`), the folders listed under `/extensions/paths` in `%APPDATA%/Lila/prefs/general.json`, `<workspace>/.lila/extensions`, `%APPDATA%/Lila/extensions`, and the `extensions` folder beside `lila.exe`. `listExtensions(searchPaths=True)` prints them.

`lilaExtensionUninit(ext::Context&)` is optional: export it to free the extension's own state when it unloads.
