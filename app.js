/*
====================================================
 WaterCheck
 Ver.1.0.0

 Commit004

 ファイル：
 app.js

 Part A / B

 目的：
 ・チェック一覧生成
 ・チェック状態管理
 ・進捗計算
 ・LocalStorage保存
 ・画面制御

 設計方針：
 
 data.js
    ↓
 app.js
    ↓
 index.html

 の順で動作する。

 写真管理は将来IndexedDB対応予定。

====================================================
*/

/*
====================================================
 定数
====================================================
*/
const STORAGE_KEY = "WaterCheck_Data_V1";

/*
====================================================
写真撮影対象ID
現在選択しているチェック項目を保持
====================================================
*/
let currentPhotoItemId = null;

/*
====================================================
写真ダイアログで表示中の写真ID
====================================================
*/
let currentDialogPhotoId = null;

/*
====================================================
写真撮り直し中
====================================================
*/
let isRetakePhoto = false;

/*
====================================================
 アプリデータ

 data.jsのCHECK_ITEMSを
 初期データとして使用する。

 実際の作業データは
 LocalStorageへ保存する。
====================================================
*/
let workData = [];
let currentPhotoFile = null;

/*
====================================================
 初期化処理
====================================================
*/
document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);

/*
====================================================
アプリ初期化
====================================================
*/
function initializeApp() {
    // データ読込
    loadWorkData();

    // 画面生成
    createChecklist();
    updateProgress();

    // イベント登録
    setupButtons();
    setupCameraInput();
    setupPhotoDialog();

    // PWA
    registerServiceWorker();

    // 写真DB
    initPhotoDB(
        restorePhotos
    );
}

/*
====================================================
 保存データ読み込み
====================================================
*/
function loadWorkData() {
    const savedData =
        localStorage.getItem(
            STORAGE_KEY
        );

    if (savedData) {
        workData =
            JSON.parse(savedData);
    } else {
        workData =
            CHECK_ITEMS.map(
                item => ({
                    id: item.id,
                    order: item.order,
                    name: item.name,
                    status: "none",
                    photos: [],
                    memo: "",
                    checkedTime: "",
                    photoTime: ""
                })
            );
        saveWorkData();
    }
}

/*
====================================================
 保存処理
====================================================
*/
function saveWorkData() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(workData)
    );
}

/*
====================================================
 チェック一覧作成
====================================================
*/

/*
====================================================
TDセル作成
====================================================
*/

/*
====================================================
TDセル作成
====================================================
*/
function createCell(
    text = "",
    className = ""
) {
    const cell =
        document.createElement(
            "td"
        );
    cell.textContent =
        text;
    if (className) {
        cell.className =
            className;
    }

    return cell;
}

/*
====================================================
メモセル作成

Ver1.0.06
複数行メモ対応
====================================================
*/
function createMemoCell(item) {

    const cell =
        document.createElement(
            "td"
        );

    const textarea =
        document.createElement(
            "textarea"
        );

    textarea.value =
        item.memo || "";

    textarea.className =
        "memo-input";

    textarea.rows = 2;

    const resizeTextarea =
        () => {

            textarea.style.height =
                "auto";

            textarea.style.height =
                textarea.scrollHeight +
                "px";
        };

    resizeTextarea();

    requestAnimationFrame(
        resizeTextarea
    );

    textarea.addEventListener(
        "input",

        () => {
            item.memo =
                textarea.value;

            saveWorkData();
            resizeTextarea();
        }
    );

    cell.appendChild(
        textarea
    );

    return cell;
}

/*
====================================================
状態セル作成
====================================================
*/

function createStatusCell(item) {

    const statusCell =
        document.createElement(
            "td"
        );

    const checkbox =
        document.createElement(
            "input"
        );

    checkbox.type =
        "checkbox";

    checkbox.checked =
        item.status !== "none";

    checkbox.addEventListener(
        "change",

        () => {
            updateStatus(
                item.id,
                checkbox.checked
            );
        }
    );

    statusCell.appendChild(
        checkbox
    );

    return statusCell;
}

/*
====================================================
写真セル作成
====================================================
*/
function createPhotoCell(item) {

    const photoCell =
        document.createElement(
            "td"
        );

    const photoButton =
        document.createElement(
            "button"
        );

    const cameraIcon =
        document.createElement(
            "img"
        );

    cameraIcon.src =
        "icons/camera.png";

    cameraIcon.alt =
        "写真";

    cameraIcon.className =
        "camera-icon";

    photoButton.appendChild(
        cameraIcon
    );

    photoButton.className =
        "photo-button";

    photoButton.dataset.photoId =
        item.id;

    photoButton.addEventListener(

        "click",

        () => {
            currentPhotoItemId =
                item.id;

            const cameraInput =
                document.getElementById(
                    "cameraInput"
                );

            if (cameraInput) {
                cameraInput.click();
            }
        }
    );

    photoCell.appendChild(
        photoButton
    );

    return photoCell;
}

