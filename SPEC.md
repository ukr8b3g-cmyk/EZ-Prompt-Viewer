# EZ Prompt Viewer 仕様・説明

## 概要

EZ Prompt Viewer は、画像ファイルに埋め込まれた生成AIプロンプト情報を確認するWindows向けのローカルアプリです。

主に Stable Diffusion / A1111 / ComfyUI 系の画像メタデータを読み取り、プロンプト、ネガティブプロンプト、生成設定、Civitaiリソース候補を見やすく表示します。

## 目的

- 生成画像に埋め込まれたプロンプトをすばやく確認する
- A1111形式の画像かどうか判定する
- ComfyUIワークフロー情報が含まれているか判定する
- モデルやLoRAのハッシュからCivitaiリソースを照合する
- 画像とメタデータをローカルで確認し、必要な情報をコピーする

## 対応形式

- AVIF
- PNG
- JPEG / JPG
- WebP

## 主な機能

### 画像読み込み

- 画像選択ボタンから読み込み
- ドラッグ&ドロップで読み込み
- 画像ファイルはブラウザ/Electron内で処理

### 画像プレビュー

- 左側に画像を表示
- 画像クリックで拡大表示
- 拡大表示は画像クリック、背景クリック、Escキーで閉じる

### メタデータ表示

表示項目:

- Prompt
- Negative prompt
- Other metadata
- Info
- Civitai resources

各ブロックはクリックで折りたたみ可能です。

### コピー機能

- Promptのみコピー
- Negative promptのみコピー
- Other metadataのみコピー
- すべてコピー

### 判定機能

Info欄に以下を表示します。

- `ComfyUI workflow: あり/なし`
- `A1111 metadata: あり/なし`

### Civitai照合

画像メタデータ内の以下を読み取り、Civitai APIへ照合します。

- `Model hash`
- `Lora hashes`

照合結果として表示する内容:

- モデル名
- バージョン名
- モデル種別
- ハッシュ
- Civitaiページへのリンク
- サムネイル画像

サムネイルはWebP URLを優先し、読み込みに失敗した場合は元画像URLへフォールバックします。
サムネイル画像はアプリ内に保存しません。
Thumbnail images are not saved by the app.

## メタデータ解析

対応している主な埋め込み形式:

- PNG tEXt / iTXt
- JPEG EXIF / XMP / Comment
- WebP EXIF / XMP
- EXIF UserComment
- UTF-8
- Latin1
- UTF-16LE
- UTF-16BE
- NULL混じり文字列
- AVIF内のメタデータ候補

## A1111形式の分割

A1111系の文字列は以下の3項目へ分割します。

- Positive prompt
- Negative prompt
- Settings

主な分割基準:

- `Negative prompt:`
- `Steps:`
- `Sampler:`
- `CFG scale:`
- `Seed:`
- `Model hash:`

## ComfyUI判定

ComfyUIのワークフローまたはAPIグラフらしい情報がある場合に `あり` と判定します。

判定に使う主なキー:

- `class_type`
- `inputs`
- `outputs`
- `widgets_values`
- `links`

ワークフロー本文は表示せず、判定結果のみ表示します。

## UI機能

### 言語切替

- 日本語
- English

### テーマ切替

- Dark
- Light

選択したテーマは次回起動時も保持されます。

### 折りたたみ

以下のブロックは見出しクリックで開閉できます。

- Prompt
- Negative prompt
- Other metadata
- Info
- Civitai resources

## セキュリティ・通信

基本処理はローカルで完結します。

外部通信が発生する操作:

- `Civitaiリソース` の `照合` ボタンを押したときのみ

通信先:

- `https://civitai.com/api/v1/model-versions/by-hash/{hash}`

## 制限事項

- 画像にプロンプト情報が保存されていない場合は表示できません
- ツール独自形式のメタデータは読めない場合があります
- Civitai照合はハッシュが必要です
- Civitai側で削除済み、非公開、制限付きのリソースは取得できない場合があります
- Civitai APIキーが必要なリソースには未対応です
- サムネイル表示はCivitai側の画像URLに依存します

## ファイル構成

```text
avif-prompt-viewer-app/
  package.json
  main.js
  README.md
  SPEC.md
  assets/
    icon.png
    icon.ico
  dist/
    EZ Prompt Viewer.exe

../avif_prompt_viewer.html
```

## 実行ファイル

ポータブル版:

```text
D:\Codex\ComfyUI\avif-prompt-viewer-app\dist\EZ Prompt Viewer.exe
```

インストール不要で実行できます。

### 単体exeでの利用

- `EZ Prompt Viewer.exe` 1つで起動できます
- 配布時にインストーラーは不要です
- 画像解析用の追加DLLやPython環境は不要です
- Civitai照合を使わない限り、基本機能はオフラインでも使えます

補足:

- 言語やテーマなど一部の設定は、Windowsのユーザープロファイル配下に保存される場合があります
- Civitaiのサムネイル画像はアプリ内に保存しません
- 完全に痕跡ゼロの実行ではなく、通常のWindowsアプリとして動作します

English:

- The app can be launched from a single `EZ Prompt Viewer.exe`
- No installer is required
- No separate Python runtime or extra image parser setup is required
- Core features work offline unless Civitai lookup is used
- Some settings may be stored in the Windows user profile area
- Thumbnail images are not saved by the app

## 動作環境

- Windows 10 / 11 64bit
- x64環境
- ローカルで画像ファイルを開けること
- Civitai照合を使う場合はインターネット接続が必要

推奨:

- フルHD以上の画面
- メモリ 4GB以上

非対応・未確認:

- macOS
- Linux
- 32bit版Windows
- モバイル環境

## 開発・ビルド

開発起動:

```powershell
npm start
```

ポータブルexe作成:

```powershell
npm run build
```

出力ファイル名:

```text
EZ Prompt Viewer.exe
```

## 現在のバージョン

```text
1.0.0
```
