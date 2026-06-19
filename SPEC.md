# EZ Prompt Viewer Specification

## English

### Overview

EZ Prompt Viewer is a local Windows desktop app for viewing ComfyUI and A1111 prompt metadata from image files.

The app is an Electron wrapper around `avif_prompt_viewer.html`. Image parsing is handled locally in the app UI.

### Supported Image Formats

- AVIF
- PNG
- JPEG / JPG
- WebP

### Core Features

- Load a single image from the file picker
- Drag and drop a single image, multiple images, or a folder
- Choose a folder and browse supported images as thumbnails
- Resize thumbnails with the slider
- Resize thumbnails with `Ctrl + mouse wheel`
- Navigate folder images with previous / next buttons
- Run a simple slideshow for folder images
- Preview the selected image
- Click the preview image to enlarge it
- Show Summary, Prompt, Negative prompt, and Other metadata sections
- Show ComfyUI workflow and A1111 metadata status in Summary
- Collapse and expand metadata sections
- Copy prompt, negative prompt, metadata, or all visible generation data
- Edit displayed text and save it as a `.txt` file
- Look up Civitai resources from detected model and LoRA hashes
- Switch UI language
- Switch color theme

### Supported Languages

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

### Themes

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

Existing saved `Dark` preferences are migrated to `Blue` once by the app's default-theme migration logic.

### Folder Loading

Supported input methods:

- Single image drop
- Multiple image drop
- Folder drop
- Folder picker

Security restriction:

- Dropping one image cannot automatically list every file in its parent folder.
- To browse a folder, drop the folder itself or use `Choose folder`.

### Slideshow

- Available only when multiple folder images are loaded
- Disabled for a single image
- Loops from the last image back to the first image
- Interval can be set from the UI

### Prompt Formatting

`Format Prompt` is intended for tag-based prompts, especially SDXL anime, anime-style checkpoints, and booru-style prompting.

It can:

- Remove extra spaces and commas
- Collapse repeated spaces into one space
- Fix misplaced brackets and commas
- Remove duplicate tags within the same line
- Replace underscores with spaces
- Preserve line breaks
- Add commas at line breaks when needed
- Avoid adding a comma at the end of the prompt
- Leave Japanese, Chinese, and other double-byte text unchanged

Sentence-style prompts are not the main target and may be left unchanged.

### Metadata Parsing

The app scans metadata candidates from:

- PNG `tEXt`
- PNG `iTXt`
- JPEG EXIF
- JPEG XMP
- JPEG Comment
- WebP EXIF
- WebP XMP
- EXIF UserComment
- ISOBMFF / AVIF metadata candidates
- UTF-8 text
- Latin1 text
- UTF-16LE text
- UTF-16BE text
- NULL-padded text

### A1111 Parsing

A1111-style metadata is split into:

- Positive prompt
- Negative prompt
- Settings

Common markers:

- `Negative prompt:`
- `Steps:`
- `Sampler:`
- `CFG scale:`
- `Seed:`
- `Model hash:`
- `Lora hashes:`

### ComfyUI Parsing

ComfyUI workflow or prompt graph data is detected from graph-like metadata.

Common keys:

- `class_type`
- `inputs`
- `outputs`
- `widgets_values`
- `links`

The app extracts useful prompt text and common settings when possible.

### Civitai Lookup

Civitai lookup uses detected hashes such as:

- `Model hash`
- `Lora hashes`

API endpoint:

```text
https://civitai.com/api/v1/model-versions/by-hash/{hash}
```

Civitai lookup requires network access.

### Recommended ComfyUI Node

