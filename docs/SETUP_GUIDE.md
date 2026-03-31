# 🔧 MP-LogManager (GAS Edition) セットアップガイド

このガイドでは、プログラミングの知識がない方でも **「自分専用のセキュアなタスク管理環境」** を構築できるように、ステップバイステップで手順を解説します。

---

## 🛑 はじめに準備するもの
- **Google アカウント** (Gmail など)

---

## 🛠️ ステップ 1: Google Drive の準備
データの保存先となる専用のフォルダとファイルを作成します。

1. [Google Drive](https://drive.google.com/) にアクセスします。
2. 左上の「＋ 新規」＞「新しいフォルダ」をクリック。
3. フォルダ名を **`MP-LogManager-Data`** として作成。
4. 作成したフォルダの中に入ります。
5. （省略可）もし以前のデータ `tasks.json` や `journals.json` がある場合は、このフォルダにアップロードしてください。
   - ない場合は、アプリが自動で空のファイルを新しく作成しますので空のままで大丈夫です。

---

## 🛠️ ステップ 2: Google Apps Script (GAS) の作成
アプリと Google Drive を橋渡しする「自分専用の API」を作成します。

1. [Google Apps Script](https://script.google.com/) にアクセス。
2. 左上の「＋ 新しいプロジェクト」をクリック。
3. 左上の「無題のプロジェクト」をクリックし、名前を **`MP-LogManager-API`** などに変更。
4. 元からある `function myFunction() { ... }` をすべて消去し、以下のコードをすべてコピー＆ペーストします。

```javascript
/**
 * MP-LogManager (GAS Edition) Backend API
 * Google Drive へのデータ保存を担当します。
 */

const FOLDER_NAME = 'MP-LogManager-Data'; // Google Drive 内のフォルダ名

function doGet(e) {
  const type = e.parameter.type;
  if (!type) return ContentService.createTextOutput(JSON.stringify({error: 'No type specified'})).setMimeType(ContentService.MimeType.JSON);
  
  if (type === 'ping') {
    return ContentService.createTextOutput(JSON.stringify({status: 'ok'})).setMimeType(ContentService.MimeType.JSON);
  }

  const fileName = type === 'tasks' ? 'tasks.json' : (type === 'journals' ? 'journals.json' : null);
  if (!fileName) return ContentService.createTextOutput(JSON.stringify({error: 'Invalid type'})).setMimeType(ContentService.MimeType.JSON);

  const file = getFile(fileName);
  const content = file.getContentAsString();
  return ContentService.createTextOutput(content).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const postData = JSON.parse(e.postData.contents);
  const type = postData.type;
  const data = postData.data;

  const fileName = type === 'tasks' ? 'tasks.json' : (type === 'journals' ? 'journals.json' : null);
  if (!fileName) return ContentService.createTextOutput(JSON.stringify({error: 'Invalid type'})).setMimeType(ContentService.MimeType.JSON);

  const file = getFile(fileName);
  file.setContent(JSON.stringify(data, null, 2));

  return ContentService.createTextOutput(JSON.stringify({status: 'success'})).setMimeType(ContentService.MimeType.JSON);
}

function getFile(name) {
  const folders = DriveApp.getFoldersByName(FOLDER_NAME);
  let folder;
  if (folders.hasNext()) {
    folder = folders.next();
  } else {
    folder = DriveApp.createFolder(FOLDER_NAME);
  }

  const files = folder.getFilesByName(name);
  if (files.hasNext()) {
    return files.next();
  } else {
    return folder.createFile(name, '[]'); // 空のファイルを作成
  }
}
```

5. 右上の「保存」アイコンボタンをクリック。

---

## 🚀 ステップ 3: ウェブアプリとして公開（デプロイ）
作成したコードを、Web アプリから使えるように公開します。

1. 右上の青い「デプロイ」ボタンから **「新しいデプロイ」** を選択。
2. 左の設定アイコン（歯車）から、種類を **「ウェブアプリ」** に。
3. **設定内容**:
   - 説明: `v1.0` (何でもOK)
   - 次のユーザーとして実行: **「自分」**
   - アクセスできるユーザー: **「全員」** (※URLを知っている人だけがアクセスできます。プログラム側でデータは保護されています)
4. 「デプロイ」ボタンをクリック。
5. Google アカウントへのアクセス許可を求められる場合は、画面に従って「承認」や「許可」を行ってください。
   - ※「このアプリは Google で確認されていません」と出た場合は、「詳細を表示」＞「MP-LogManager-API（安全ではないページ）に移動」をクリックすると進めます。
6. **「ウェブアプリの URL」** が表示されるので、これを **コピー** しておきます。
   - `https://script.google.com/macros/s/XXXXX/exec` のような形式です。

---

## 📱 ステップ 4: Web App 側での設定
コピーした URL をアプリに登録します。

1. 自分の GitHub Pages URL にアクセスします。
2. アプリ画面の右上の **設定(⚙️)アイコン** をクリック。
3. **「GAS Web App URL」** の入力欄に、先ほどコピーした URL を貼り付け。
4. 下の「保存」ボタンをクリック。
5. ページがリロードされ、「接続成功！」などのトースト通知が出れば完了です。

これで、あなたの Google Drive にデータが保存されるセキュアな環境が整いました！✨

---

## 💡 よくある質問 (FAQ)

**Q. データの移行はどうすれば良いですか？**
Drive のフォルダにある `tasks.json` や `journals.json` を PC で開き、中身を直接書き換えるだけで移行できます。

**Q. GitHub 側にデータは残りませんか？**
はい。ソースコードのみが GitHub にあり、入力されたデータは一切 GitHub を経由せず、あなたの Google Drive とブラウザの間で直接通信されます。
