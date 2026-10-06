# EZ Prompt Viewer

**Languages:** English | [日本語](README_ja.md)

EZ Prompt Viewer is a local Windows desktop app for viewing prompt and generation metadata stored in image files. Images are processed locally on your machine.

Current version: **v1.1.0**

## v1.1.0 Highlights

- Added first-class **Krea2** metadata support.
- Added **Qwen Image 2.1** metadata support.
- Added an output-slot-aware ComfyUI graph resolver, so dual-output nodes such as `TextEncodeQwenImage21` correctly separate Positive and Negative prompts.
- Added active-path resolution for model, text encoder, VAE, sampler, scheduler, denoise, image size, seed, steps, CFG, and active LoRA information.
- Added support for Qwen Image 2.1 prompt paths that pass through `ComfySwitchNode` and upstream string nodes.
- Preserved structured JSON prompts when using `Format Prompt`.
- Improved Krea2 Element Framing / BBOX metadata handling.
- Improved file loading stability, folder drag-and-drop handling, preview object URL cleanup, and external URL safety.
- Updated the Windows build stack to **Electron 44.4.5** and **electron-builder 26.16.1**.

<img width="1268" height="881" alt="EZ Prompt Viewer" src="https://github.com/user-attachments/assets/f9416ab2-c09c-4e81-a45d-0ebb464fe1fe" />

## Download

