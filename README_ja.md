# EZ Prompt Viewer

**言語:** [English](README.md) | 日本語

EZ Prompt Viewer は、画像ファイルに保存された ComfyUI / A1111 のプロンプト・生成メタデータを確認するための Windows デスクトップアプリです。

画像はローカル環境で処理されます。

現在のバージョン: **v1.1.0**

## v1.1.0 主な変更

- **Krea2** の正式メタデータ対応を追加
- **Qwen Image 2.1** の正式メタデータ対応を追加
- ComfyUI参照を「Node ID」だけでなく **Node ID + Output Slot** で追跡する resolver を追加
- `TextEncodeQwenImage21` の Positive / Negative を output slot 0 / 1 で正しく分離
- `ComfySwitchNode` を通るQwen Image 2.1プロンプト経路に対応
- 実際に使用されている Model / Text Encoder / VAE / LoRA / Sampler / Scheduler / Denoise / Size / Seed / Steps / CFG を抽出
- Structured JSON Promptを `Format Prompt` で壊さない保護を追加
- Krea2 Element Framing / BBOX メタデータ解析を改善
- フォルダD&D、画像切替、Object URL解放、外部URL処理などの保守修正
- Windowsビルド環境を **Electron 44.4.5 / electron-builder 26.16.1** に更新

<img width="1268" height="881" alt="EZ Prompt Viewer" src="https://github.com/user-attachments/assets/08f87802-4766-4c90-80f1-347f6dd9a0f4" />

## ダウンロード