function createChecklist() {

    const tbody =
        document.getElementById(
            "checkTableBody"
        );

    tbody.innerHTML = "";

    workData
        .sort(
            (a, b) =>
                a.order - b.order
        )
        .forEach(
            item => {

                const row =
                    document.createElement(
                        "tr"
                    );

                row.dataset.id =
                    item.id;

                /*
                --------------------------------
                No
                --------------------------------
                */
                row.appendChild(
                    createCell(
                        item.order
                    )
                );

                /*
                --------------------------------
                場所
                --------------------------------
                */
                row.appendChild(
                    createCell(
                        item.name
                    )
                );

                /*
                --------------------------------
                状態
                --------------------------------
                */
                const statusCell =
                    document.createElement(
                        "td"
                    );

                const checkbox =
                    document.createElement(
                        "input"
                    );

                checkbox.type =
                    "checkbox";

                checkbox.checked =
                    item.status !== "none";

                checkbox.addEventListener(

                    "change",

                    () => {
                        updateStatus(
                            item.id,
                            checkbox.checked
                        );
                    }
                );

                statusCell.appendChild(
                    checkbox
                );

                row.appendChild(
                    statusCell
                );

                /*
                --------------------------------
                写真
                --------------------------------
                */
                const photoCell =
                    document.createElement(
                        "td"
                    );

                const photoButton =
                    document.createElement(
                        "button"
                    );

                const cameraIcon =
                    document.createElement(
                        "img"
                    );

                cameraIcon.src =
                    "icons/camera.png";

                cameraIcon.alt =
                    "写真";

                cameraIcon.className =
                    "camera-icon";

                photoButton.appendChild(
                    cameraIcon
                );

                photoButton.className =
                    "photo-button";

                photoButton.dataset.photoId =
                    item.id;

                photoButton.addEventListener(

                    "click",

                    () => {
                        currentPhotoItemId =
                            item.id;

                        const cameraInput =
                            document.getElementById(
                                "cameraInput"
                            );

                        if (cameraInput) {
                            cameraInput.click();
                        }
                    }
                );

                photoCell.appendChild(
                    photoButton
                );

                row.appendChild(
                    photoCell
                );

                /*
                --------------------------------
                チェック時刻
                --------------------------------
                */
                row.appendChild(
                    createCell(
                        item.checkedTime || "-"
                    )
                );

                /*
                --------------------------------
                写真時刻
                --------------------------------
                */
                row.appendChild(
                    createCell(
                        item.photoTime || "-"
                    )
                );

                /*
                --------------------------------
                メモ
                --------------------------------
                */
                row.appendChild(
                    createMemoCell(
                        item
                    )
                );

                tbody.appendChild(
                    row
                );

                updateRowColor(
                    row,
                    item.status
                );
            }
        );
}

/*
====================================================
 チェック状態更新
====================================================
*/
function updateStatus(id, checked) {

    const target =
        workData.find(
            item =>
                item.id === id
        );

    if (!target) {
        return;
    }

    if (checked) {
        target.status =
            "check";

        target.checkedTime =
            getCurrentDateTime();
    } else {
        target.status =
            "none";

        target.checkedTime =
            "";
    }

    saveWorkData();
    createChecklist();
    updateProgress();
}

/*
====================================================
 現在日時取得
====================================================
*/
function getCurrentDateTime() {

    const now =
        new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            now.getDate()
        ).padStart(2, "0");

    const hour =
        String(
            now.getHours()
        ).padStart(2, "0");

    const minute =
        String(
            now.getMinutes()
        ).padStart(2, "0");

    return (
        year
        + "-"
        + month
        + "-"
        + day
        + " "
        + hour
        + ":"
        + minute
    );
}

/*
====================================================
 進捗更新
====================================================
*/
function updateProgress() {

    const total =
        workData.length;

    const completed =
        workData.filter(
            item =>
                item.status !== "none"
        ).length;

    const remaining =
        total - completed;

    const completedElement =
        document.getElementById(
            "completedCount"
        );

    const totalElement =
        document.getElementById(
            "totalCount"
        );

    const remainingElement =
        document.getElementById(
            "remainingCount"
        );

    if (completedElement) {
        completedElement.textContent =
            completed;
    }

    if (totalElement) {
        totalElement.textContent =
            total;
    }

    if (remainingElement) {
        remainingElement.textContent =
            remaining;
    }

    updateProgressBar();
    updateRemainingNumbers();
}

/*
====================================================
 プログレスバー更新
====================================================
*/
function updateProgressBar() {

    const total =
        workData.length;

    const completed =
        workData.filter(
            item =>
                item.status !== "none"
        ).length;

    let percent = 0;

    if (total > 0) {
        percent =
            Math.round(
                completed
                /
                total
                *
                100
            );
    }

    const bar =
        document.getElementById(
            "progressValue"
        );

    if (bar) {
        bar.style.width =
            percent + "%";
    }
}

