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
                    createCell(
                        item.memo || ""
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
====================================================
*/

function setupButtons() {

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

                console.log(
                    "Service Worker登録成功",
                    registration.scope
                );

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

            console.log(
                "写真取得:",
                file.name
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

            console.log(
                "写真DB準備完了"
            );

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

====================================================
*/

function savePhoto(id, file){

    if(!photoDB){

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

    store.put({

        id:id,

        image:file,

        time:new Date().toISOString()

    });

    transaction.oncomplete =
        ()=>{

            console.log(
                "写真保存完了:",
                id
            );

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

            console.log(

                "写真削除完了:",

                id

            );

        };

    transaction.oncomplete =
        () => {

            if (callback) {

                callback();

            }

        };

}