- [EZ Prompt Viewer v1.1.0 Release](https://github.com/ukr8b3g-cmyk/EZ-Prompt-Viewer/releases/tag/v1.1.0)
- [Windows インストーラ (EXE)](https://github.com/ukr8b3g-cmyk/EZ-Prompt-Viewer/releases/download/v1.1.0/EZ-Prompt-Viewer-Setup.exe)

旧バージョンは [Releases ページ](https://github.com/ukr8b3g-cmyk/EZ-Prompt-Viewer/releases) から引き続き取得できます。

## 対応画像形式

- AVIF
- PNG
- JPEG / JPG
- WebP

## 確認済みメタデータ / ワークフロー

画像内に保存されている ComfyUI の prompt / workflow、A1111形式Parametersを読み取ります。

確認済み例:

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
- Forge Neo / reForge WebP UserComment

実際に表示できる情報は、保存ノードやアプリが画像へ埋め込んだメタデータに依存します。

## Krea2対応

Krea2では以下を取得できます。

- Positive Prompt
- Negativeなし / ZeroOut conditioningの判定
- 実使用Modelの追跡
- Text Encoder / VAE
- 有効なLoRA
- Sampler / Scheduler / Denoise
- Seed / Steps / CFG / Size
- Krea2 Element FramingのStructured Prompt
- BBOX prompt slot
- 取得可能なPose preset / Prompt effect / Background effect

## Qwen Image 2.1対応

Qwen Image 2.1では以下に対応しています。

- `TextEncodeQwenImage21`
- output slotによるPositive / Negativeの正確な分離
- `ComfySwitchNode`を通るPrompt routing
- 上流String Node / Structured JSON Promptの解決
- Model / Qwen Text Encoder / VAE
- Seed / Steps / CFG / Sampler / Scheduler / Denoise / Size
- Structured JSON Promptの保持

ComfyUI API prompt graphが存在する場合、Qwen Image 2.1ではこれをPositive / Negative判定の優先情報として扱います。

## ComfyUI保存ノード

### Core Save Image / Save Image Advanced

ComfyUI Coreの `Save Image` / `Save Image Advanced` が標準の `prompt` / `workflow` メタデータを画像へ保存している場合、そのまま読み取りできます。

PNGでは通常PNGテキストメタデータとして保存されます。ComfyUI側でmetadata保存を無効化している場合は取得できません。

### ComfyUI-save-webp-meta-node

WebP / EXIF形式でメタデータを保持したい場合は、[ComfyUI-save-webp-meta-node](https://github.com/ukr8b3g-cmyk/ComfyUI-save-webp-meta-node) を利用できます。

通常のComfyUI PNGを読むための必須ノードではありません。

## 主な機能

- ComfyUI / A1111 メタデータ表示
- 単体画像、複数画像、フォルダのドラッグ＆ドロップ
- フォルダ内画像のサムネイル一覧
- サムネイルサイズ変更
- `Ctrl + マウスホイール` でサムネイル拡大縮小
- 前後ボタンで画像切替
- スライドショー
- 画像クリックで拡大表示
- Positive Prompt / Negative Prompt / Settings / Summary / Raw Metadata表示
- 各セクションの折りたたみ
- プロンプト・設定・生成情報のコピー
- 表示テキスト編集と `.txt` 保存
- Model / LoRA hashからCivitaiリソース候補を表示
- 多言語UI
- カラーテーマ切替

## フォルダ読み込み

ドロップエリアは以下に対応しています。

- 単体画像
- 複数画像
- フォルダ

単体画像を1枚ドロップしただけでは、ブラウザ/Electronのセキュリティ制限により親フォルダの全ファイルを自動列挙できません。フォルダ自体をドロップするか、`Choose folder` を使用してください。

## 言語

- Auto
- English
- Chinese (Simplified)
- Chinese (Traditional)
- Japanese
- Korean
- Spanish
- French
- German

`Auto` はOS / ブラウザの言語を使用し、対応外の場合はEnglishへフォールバックします。

## テーマ

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

標準テーマ: `Blue`

## Format Prompt

`Format Prompt` は主にSDXL anime / anime-style checkpoint / booru系のカンマ区切りタグを整形します。

- 余分なスペース・カンマを整理
- 連続スペースを整理
- 括弧・カンマ位置を補正
- 同一行の重複タグを削除
- アンダースコアをスペースへ変換
- 改行を維持
- プロンプト末尾へ不要なカンマを追加しない
- 日本語・中国語などの2バイト文字を変更しない
- Structured JSON Promptは構造を変更せず保持

## ビルド

依存関係をインストール:

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

## 注意

- Windowsローカルデスクトップアプリとしての利用を想定しています。
- Civitai照合にはネットワーク接続が必要です。
- 読み取れる情報は画像に保存されたメタデータに依存します。
- 元画像を書き換える機能はありません。
- コード署名証明書を設定していないビルドは未署名です。

## 仕様

詳細は [SPEC.md](SPEC.md) を参照してください。

## 解析修正と Designer 対応

メタデータの採用元を統一し、文字化け、有効でない Switch 分岐の混入、
JSON の解析前切り詰めを修正しました。古いフォルダ読込や Civitai 照合は
新しい操作で取り消され、手動編集は言語変更・整形後も維持されます。
フォルダ表示の解析キャッシュは 32 件・8 MiB を上限とし、サムネイルを遅延読込します。

H3 旧版 / Reference と Qwen Image 2.1 Character Sheet Designer の保存状態
`state_json` から、固定した公式コンパイラー版に基づいて本文を再構築できます。
公式サブグラフ、H3 の BasicGuider → SamplerCustomAdvanced 経路にも対応します。
Summary に「再構築」とコンパイラー版を表示します。生成時に実行された版が不明な場合、
実際の出力との完全一致を保証するものではありません。メタデータのない画像からは復元できません。

HTML を単体で開く場合も、同じフォルダに `designer_adapters.js` と
`workflow_adapter.js` を置いてください。
詳細は [Designer の対応範囲](docs/designer-compatibility.md) と
[ワークフロー解析](docs/workflow-adapter.md) を参照してください。

開発時は `npm run check`、`npm test`、`npm run test:browser` を利用できます。
`DESIGNER_EXHAUSTIVE=1` を指定したテストは、Python 3 で公式実装との
1,339 ケース・4,017 出力の比較も実行します。
main の CI は回帰テスト・Chromium 表示確認・Windows 展開形式ビルドを確認します。
このビルド確認ではインストーラーやリリースは公開しません。