/*
====================================================
 未完了番号表示
====================================================
*/
function updateRemainingNumbers() {

    const area =
        document.getElementById(
            "remainingNumbers"
        );

    if (!area) {
        return;
    }

    const remainingItems =
        workData.filter(
            item =>
                item.status === "none"
        );

    if (
        remainingItems.length === 0
    ) {
        area.textContent =
            "すべて完了しました";

        return;
    }

    area.textContent =
        remainingItems

            .map(
                item =>
                    "No." + item.order
            )

            .join(
                "　"
            );
}

/*
====================================================
 行カラー更新
====================================================
*/
function updateRowColor(row, status) {

    row.classList.remove(
        "row-none",
        "row-check",
        "row-photo"
    );

    if (status === "none") {
        row.classList.add(
            "row-none"
        );
    }

    else if (status === "check") {
        row.classList.add(
            "row-check"
        );
    }

    else if (status === "photo") {
        row.classList.add(
            "row-photo"
        );
    }
}

/*
====================================================
 ボタン設定

 Ver1.0.07

 ・保存
 ・バックアップ
 ・バックアップを開く
 ・リセット
====================================================
*/
function setupButtons() {

    /*
    ----------------------------------------
    保存
    ----------------------------------------
    */

    const saveButton =
        document.getElementById(
            "saveButton"
        );

    if (saveButton) {
        saveButton.addEventListener(

            "click",

            () => {
                saveWorkData();
                alert(
                    "保存しました"
                );
            }
        );
    }

    /*
    ----------------------------------------
    バックアップ
    ----------------------------------------
    */
    const backupButton =
        document.getElementById(
            "backupButton"
        );

    if (backupButton) {
        backupButton.addEventListener(
            "click",
            exportBackup
        );
    }

    /*
    ----------------------------------------
    バックアップを開く
    ----------------------------------------
    */
    const restoreButton =
        document.getElementById(
            "restoreButton"
        );

    const restoreInput =
        document.getElementById(
            "restoreInput"
        );

    if (
        restoreButton &&
        restoreInput
    ) {

        restoreButton.addEventListener(
            "click",
            () => {
                restoreInput.value = "";
                restoreInput.click();
            }
        );

        restoreInput.addEventListener(
            "change",
            handleRestoreFile
        );
    }

    /*
    ----------------------------------------
    バックアップ閲覧ダイアログ
    Ver1.0.09
    ----------------------------------------
    */
    const restoreSelectedBackupButton =
        document.getElementById(
            "restoreSelectedBackupButton"
        );

    if (
        restoreSelectedBackupButton
    ) {
        restoreSelectedBackupButton.addEventListener(
            "click",

            () => {
                if (
                    selectedBackupData
                ) {
                    closeBackupViewDialog();
                    confirmRestoreBackup(
                        selectedBackupData
                    );
                }
            }
        );
    }

    const closeBackupViewButton =
        document.getElementById(
            "closeBackupViewButton"
        );

    const closeBackupViewButtonBottom =
        document.getElementById(
            "closeBackupViewButtonBottom"
        );

    if (
        closeBackupViewButton
    ) {
        closeBackupViewButton.addEventListener(
            "click",
            closeBackupViewDialog
        );
    }

    if (
        closeBackupViewButtonBottom
    ) {
        closeBackupViewButtonBottom.addEventListener(
            "click",
            closeBackupViewDialog
        );
    }

    /*
    ----------------------------------------
    リセット
    ----------------------------------------
    */
    const resetButton =
        document.getElementById(
            "resetButton"
        );

    if (resetButton) {
        resetButton.addEventListener(
            "click",
            resetAllData
        );
    }

    /*
    ----------------------------------------
    バックアップ選択画面 閉じる
    Ver1.0.08
    ----------------------------------------
    */
    const closeBackupListButton =
        document.getElementById(
            "closeBackupListButton"
        );

    const closeBackupListButtonBottom =
        document.getElementById(
            "closeBackupListButtonBottom"
        );

    const backupListDialog =
        document.getElementById(
            "backupListDialog"
        );

    if (backupListDialog) {
        if (closeBackupListButton) {
            closeBackupListButton.addEventListener(
                "click",
                () => {
                    backupListDialog.style.display =
                        "none";
                }
            );
        }

        if (closeBackupListButtonBottom) {
            closeBackupListButtonBottom.addEventListener(
                "click",
                () => {
                    backupListDialog.style.display =
                        "none";
                }
            );
        }
    }
}

/*
====================================================
 全リセット
====================================================
*/
function resetAllData() {

    const result =
        confirm(
            "すべてのチェック状態をリセットしますか？"
        );

    if (!result) {
        return;
    }

    workData.forEach(
        item => {
            item.status =
                "none";

            item.checkedTime =
                "";
        }
    );

    saveWorkData();
    createChecklist();
    updateProgress();
}

/*
====================================================
 Service Worker登録

 PWAオフライン対応

====================================================
*/
function registerServiceWorker() {

    if (
        "serviceWorker" in navigator
    ) {
        navigator.serviceWorker.register(
            "service-worker.js"
        )

        .then(
            registration => {
            }
        )

        .catch(
            error => {
                console.error(
                    "Service Worker登録失敗",
                    error
                );
            }
        );
    }
}