For ComfyUI workflows, using [ComfyUI-save-webp-meta-node](https://github.com/ukr8b3g-cmyk/ComfyUI-save-webp-meta-node) together with EZ Prompt Viewer is recommended.

This compatibility note applies specifically to WebP files saved with that node.

Confirmed sample workflows include:

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

### Removed / Not Included

The app does not currently include:

- Histogram display
- Color picker
- Model-format estimation display
- Image format conversion
- Metadata-preserving image export
- Metadata stripping export

### Build

Install dependencies:

```powershell
npm install
```

Run:

```powershell
npm start
```

Build Windows installer:

```powershell
npm run build
```

### Runtime

- Windows 10 / 11
- x64
- Internet access is required only for Civitai lookup and release download

---

## 日本語

### 概要

EZ Prompt Viewer は、画像ファイルに保存された ComfyUI / A1111 のプロンプトメタデータを確認するための Windows デスクトップアプリです。

Electron で `avif_prompt_viewer.html` を表示する構成です。画像解析はアプリUI内でローカル処理されます。

### 対応画像形式

- AVIF
- PNG
- JPEG / JPG
- WebP

### 主な機能

- ファイル選択から単体画像を読み込み
- 単体画像、複数画像、フォルダのドラッグ＆ドロップ
- フォルダ選択によるサムネイル一覧表示
- スライダーでサムネイルサイズ変更
- `Ctrl + マウスホイール` でサムネイルサイズ変更
- 前後ボタンでフォルダ内画像を切り替え
- フォルダ画像のスライドショー
- 選択画像のプレビュー
- 画像クリックで拡大表示
- Summary、Prompt、Negative prompt、Other metadata を表示
- Summary に ComfyUI workflow / A1111 metadata の有無を表示
- メタデータセクションの折りたたみ
- Prompt、Negative prompt、metadata、全生成情報のコピー
- 表示テキストの編集と `.txt` 保存
- Model / LoRA ハッシュから Civitai リソース候補を照合
- UI言語切り替え
- カラーテーマ切り替え

### 対応言語

- Auto
- English
- Chinese (Simplified)
- Chinese (Traditional)
- Japanese
- Korean
- Spanish
- French
- German

`Auto` は OS / ブラウザ言語を利用し、未対応の場合は English に戻ります。

### テーマ

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

デフォルトテーマは `Blue` です。

保存済みの `Dark` 設定は、アプリ側の移行処理により一度だけ `Blue` に移行されます。

### フォルダ読み込み

対応する読み込み方法:

- 単体画像ドロップ
- 複数画像ドロップ
- フォルダドロップ
- フォルダ選択

制限:

- 単体画像を1枚だけドロップして、その親フォルダ内の全ファイルを自動列挙することはできません。
- フォルダを見たい場合は、フォルダ自体をドロップするか `Choose folder` を使います。

### スライドショー

- 複数のフォルダ画像が読み込まれている場合のみ有効
- 単体画像では無効
- 最後の画像の次は先頭に戻ります
- 間隔はUIから設定できます

### Prompt整形

`Format Prompt` はタグ形式プロンプト向けです。主に SDXL anime、anime-style checkpoint、booru-style prompting を想定しています。

実行内容:

- 余分なスペースやカンマを整理
- 連続スペースを1つにする
- 括弧やカンマの位置を補正
- 同じ行の重複タグを削除
- アンダースコアをスペースに置換
- 改行を維持
- 必要な改行位置にカンマを追加
- プロンプト末尾にはカンマを付けない
- 日本語・中国語などの2バイト文字は変更しない

文章形式プロンプトは主対象ではなく、変更されない場合があります。

### メタデータ解析

主な解析対象:

- PNG `tEXt`
- PNG `iTXt`
- JPEG EXIF
- JPEG XMP
- JPEG Comment
- WebP EXIF
- WebP XMP
- EXIF UserComment
- ISOBMFF / AVIF 内のメタデータ候補
- UTF-8 text
- Latin1 text
- UTF-16LE text
- UTF-16BE text
- NULL混じり文字列

### A1111解析

A1111形式のメタデータは以下へ分割します。

- Positive prompt
- Negative prompt
- Settings

主な判定マーカー:

- `Negative prompt:`
- `Steps:`
- `Sampler:`
- `CFG scale:`
- `Seed:`
- `Model hash:`
- `Lora hashes:`

### ComfyUI解析

ComfyUI workflow または prompt graph らしいメタデータを検出します。

主なキー:

- `class_type`
- `inputs`
- `outputs`
- `widgets_values`
- `links`

取得可能な場合は、プロンプト本文や主要設定を抽出します。

### Civitai照合

Civitai照合は以下のようなハッシュを使います。

- `Model hash`
- `Lora hashes`

API endpoint:

```text
https://civitai.com/api/v1/model-versions/by-hash/{hash}
```

Civitai照合にはネットワーク接続が必要です。

### 推奨ComfyUIノード

ComfyUI ワークフローでは、[ComfyUI-save-webp-meta-node](https://github.com/ukr8b3g-cmyk/ComfyUI-save-webp-meta-node) との併用を推奨します。

この互換性メモは、そのノードで保存された WebP ファイルに限定します。

確認済みサンプル:

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

### 廃止 / 未搭載

現在は以下を搭載していません。

- ヒストグラム表示
- カラーピッカー
- モデルフォーマット推定表示
- 画像形式変換
- メタデータ保持画像書き出し
- メタデータ除去画像書き出し

### ビルド

依存関係:

```powershell
npm install
```

起動:

```powershell
npm start
```

Windowsインストーラ作成:

```powershell
npm run build
```

### 動作環境

- Windows 10 / 11
- x64
- Civitai照合とReleaseダウンロード時のみインターネット接続が必要
