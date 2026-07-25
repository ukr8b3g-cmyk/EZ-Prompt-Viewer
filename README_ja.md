# EZ Prompt Viewer

## 最新の変更点

- Krea2 Element Framing のメタデータ読み取りに対応
- Krea2 の色別に分かれたプロンプトを、1つのPositive promptとして表示
- Krea2 のNegative promptがメタデータ内にある場合は表示
- Krea2 BBOX のプロンプトスロット補完と、取得可能な BBOX / ポーズプリセット / プロンプトエフェクト / 背景エフェクト情報の表示に対応
- Forge Neo / reForge のWebP UserCommentから、`masterpiece`より前を含むPositive prompt全文を保持

<img width="1268" height="881" alt="image" src="https://github.com/user-attachments/assets/08f87802-4766-4c90-80f1-347f6dd9a0f4" />


EZ Prompt Viewer は、画像ファイルに保存された ComfyUI / A1111 のプロンプトメタデータを確認するための Windows デスクトップアプリです。

画像はローカル環境で処理されます。

現在のバージョン: **v1.0.1**

## ダウンロード

Windows インストーラは以下の Release からダウンロードできます。

[EZ Prompt Viewer v1.0.1 Release](https://github.com/ukr8b3g-cmyk/EZ-Prompt-Viewer/releases/tag/v1.0.1)

## 対応形式

- AVIF
- PNG
- JPEG / JPG
- WebP

## 主な機能

- ComfyUI / A1111 のメタデータ表示
- 単体画像、複数画像、フォルダのドラッグ＆ドロップ
- フォルダ内画像のサムネイル一覧表示
- サムネイルサイズ変更
- `Ctrl + マウスホイール` でサムネイル拡大縮小
- 前後ボタンでフォルダ内画像を切り替え
- スライドショー再生
- 画像クリックで拡大表示
- Positive prompt / Negative prompt / Settings / Summary を表示
- Krea2 BBOX のプロンプトスロット、BBOX、ポーズプリセット、プロンプトエフェクト、背景エフェクトをメタデータ内にある場合のみ表示
- Summary に ComfyUI workflow / A1111 metadata の有無を表示
- 各セクションの折りたたみ
- プロンプト、メタデータ、生成情報のコピー
- 表示テキストの編集と `.txt` 保存
- Model / LoRA ハッシュから Civitai リソース候補を表示
- 多言語UI
- カラーテーマ切り替え

## フォルダ読み込み

ドロップエリアは以下に対応しています。

- 単体画像
- 複数画像
- フォルダ

注意: 単体画像を1枚だけドロップして、その親フォルダ内の全画像を自動取得することはブラウザ/Electronの制限でできません。フォルダごとドロップするか、`Choose folder` を使ってください。

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

`Auto` は OS / ブラウザの言語をもとに自動選択します。対応外の場合は English に戻ります。

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

標準テーマは `Blue` です。

## Format Prompt

`Format Prompt` は、タグ形式のプロンプトを整形する機能です。

主に SDXL anime、anime-style checkpoint、booru-style prompting のような、カンマ区切りタグのワークフロー向けです。

実行内容:

- 余分なスペースやカンマを整理
- 連続スペースを1つにする
- 括弧やカンマの位置を補正
- 同じ行の重複タグを削除
- アンダースコア `_` をスペースに置換
- 改行を維持
- 必要な行末にカンマを追加
- プロンプト末尾にはカンマを付けない
- 日本語・中国語などの2バイト文字は変更しない

## 推奨 ComfyUI ノード

ComfyUI ワークフローでは、[ComfyUI-save-webp-meta-node](https://github.com/ukr8b3g-cmyk/ComfyUI-save-webp-meta-node) との併用を推奨します。

この説明は、そのノードで保存された WebP ファイルに限定した互換性メモです。

確認済みサンプル:

- SDXL
- Illustrious-XL
- Anima
- Qwen-Image
- Qwen-Image-Edit
- Z-image
- Ernie-Image
- Microsoft Lens
- Flux.Klein 

## 注意

- Windows ローカルデスクトップアプリとしての利用を想定しています。
- Civitai 照合にはネットワーク接続が必要です。
- 読めるメタデータは画像の保存方法に依存します。
- 画像ファイル自体を書き換える機能はありません。

## 仕様

詳細は [SPEC.md](SPEC.md) を参照してください。