/*
====================================================
写真入力設定

Ver1.0.02
写真撮り直し対応
====================================================
*/
function setupCameraInput() {

    const cameraInput =
        document.getElementById(
            "cameraInput"
        );

    if (!cameraInput) {
        return;
    }

    cameraInput.addEventListener(
        "change",

        (event) => {
            const file =
                event.target.files[0];

            if (!file) {
                return;
            }

            currentPhotoFile =
                file;

            const photoItemId =
                currentPhotoItemId;

            const photoTime =
                new Date().toLocaleString(
                    "ja-JP"
                );

            savePhoto(
                photoItemId,
                file
            );

            if (photoItemId !== null) {
                const row =
                    document.querySelector(
                        `tr[data-id="${photoItemId}"]`
                    );

                if (row) {
                    const photoCell =
                        row.children[3];

                    const photoTimeCell =
                        row.children[5];

                    photoTimeCell.textContent =
                        photoTime;

                    const img =
                        document.createElement(
                            "img"
                        );

                    img.src =
                        URL.createObjectURL(
                            file
                        );

                    img.className =
                        "photo-preview";

                    img.addEventListener(

                        "click",
                        () => {
                            showPhotoDialog(
                                img.src,
                                photoItemId
                            );
                        }
                    );

                    photoCell.innerHTML =
                        "";

                    photoCell.appendChild(
                        img
                    );

                    const item =
                        workData.find(
                            data =>
                                data.id ===
                                photoItemId
                        );

                    if (item) {
                        item.photoTime =
                            photoTime;

                        saveWorkData();
                    }
                }
            }

            currentPhotoItemId =
                null;

            currentPhotoFile =
                null;

            cameraInput.value =
                "";

            closePhotoDialog();
        }
    );
}

/*
====================================================
写真保存DB

Commit016
====================================================
*/
let photoDB;

function initPhotoDB(callback){

    const request =
        indexedDB.open(
            "WaterCheckPhotoDB",
            1
        );

    request.onupgradeneeded =
        (event)=>{

            const db =
                event.target.result;

            if(
                !db.objectStoreNames.contains(
                    "photos"
                )
            ){
                db.createObjectStore(
                    "photos",
                    {
                        keyPath:"id"
                    }
                );
            }
        };

    request.onsuccess =
        (event)=>{

            photoDB =
                event.target.result;

            if(callback){
                callback();
            }
        };

    request.onerror =
        ()=>{
            console.error(
                "写真DBエラー"
            );
        };
}

/*
====================================================
写真保存

Commit017
Ver1.0.07
====================================================
*/
function savePhoto(id, file){

    if(!photoDB){
        console.error(
            "写真DB未準備"
        );

        return;
    }

    const now =
        new Date().toISOString();

    const transaction =
        photoDB.transaction(
            [
                "photos"
            ],
            "readwrite"
        );

    const store =
        transaction.objectStore(
            "photos"
        );

    store.put({
        id: id,
        type: "photo",
        image: file,

        /*
        撮影日時

        現時点では撮影直後の登録のみなので
        addedAt と同じ値を保存する。

        将来、端末内の既存写真を追加する際は
        EXIFの撮影日時を使用する。
        */
        capturedAt: now,

        /*
        WaterCheckへ登録した日時
        */
        addedAt: now

    });

    transaction.oncomplete =
        ()=>{
        };
}

/*
====================================================
写真復元

Commit018
====================================================
*/
function restorePhotos(){

    if(!photoDB){
        return;
    }

    const transaction =
        photoDB.transaction(
            [
                "photos"
            ],
            "readonly"
        );

    const store =
        transaction.objectStore(
            "photos"
        );

    store.openCursor().onsuccess =
        (event)=>{

            const cursor =
                event.target.result;

            if(cursor){
                const data =
                    cursor.value;

                const row =
                    document.querySelector(
                        `tr[data-id="${data.id}"]`
                    );

                if(row){
                    const photoCell =
                        row.children[3];

                    const img =
                        document.createElement(
                            "img"
                        );

                    img.src =
                        URL.createObjectURL(
                            data.image
                        );

                    img.className =
                        "photo-preview";

                    img.addEventListener(
                        "click",

                        () => {
                            showPhotoDialog(
                                img.src,
                                data.id
                            );
                        }
                    );

                    photoCell.innerHTML =
                        "";

                    photoCell.appendChild(
                        img
                    );
                }

                cursor.continue();
            }
        };
}

/*
====================================================
写真拡大ダイアログ設定

Ver1.0.03

・閉じる
・撮り直し
・削除
====================================================
*/
function setupPhotoDialog() {

    const dialog =
        document.getElementById(
            "photoDialog"
        );

    const closeButton =
        document.getElementById(
            "closePhotoDialog"
        );

    const retakeButton =
        document.getElementById(
            "retakePhotoButton"
        );

    const deleteButton =
        document.getElementById(
            "deletePhotoButton"
        );

    if (
        !dialog ||
        !closeButton ||
        !retakeButton ||
        !deleteButton
    ) {
        return;
    }

    closeButton.addEventListener(
        "click",
        closePhotoDialog
    );

    retakeButton.addEventListener(
        "click",
        retakePhoto
    );

    deleteButton.addEventListener(
        "click",
        deleteCurrentPhoto
    );
}