- [EZ Prompt Viewer v1.1.0 Release](https://github.com/ukr8b3g-cmyk/EZ-Prompt-Viewer/releases/tag/v1.1.0)
- [Windows Installer (EXE)](https://github.com/ukr8b3g-cmyk/EZ-Prompt-Viewer/releases/download/v1.1.0/EZ-Prompt-Viewer-Setup.exe)

Older releases remain available from the [Releases page](https://github.com/ukr8b3g-cmyk/EZ-Prompt-Viewer/releases).

## Supported Image Formats

- AVIF
- PNG
- JPEG / JPG
- WebP

## Confirmed Metadata / Workflow Support

EZ Prompt Viewer reads ComfyUI prompt/workflow metadata and A1111-style parameters when they are embedded in the image.

Confirmed examples include:

- Krea2
- Qwen Image 2.1
- Qwen-Image / Qwen-Image-Edit
- SDXL
- Illustrious-XL
- Anima
- ZIT / Z-Image
- Ernie-Image / Turbo
- Microsoft Lens
- Flux.Klein
- Forge Neo / reForge WebP UserComment metadata

Support depends on the metadata actually stored by the save node or application.

## Krea2

Krea2 support includes:

- Positive prompt extraction
- Empty / zeroed Negative conditioning handling
- Active model path detection
- Text encoder and VAE detection
- Active LoRA extraction
- Sampler / scheduler / denoise / seed / steps / CFG / size
- Krea2 Element Framing structured prompt display
- BBOX prompt slots
- Pose preset, prompt effect, and background effect information when available

## Qwen Image 2.1

Qwen Image 2.1 support includes:

- `TextEncodeQwenImage21`
- Correct Positive / Negative separation by output slot
- `ComfySwitchNode` prompt routing
- Upstream string / structured JSON prompt resolution
- Model, Qwen text encoder, and VAE detection
- Seed / steps / CFG / sampler / scheduler / denoise / size
- Structured JSON prompt preservation

For Qwen Image 2.1, the ComfyUI API prompt graph is treated as the authoritative source when available. This avoids incorrect Positive/Negative classification from fallback metadata.

## ComfyUI Save Nodes

### Core Save Image / Save Image Advanced

ComfyUI Core `Save Image` and `Save Image Advanced` are supported when the output file contains the standard `prompt` / `workflow` metadata.

For PNG, this is normally stored as PNG text metadata unless metadata saving has been disabled.

### ComfyUI-save-webp-meta-node

For WebP / EXIF-oriented workflows, [ComfyUI-save-webp-meta-node](https://github.com/ukr8b3g-cmyk/ComfyUI-save-webp-meta-node) can be used to preserve ComfyUI graph/workflow metadata and A1111-style parameters.

It is optional; it is not required for normal ComfyUI PNG metadata.

## Main Features

- Read ComfyUI and A1111 metadata from image files
- Drag and drop a single image, multiple images, or a folder
- Choose a folder and browse supported images as thumbnails
- Resize thumbnails with the slider or `Ctrl + mouse wheel`
- Navigate folder images with previous / next buttons
- Run a simple slideshow for folder images
- Click the preview image to enlarge it
- View Positive prompt, Negative prompt, Settings, Summary, and raw metadata records
- Collapse and expand metadata sections
- Copy prompts, settings, or all visible generation data
- Edit displayed text and save it as a `.txt` file
- Look up Civitai resources from detected model and LoRA hashes
- Use multilingual UI and selectable color themes

## Folder Loading

The drop area supports:

- Single image drop
- Multiple image drop
- Folder drop

Dropping one image cannot automatically enumerate every file in its parent folder because of browser/Electron security restrictions. Drop the folder itself, or use `Choose folder`.

## Language Options

- Auto
- English
- Chinese (Simplified)
- Chinese (Traditional)
- Japanese
- Korean
- Spanish
- French
- German

`Auto` uses the browser or OS language when available and falls back to English.

## Theme Options

- Blue
- Dark
- Gray
- Light
- Neon
- Cyberpunk
- Synthwave
- Black
- Crimson
- Inferno
- Radioactive
- Candy
- Yellow
- Christmas

Default theme: `Blue`.

## Format Prompt

`Format Prompt` cleans tag-based prompts, mainly for SDXL anime, anime-style checkpoints, and booru-style prompting.

It can:

- Remove extra spaces and commas
- Collapse repeated spaces
- Fix misplaced brackets and commas
- Remove duplicate tags within the same line
- Replace underscores with spaces
- Preserve line breaks
- Avoid adding a comma at the end of the prompt
- Leave Japanese, Chinese, and other double-byte text unchanged
- Preserve structured JSON prompts without rewriting their structure

## Build

Install dependencies:

```powershell
npm install
```

Run the app:

```powershell
npm start
```

Build the Windows installer:

```powershell
npm run build
```

## Notes

- Intended for local Windows desktop use.
- Civitai lookup requires network access.
- Metadata availability depends on how the image was saved.
- The app does not rewrite the source image.
- The current Windows installer is unsigned unless a code-signing certificate is configured.

## Specification

See [SPEC.md](SPEC.md).

## Metadata correctness and Designer compatibility

The viewer now selects one canonical metadata candidate, keeps valid Unicode,
uses only active ComfyUI switch paths, and parses complete bounded JSON before
applying display limits. Folder/Civitai requests are cancelled when superseded;
manual edits survive language changes and formatting. Folder browsing uses a
32-entry / 8 MiB metadata cache and lazy thumbnails.

H3 legacy, H3 Reference, and Qwen Image 2.1 Character Sheet Designer prompts can
be reconstructed locally from saved `state_json`, including the official native
subgraph workflows and H3's BasicGuider → SamplerCustomAdvanced path. The Summary
explicitly marks reconstructed text and its pinned compiler version. This is not
proof of the exact prompt executed by an unknown installed compiler version.
A metadata-free image cannot supply the missing prompt.

Keep `designer_adapters.js` and `workflow_adapter.js` beside the HTML when using
it outside the packaged app. See [Designer contracts and pinned sources](docs/designer-compatibility.md)
and [workflow/link handling](docs/workflow-adapter.md).

### Development checks

- `npm ci` installs the locked development dependencies
- `npm run check` checks runtime syntax and required script resources
- `npm test` runs parser, container, UI-state, workflow and Designer tests
- `DESIGNER_EXHAUSTIVE=1 npm test` also compares 1,339 cases / 4,017 outputs against
  the bundled pinned Python compiler fixtures (Python 3 required)
- `CHROME_PATH=/path/to/chrome npm run test:browser` checks the actual HTML in
  Chromium using synthetic PNG metadata, without external network access
- `npm run build:check` builds the unpacked Windows app; it does not publish a
  release or create an installer

Main-branch CI runs the exhaustive suite and browser smoke on Linux and checks
Windows packaging, including both adapter resources. Synthetic metadata tests
are not a ComfyUI/GPU-generation test or validation of an original user image.
