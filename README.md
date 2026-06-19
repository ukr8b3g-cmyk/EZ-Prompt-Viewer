# EZ Prompt Viewer

EZ Prompt Viewer is a local Windows desktop app for viewing ComfyUI and A1111 prompt metadata from image files.

Images are processed locally on your machine.

## Supported Formats

- AVIF
- PNG
- JPEG / JPG
- WebP

## Main Features

- Read ComfyUI and A1111 metadata from image files
- Drag and drop a single image, multiple images, or a folder
- Choose a folder and browse supported images as thumbnails
- Resize thumbnails with the slider or `Ctrl + mouse wheel`
- Navigate folder images with previous / next buttons
- Run a simple slideshow for folder images
- Click the preview image to enlarge it
- View positive prompt, negative prompt, settings, summary, and metadata records
- Show ComfyUI workflow and A1111 metadata status in Summary
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

Note: dropping one image cannot automatically read every file in its parent folder because of browser/Electron security restrictions. Drop the folder itself, or use `Choose folder`.

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
- Blue
- Christmas

Default theme: `Blue`.

## Format Prompt

`Format Prompt` cleans tag-based prompts, mainly for SDXL anime, anime-style checkpoints, and booru-style prompting.

It can:

- Remove extra spaces and commas
- Collapse repeated spaces into one space
- Fix misplaced brackets and commas
- Remove duplicate tags within the same line
- Replace underscores (`_`) with spaces
- Preserve line breaks
- Add commas at line breaks when needed
- Avoid adding a comma at the end of the prompt
- Leave Japanese, Chinese, and other double-byte text unchanged

Examples:

- `1girl,   solo, smile, 1girl` -> `1girl, solo, smile`
- `masterpiece\nbest quality\n1girl` -> `masterpiece,\nbest quality,\n1girl`
- `a girl smiling, a girl standing` -> unchanged

## Recommended ComfyUI Node

For ComfyUI workflows, using [ComfyUI-save-webp-meta-node](https://github.com/ukr8b3g-cmyk/ComfyUI-save-webp-meta-node) together with EZ Prompt Viewer is recommended.

This note applies specifically to WebP files saved with that node. Confirmed sample files include workflows such as:

- SDXL
- Illustrious XL
- Anime-style workflows
- Qwen-Image 2512
- Qwen-Image-Edit 2511
- ZIT / Z Image workflows, including `z-image-turbo` and `z-image-base`
- `Ernie-Image-Turbo`
- `Ernie-Image`
- Microsoft Lens
- Flux / Klein workflows

Supported metadata may include positive prompts, negative prompts, generation settings, ComfyUI workflow data, model names, seeds, steps, sampler information, image size, and related prompt graph information.

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

Latest generated installer in this workspace:

```text
D:\Codex\ComfyUI\avif-prompt-viewer-app\dist-release-20260619-185612\EZ Prompt Viewer Setup.exe
```

## Notes

- The app is intended for local Windows desktop use.
- Civitai lookup requires network access.
- Metadata availability depends on how the image was saved.
- Canvas-based image re-export is not used, so this app does not rewrite image files.

## Specification

See [SPEC.md](SPEC.md).