/*
====================================================
写真表示

Ver1.0.02
====================================================
*/
function showPhotoDialog(
    imageUrl,
    itemId
) {

    const dialog =
        document.getElementById(
            "photoDialog"
        );

    const area =
        document.getElementById(
            "photoPreviewArea"
        );

    if (!dialog || !area) {
        return;
    }

    currentDialogPhotoId =
        itemId;

    area.innerHTML = "";

    const img =
        document.createElement(
            "img"
        );

    img.src =
        imageUrl;

    img.className =
        "photo-dialog-image";

    area.appendChild(
        img
    );

    dialog.style.display =
        "flex";
}

/*
====================================================
写真ダイアログ閉じる
====================================================
*/
function closePhotoDialog() {

    const dialog =
        document.getElementById(
            "photoDialog"
        );

    const area =
        document.getElementById(
            "photoPreviewArea"
        );

    if (!dialog || !area) {
        return;
    }

    // 一度非表示にする
    dialog.style.display = "none";

    window.scrollTo(0, 0);

    // 次回表示時にズーム状態をリセットするため画像を削除
    area.innerHTML = "";
}

/*
====================================================
写真撮り直し

Ver1.0.02
====================================================
*/
function retakePhoto() {

    if (currentDialogPhotoId === null) {
        return;
    }

    const result =
        confirm(
            "この写真を撮り直しますか？"
        );

    if (!result) {
        return;
    }

    currentPhotoItemId =
        currentDialogPhotoId;

    closePhotoDialog();

    const cameraInput =
        document.getElementById(
            "cameraInput"
        );

    if (!cameraInput) {
        return;
    }

    cameraInput.value = "";
    cameraInput.click();
}

/*
====================================================
写真削除

Ver1.0.03
====================================================
*/
function deleteCurrentPhoto() {

    if (
        currentDialogPhotoId === null
    ) {
        return;
    }

    const result =
        confirm(
            "この写真を削除しますか？"
        );

    if (!result) {
        return;
    }

    const photoId =
        currentDialogPhotoId;

    deletePhoto(
        photoId,

        () => {
            const item =
                workData.find(
                    data =>
                        data.id === photoId
                );

            if (item) {
                item.photoTime =
                    "";

                item.photos =
                    [];
            }

            saveWorkData();
            createChecklist();

            setTimeout(
                () => {
                    restorePhotos();
                },
                100
            );

            updateProgress();
            closePhotoDialog();
        }
    );
}

/*
====================================================
IndexedDB 写真削除

Ver1.0.03
====================================================
*/
function deletePhoto(
    id,
    callback
) {

    if (!photoDB) {

        console.error(
            "写真DB未準備"
        );
        return;
    }

    const transaction =
        photoDB.transaction(
            [
                "photos"

            ],
            "readwrite"
        );

    const store =
        transaction.objectStore(
            "photos"
        );

    const request =
        store.delete(
            id
        );

    request.onsuccess =
        () => {
        };

    transaction.oncomplete =
        () => {

            if (callback) {
                callback();
            }
        };
}

/*
====================================================
バックアップ

Ver1.0.07
====================================================
*/
function exportBackup() {

    const backupData = {

        app: {
            name: "WaterCheck",
            version: "1.0.07",
            exportedAt:
                new Date().toISOString()
        },

        workData: workData,
        evidence: []
    };

    const jsonText =
        JSON.stringify(

            backupData,
            null,
            2
        );

    downloadBackupFile(
        jsonText
    );

    alert(
        "バックアップを保存しました。"
    );
}

/*
====================================================
バックアップダウンロード

Ver1.0.07
====================================================
*/
function downloadBackupFile(jsonText) {

    const now =
        new Date();

    const fileName =

        "WaterCheck_"
        +
        now.getFullYear()
        +
        String(
            now.getMonth() + 1
        ).padStart(2, "0")
        +
        String(
            now.getDate()
        ).padStart(2, "0")
        +
        "_"
        +
        String(
            now.getHours()
        ).padStart(2, "0")
        +
        String(
            now.getMinutes()
        ).padStart(2, "0")
        +
        String(
            now.getSeconds()
        ).padStart(2, "0")
        +
        ".json";

    const blob =
        new Blob(

            [
                jsonText
            ],

            {
                type:
                    "application/json"
            }
        );

    const url =
        URL.createObjectURL(
            blob
        );

    const link =
        document.createElement(
            "a"
        );

    link.href =
        url;

    link.download =
        fileName;

    document.body.appendChild(
        link
    );

    link.click();

    document.body.removeChild(
        link
    );

    URL.revokeObjectURL(
        url
    );
}

/*
====================================================
Ver1.0.07
写真バックアップ

IndexedDBの写真を取得し、
JSONバックアップ用のEvidenceへ変換する。
====================================================
*/

/*
====================================================
 Blob → Base64変換
====================================================
*/
function blobToBase64(blob) {

    return new Promise(

        (resolve, reject) => {

            const reader =
                new FileReader();

            reader.onload =
                () => {
                    resolve(
                        reader.result
                    );
                };

            reader.onerror =
                () => {
                    reject(
                        reader.error
                    );
                };

            reader.readAsDataURL(
                blob
            );
        }
    );
}

/*
====================================================
 IndexedDBから全写真取得
====================================================
*/
function getAllPhotos() {

    return new Promise(

        (resolve, reject) => {
            if (!photoDB) {
                reject(
                    new Error(
                        "写真DB未準備"
                    )
                );

                return;
            }

            const transaction =
                photoDB.transaction(
                    [
                        "photos"
                    ],
                    "readonly"
                );

            const store =
                transaction.objectStore(
                    "photos"
                );

            const request =
                store.getAll();

            request.onsuccess =
                () => {
                    resolve(
                        request.result
                    );
                };

            request.onerror =
                () => {
                    reject(
                        request.error
                    );
                };
        }
    );
}

/*
====================================================
 Evidence生成
====================================================
*/
async function createEvidenceBackup() {

    const photos =
        await getAllPhotos();

    const evidence = [];

    for (
        const photo of photos
    ) {

        /*
        ----------------------------------------
        対応するチェック項目を検索
        ----------------------------------------
        */
        const item =
            workData.find(
                data =>
                    data.id === photo.id
            );

        if (!item) {
            console.warn(
                "対応するチェック項目がありません:",
                photo.id
            );
            continue;
        }

        /*
        ----------------------------------------
        写真データをBase64へ変換
        ----------------------------------------
        */
        const image =
            await blobToBase64(
                photo.image
            );

        /*
        ----------------------------------------
        Evidenceとして保存
        ----------------------------------------
        */
        evidence.push({
            itemId:
                item.id,

            itemName:
                item.name,

            type:
                "photo",

            capturedAt:
                photo.capturedAt ||
                photo.time ||
                "",

            addedAt:
                photo.addedAt ||
                photo.time ||
                "",

            image:
                image

        });
    }
    return evidence;
}

/*
====================================================
 写真付きバックアップ

 Ver1.0.07
====================================================
*/
async function exportBackup() {

    try {
        /*
        ----------------------------------------
        Evidence取得
        ----------------------------------------
        */
        const evidence =
            await createEvidenceBackup();

        /*
        ----------------------------------------
        バックアップデータ作成
        ----------------------------------------
        */
        const backupData = {

            app: {
                name:
                    "WaterCheck",

                version:
                    "1.0.07",

                exportedAt:
                    new Date().toISOString()
            },

            workData:
                workData,

            evidence:
                evidence
        };

        /*
        ----------------------------------------
        JSON化
        ----------------------------------------
        */
        const jsonText =
            JSON.stringify(
                backupData,
                null,
                2
            );

        /*
        ----------------------------------------
        ファイル保存
        ----------------------------------------
        */
        downloadBackupFile(
            jsonText
        );

        alert(
            "バックアップを保存しました。\n\n" +
            "写真 " +
            evidence.length +
            "件を含みます。"
        );
    }
    catch (error) {

        console.error(
            "バックアップ作成エラー:",
            error
        );

        alert(
            "バックアップの作成に失敗しました。\n" +
            "写真DBを確認してください。"
        );
    }
}

/*
====================================================
バックアップファイル読み込み

Ver1.0.07

・JSON形式確認
・WaterCheck形式確認
・バックアップ日時確認
====================================================
*/
function handleRestoreFile(event) {

    const file =
        event.target.files[0];

    if (!file) {
        return;
    }

    const reader =
        new FileReader();

    reader.onload =
        async () => {
            try {
                const backupData =
                    JSON.parse(
                        reader.result
                    );

                await openBackupData(
                    backupData
                );
            }
            catch (error) {
                console.error(
                    "バックアップ読み込みエラー:",
                    error
                );

                alert(
                    "バックアップファイルを読み込めませんでした。"
                );
            }

            event.target.value = "";
        };

    reader.onerror =
        () => {
            alert(
                "バックアップファイルを読み込めませんでした。"
            );

            event.target.value = "";
        };

    reader.readAsText(
        file,
        "UTF-8"
    );
}

/*
====================================================
バックアップデータを開く

Ver1.0.08

・閲覧/復元選択UI
・prompt廃止
・ボタン操作対応
====================================================
*/
let selectedBackupData = null;

async function openBackupData(
    backupData
) {

    /*
    ----------------------------------------
    WaterCheckバックアップ確認
    ----------------------------------------
    */
    if (!backupData) {

        alert(
            "バックアップデータがありません。"
        );

        return;
    }

    if (
        !backupData.app ||
        backupData.app.name !== "WaterCheck"
    ) {
        alert(
            "WaterCheckのバックアップファイルではありません。"
        );

        return;
    }

    if (
        !Array.isArray(
            backupData.workData
        )
    ) {
        alert(
            "チェックデータがありません。"
        );

        return;
    }

    /*
    ----------------------------------------
    バックアップ保持
    ----------------------------------------
    */
    selectedBackupData =
        backupData;

    const exportedAt =
        formatBackupDate(
            backupData.app.exportedAt
        );

    const evidenceCount =
        Array.isArray(
            backupData.evidence
        )
            ? backupData.evidence.length
            : 0;

    /*
    ----------------------------------------
    選択画面表示
    ----------------------------------------
    */
    const dialog =
        document.getElementById(
            "backupListDialog"
        );

    const area =
        document.getElementById(
            "backupListArea"
        );

    if (
        !dialog ||
        !area
    ) {
        console.error(
            "バックアップ選択画面がありません"
        );

        return;
    }

    area.innerHTML =
        "<div class='backup-select-info'>" +
        "<p><b>作成日時</b><br>" +
        exportedAt +
        "</p>" +
        "<p><b>チェック項目：</b>" +
        backupData.workData.length +
        "件</p>" +
        "<p><b>写真：</b>" +
        evidenceCount +
        "件</p>" +
        "</div>" +
        "<button id='viewBackupButton' class='backup-main-button'>" +
        "閲覧する" +
        "</button>" +
        "<button id='restoreBackupButton' class='backup-restore-button'>" +
        "復元する" +
        "</button>";

    dialog.style.display =
        "flex";

    /*
    ----------------------------------------
    閲覧ボタン
    ----------------------------------------
    */
    document
        .getElementById(
            "viewBackupButton"
        )
        .onclick =
        async () => {
            dialog.style.display =
                "none";

            await viewBackupData(
                selectedBackupData
            );
        };

    /*
    ----------------------------------------
    復元ボタン
    ----------------------------------------
    */
    document
        .getElementById(
            "restoreBackupButton"
        )
        .onclick =
        async () => {
            dialog.style.display =
                "none";

            await confirmRestoreBackup(
                selectedBackupData
            );
        };
}

/*
====================================================

バックアップ日時表示

====================================================
*/
function formatBackupDate(
    dateString
) {

    if (!dateString) {
        return "日時不明";
    }

    const date =
        new Date(
            dateString
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "日時不明";
    }

    return (
        date.getFullYear()
        + "/"
        + String(
            date.getMonth() + 1
        ).padStart(2, "0")
        + "/"
        + String(
            date.getDate()
        ).padStart(2, "0")
        + " "
        + String(
            date.getHours()
        ).padStart(2, "0")
        + ":"
        + String(
            date.getMinutes()
        ).padStart(2, "0")
    );
}

/*
====================================================
バックアップ閲覧

Ver1.0.08

・バックアップ情報表示
・チェック一覧表示
・現在データは変更しない
====================================================
*/
async function viewBackupData(
    backupData
) {
    const exportedAt =
        formatBackupDate(
            backupData.app.exportedAt
        );

    const evidenceCount =
        Array.isArray(
            backupData.evidence
        )
            ? backupData.evidence.length
            : 0;

    const infoArea =
        document.getElementById(
            "backupViewInfo"
        );

    const viewArea =
        document.getElementById(
            "backupViewArea"
        );

    const dialog =
        document.getElementById(
            "backupViewDialog"
        );

    if (
        !infoArea ||
        !viewArea ||
        !dialog
    ) {
        alert(
            "バックアップ参照画面を表示できません。"
        );
        return;
    }

    /*
    ----------------------------------------
    情報表示
    ----------------------------------------
    */
    infoArea.innerHTML =
        "<b>作成日時：</b>" +
        exportedAt +
        "<br>" +
        "<b>チェック項目：</b>" +
        backupData.workData.length +
        "件<br>" +
        "<b>写真：</b>" +
        evidenceCount +
        "件";
    /*
    ----------------------------------------
    一覧表示
    ----------------------------------------
    */
    let html = "";

    backupData.workData
        .sort(
            (a, b) =>
                a.order - b.order
        )
        .forEach(
            item => {

                const status =
                    item.status === "check"
                    ? "🟢 完了"
                    : "⚪ 未実施";

            html +=
                "<div class='backup-item'>"
                +
                "<span class='backup-item-no'>"
                +
                "No."
                +
                item.order
                +
                "</span>"
                +
                "<span class='backup-item-status'>"
                +
                "<span class='status-text'>"
                +
                status
                +
                "</span>"
                +
                "</span>"
                +
                "<span class='backup-item-name'>"
                +
                item.name
                +
                "</span>"
                +
                "</div>";
            }
        );

    viewArea.innerHTML =
        html;

    dialog.style.display =
        "flex";
}

/*
====================================================
バックアップ復元確認

Ver1.0.08

・現在データをバックアップで置換
・写真もIndexedDBへ復元
・復元後に一覧を再表示
====================================================
*/
async function confirmRestoreBackup(
    backupData
) {
    const exportedAt =
        formatBackupDate(
            backupData.app.exportedAt
        );

    const evidenceCount =
        Array.isArray(
            backupData.evidence
        )
            ? backupData.evidence.length
            : 0;

    /*
    ----------------------------------------
    復元前確認
    ----------------------------------------
    */
    const result =
        confirm(

            "以下のバックアップを復元します。\n\n" +
            "作成日時：" +
            exportedAt +
            "\n\n" +
            "チェック項目：" +
            backupData.workData.length +
            "件\n" +
            "写真：" +
            evidenceCount +
            "件\n\n" +
            "現在のチェックデータ・メモ・写真は\n" +
            "このバックアップの内容に置き換わります。\n\n" +
            "本当に復元しますか？"
        );

    if (!result) {
        return;
    }

    /*
    ----------------------------------------
    写真DB確認
    ----------------------------------------
    */
    if (!photoDB) {
        alert(
            "写真DBの準備が完了していません。\n" +
            "少し待ってからもう一度実行してください。"
        );

        return;
    }

    try {
        /*
        ----------------------------------------
        チェックデータ復元
        ----------------------------------------
        */
        workData =
            JSON.parse(
                JSON.stringify(
                    backupData.workData
                )
            );

        /*
        ----------------------------------------
        写真復元
        ----------------------------------------
        */
        await restoreBackupPhotos(
            backupData.evidence || []
        );

        /*
        ----------------------------------------
        LocalStorage保存
        ----------------------------------------
        */
        saveWorkData();

        /*
        ----------------------------------------
        画面再構築
        ----------------------------------------
        */
        createChecklist();
        updateProgress();

        /*
        ----------------------------------------
        写真表示
        ----------------------------------------
        */
        restorePhotos();

        /*
        ----------------------------------------
        完了通知
        ----------------------------------------
        */
        alert(
            "バックアップを復元しました。\n\n" +
            "チェック項目：" +
            workData.length +
            "件\n" +
            "写真：" +
            evidenceCount +
            "件"
        );

    }
    catch (error) {
        console.error(
            "バックアップ復元エラー:",
            error
        );

        alert(
            "バックアップの復元に失敗しました。\n\n" +
            "現在のデータは変更されていない可能性があります。"
        );
    }
}

/*
====================================================
バックアップ写真復元

Ver1.0.08

JSON内のBase64画像をIndexedDBへ戻す。
====================================================
*/
async function restoreBackupPhotos(
    evidence
) {
    if (!photoDB) {
        throw new Error(
            "写真DB未準備"
        );
    }

    const transaction =
        photoDB.transaction(
            [
                "photos"
            ],
            "readwrite"
        );

    const store =
        transaction.objectStore(
            "photos"
        );

    /*
    ----------------------------------------
    現在の写真をすべて削除
    ----------------------------------------
    */
    store.clear();

    /*
    ----------------------------------------
    バックアップ写真を登録
    ----------------------------------------
    */
    for (
        const photo of evidence
    ) {
        if (
            !photo ||
            !photo.itemId ||
            !photo.image
        ) {
            continue;
        }

        const imageBlob =
            dataUrlToBlob(
                photo.image
            );

        store.put({
            id:
                photo.itemId,

            type:
                "photo",

            image:
                imageBlob,

            capturedAt:
                photo.capturedAt || "",

            addedAt:
                photo.addedAt || ""
        });
    }

    /*
    ----------------------------------------
    IndexedDB処理完了待ち
    ----------------------------------------
    */
    await new Promise(
        (resolve, reject) => {

            transaction.oncomplete =
                () => {
                    resolve();
                };

            transaction.onerror =
                () => {
                    reject(
                        transaction.error
                    );
                };

            transaction.onabort =
                () => {
                    reject(
                        transaction.error ||
                        new Error(
                            "写真復元処理が中断されました"
                        )
                    );
                };
        }
    );
}


/*
====================================================
Data URL → Blob

Ver1.0.08

バックアップJSON内のBase64画像を
IndexedDB保存用Blobへ変換する。
====================================================
*/
function dataUrlToBlob(
    dataUrl
) {
    const parts =
        dataUrl.split(",");

    if (
        parts.length < 2
    ) {
        throw new Error(
            "画像データ形式が不正です"
        );
    }

    const mimeMatch =
        parts[0].match(
            /data:(.*?);base64/
        );

    const mimeType =
        mimeMatch
            ? mimeMatch[1]
            : "image/jpeg";

    const binary =
        atob(
            parts[1]
        );

    const length =
        binary.length;

    const bytes =
        new Uint8Array(
            length
        );

    for (
        let i = 0;
        i < length;
        i++
    ) {
        bytes[i] =
            binary.charCodeAt(i);
    }

    return new Blob(
        [
            bytes
        ],

        {
            type:
                mimeType
        }
    );
}

/*
====================================================
バックアップ閲覧ダイアログ閉じる

Ver1.0.09
====================================================
*/
function closeBackupViewDialog() {

    const dialog =
        document.getElementById(
            "backupViewDialog"
        );

    if (dialog) {
        dialog.style.display =
            "none";
    }
}