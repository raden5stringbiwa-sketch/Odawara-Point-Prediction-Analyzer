"use strict";

/* =====================================================
   設定(新ゲーム用)  ★ここだけ書き換えれば動きます
   ===================================================== */

// 試合時間(秒)。ゲームに合わせて変更
const TOTAL_GAME_TIME = 3600;

// 判定領域のうち、この割合以上が青/赤なら「占有」とみなす
const MIN_COLOR_RATIO = 0.03;

// スコア画像の読み取り範囲 ★旧ゲームの値のまま。測量モードで測り直してください
const timeArea      = { x: 694, y: 126, width: 124, height: 36 };
const blueScoreArea = { x: 671, y: 30, width: 108, height: 30 };
const redScoreArea  = { x: 941, y: 30, width: 108, height: 30 };

// 戦況画像の拠点(5か所)
// 並び順は style.css の .facility-0〜4 に対応:
//   0:北(上) / 1:西望楼(左) / 2:小田原城(中央) / 3:東望楼(右) / 4:南(下)
//  point : 占有時に入る毎秒ポイント ★要設定
//  remain: 残ポイント表示の位置(あるのは北・南だけ)
//  unlockTime: 解放される経過秒(不要なら 0)
//  region: 所有者判定に使う範囲(割合 0〜1)。省略すると上1/3の中央60%
const areas = [
    { name: "北",     point: 30, unlockTime: 0,
      x: 685, y: 76, width: 150, height: 62,
      remain: { x: 702, y: 116, width: 128, height: 21 } },

    { name: "西望楼", point: 32, unlockTime: 0,
      x: 571, y: 426, width: 83, height: 43,
      region: { x: 0.15, y: 0, w: 0.7, h: 0.5 } },

    { name: "小田原城", point: 40, unlockTime: 0,
      x: 695, y: 406, width: 125, height: 55 },

    { name: "東望楼", point: 32, unlockTime: 0,
      x: 867, y: 426, width: 83, height: 43,
      region: { x: 0.15, y: 0, w: 0.7, h: 0.5 } },

    { name: "南",     point: 30, unlockTime: 0,
      x: 698, y: 780, width: 150, height: 62,
      remain: { x: 702, y: 789, width: 128, height: 21 } }
];

const DEFAULT_REGION = { x: 0.2, y: 0, w: 0.6, h: 1 / 3 };

/* =====================================================
   DOM
   ===================================================== */

const imageInput       = document.getElementById("imageInput");
const preview          = document.getElementById("preview");
const scoreImageInput  = document.getElementById("scoreImageInput");
const scorePreview     = document.getElementById("scorePreview");
const timeResult       = document.getElementById("timeResult");
const scoreResult      = document.getElementById("scoreResult");
const judgeResult      = document.getElementById("judgeResult");
const reportResult     = document.getElementById("reportResult");
const elapsedDisplay   = document.getElementById("elapsedDisplay");
const analyzeButton    = document.getElementById("analyzeButton");
const cropAreaElement  = document.getElementById("cropArea");
const remainInputArea  = document.getElementById("remainInputArea");
const inputBlueScore   = document.getElementById("inputBlueScore");
const inputRedScore    = document.getElementById("inputRedScore");
const inputRemainTime  = document.getElementById("inputRemainTime");
const measureCanvas    = document.getElementById("measureCanvas");
const measureInfo      = document.getElementById("measureInfo");
const measureCtx       = measureCanvas.getContext("2d");

/* =====================================================
   画面の組み立て(areas から自動生成)
   ===================================================== */

areas.forEach((area, i) => {
    area.canvasId = "canvas_" + i;
});

// 切り抜き表示
cropAreaElement.innerHTML = areas.map((area, i) => `
    <div class="facility facility-${i}">
        <h3>${i + 1} ${area.name}</h3>
        <canvas id="${area.canvasId}"></canvas>
    </div>
`).join("");

// 残ポイント入力欄(remain がある拠点だけ)
const remainTargets = areas.filter(a => a.remain);

remainInputArea.insertAdjacentHTML("beforeend", remainTargets.map(a => `
    <div class="remain-row">
        <div id="remainPreview_${a.name}"></div>
        <span>${a.name}</span>
        <input id="remain_${a.name}" type="number" placeholder="未入力">
    </div>
`).join(""));

/* =====================================================
   共通ヘルパー
   ===================================================== */

function cropToCanvas(image, rect, scale = 1) {
    const canvas = document.createElement("canvas");
    canvas.width  = rect.width  * scale;
    canvas.height = rect.height * scale;
    canvas.getContext("2d").drawImage(
        image,
        rect.x, rect.y, rect.width, rect.height,
        0, 0, canvas.width, canvas.height
    );
    return canvas;
}

function showIn(boxId, canvas) {
    const box = document.getElementById(boxId);
    if (box) {
        box.innerHTML = "";
        box.appendChild(canvas);
    }
}

function readFileAsDataURL(file, callback) {
    const reader = new FileReader();
    reader.onload = e => callback(e.target.result);
    reader.readAsDataURL(file);
}

function timeToSeconds(time) {
    const parts = time.replace(/：/g, ":").trim().split(":");
    const nums = parts.map(p => parseInt(p, 10) || 0);

    if (nums.length === 2) return nums[0] * 60 + nums[1];
    if (nums.length === 3) return nums[0] * 3600 + nums[1] * 60 + nums[2];
    return 0;
}

/* =====================================================
   OCR(workerを1つ作って使い回す)
   ===================================================== */

let worker = null;
let ocrQueue = Promise.resolve();

async function getWorker() {
    if (!worker) worker = await Tesseract.createWorker("eng");
    return worker;
}

// 切り抜いて3倍に拡大してからOCR。呼び出しは順番に処理される
function ocrRect(image, rect, whitelist, psm = "7") {
    const canvas = cropToCanvas(image, rect, 3);

    const job = ocrQueue.then(async () => {
        const w = await getWorker();
        await w.setParameters({
            tessedit_char_whitelist: whitelist,
            tessedit_pageseg_mode: psm
        });
        const { data: { text } } = await w.recognize(canvas);
        return text.trim();
    });

    ocrQueue = job.catch(() => {});
    return job;
}

/* =====================================================
   戦況画像の読み込み
   ===================================================== */

imageInput.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    readFileAsDataURL(file, src => {
        preview.onload = function () {
            measureCanvas.width  = preview.naturalWidth;
            measureCanvas.height = preview.naturalHeight;
            measureCtx.drawImage(preview, 0, 0);

            showRemainImages();
            readRemainPoints();
        };
        preview.src = src;
        preview.style.display = "block";
    });
});

function showRemainImages() {
    for (const area of remainTargets) {
        showIn("remainPreview_" + area.name, cropToCanvas(preview, area.remain));
    }
}

// 「12345/50000」「1/50000」のような表示から、スラッシュより前(現在の残ポイント)を取り出す
function parseRemain(text) {
    const t = text.replace(/\s/g, "");

    if (t.includes("/")) {
        return t.split("/")[0].replace(/\D/g, "");
    }

    // スラッシュが読めなかった場合:最大値が5桁なので、末尾5桁を除く
    const digits = t.replace(/\D/g, "");
    return digits.length > 5 ? digits.slice(0, -5) : "";
}

async function readRemainPoints() {
    for (const area of remainTargets) {
        const text = await ocrRect(preview, area.remain, "0123456789/");
        console.log(area.name, "残ポイントOCR:", text);

        const input = document.getElementById("remain_" + area.name);
        if (input) input.value = parseRemain(text);   // 読めなければ空欄
    }
}

/* =====================================================
   スコア画像の読み込み
   ===================================================== */

scoreImageInput.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    readFileAsDataURL(file, src => {
        scorePreview.onload = readScoreImage;
        scorePreview.src = src;
        scorePreview.style.display = "block";
    });
});

async function readScoreImage() {
    showIn("scorePreview_time", cropToCanvas(scorePreview, timeArea));
    showIn("scorePreview_blue", cropToCanvas(scorePreview, blueScoreArea));
    showIn("scorePreview_red",  cropToCanvas(scorePreview, redScoreArea));

    const timeText = await ocrRect(scorePreview, timeArea, "0123456789:");
    const blueText = await ocrRect(scorePreview, blueScoreArea, "0123456789,");
    const redText  = await ocrRect(scorePreview, redScoreArea, "0123456789,");

    const blue = Number(blueText.replace(/\D/g, "")) || 0;
    const red  = Number(redText.replace(/\D/g, "")) || 0;

    inputRemainTime.value = timeText;
    inputBlueScore.value  = blue;
    inputRedScore.value   = red;

    timeResult.textContent =
        "残り時間:" + timeText + "(" + timeToSeconds(timeText) + "秒)";
    scoreResult.textContent =
        "青スコア:" + blue.toLocaleString() +
        "\n赤スコア:" + red.toLocaleString();
}

/* =====================================================
   所有者の判定(青 / 赤 / 白=未占有)
   ===================================================== */

function cropArea(image, area) {
    const canvas = document.getElementById(area.canvasId);
    canvas.width  = area.width;
    canvas.height = area.height;
    canvas.getContext("2d").drawImage(
        image,
        area.x, area.y, area.width, area.height,
        0, 0, area.width, area.height
    );
    return canvas;
}

function detectOwner(canvas, area) {
    const r = area.region || DEFAULT_REGION;

    const sx = Math.floor(canvas.width  * r.x);
    const sy = Math.floor(canvas.height * r.y);
    const sw = Math.max(1, Math.floor(canvas.width  * r.w));
    const sh = Math.max(1, Math.floor(canvas.height * r.h));

    const { data } = canvas.getContext("2d").getImageData(sx, sy, sw, sh);

    let blue = 0;
    let red = 0;

    for (let i = 0; i < data.length; i += 4) {
        const r_ = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // 緑の平地は除外
        if (g > r_ * 1.15 && g > b * 1.15) continue;

        if (r_ + g + b > 150 && b > r_ * 1.15 && b > g * 1.05 && b - r_ > 20) {
            blue++;
        } else if (r_ > b * 1.2 && r_ > g * 1.05) {
            red++;
        }
    }

    const total = sw * sh;
    const blueRatio = blue / total;
    const redRatio  = red / total;

    console.log(area.name, { blue, red, blueRatio, redRatio });

    if (blue > red && blueRatio >= MIN_COLOR_RATIO) return "青";
    if (red > blue && redRatio >= MIN_COLOR_RATIO)  return "赤";
    return "白";
}

/* =====================================================
   解析
   ===================================================== */

analyzeButton.addEventListener("click", function () {

    if (!imageInput.files[0]) {
        alert("戦況画像を選択してください");
        return;
    }

    const blueScore = Number(inputBlueScore.value) || 0;
    const redScore  = Number(inputRedScore.value) || 0;
    const remainingSeconds = timeToSeconds(inputRemainTime.value);

    const elapsedTime = Math.max(0, TOTAL_GAME_TIME - remainingSeconds);
    const finalSeconds = Math.max(0, remainingSeconds - 1);

    let output = "解析結果\n";
    let bluePerSec = 0;
    let redPerSec = 0;
    let blueAdd = 0;
    let redAdd = 0;

    for (const area of areas) {

        // 残ポイント(入力欄が空なら null=不明)
        if (area.remain) {
            const value = document.getElementById("remain_" + area.name).value;
            area.remainingPoint = value === "" ? null : Number(value);
        } else {
            area.remainingPoint = null;
        }

        const canvas = cropArea(preview, area);
        area.owner = detectOwner(canvas, area);

        const unlocked = elapsedTime >= (area.unlockTime || 0);
        const active = area.remainingPoint !== 0;     // 残0なら枯渇

        if (unlocked && active && area.owner !== "白") {

            // 現在の毎秒ポイント
            if (area.owner === "青") bluePerSec += area.point;
            if (area.owner === "赤") redPerSec  += area.point;

            // 終了までに増える分(残ポイントがあれば上限)
            let addPoint = area.point * finalSeconds;
            if (area.remainingPoint !== null) {
                addPoint = Math.min(addPoint, area.remainingPoint);
            }

            if (area.owner === "青") blueAdd += addPoint;
            if (area.owner === "赤") redAdd  += addPoint;
        }

        const mark = area.owner === "青" ? "🔵"
                   : area.owner === "赤" ? "🔴" : "⚪";

        output += mark + " " + area.name;
        if (area.remain) {
            output += "(残 " +
                (area.remainingPoint === null ? "不明" : area.remainingPoint.toLocaleString()) + ")";
        }
        output += "\n";
    }

    output += "\n----------------\n";
    output += "🔵青 : " + bluePerSec + "点/秒\n";
    output += "🔴赤 : " + redPerSec + "点/秒\n";
    output += "差 : " + (bluePerSec - redPerSec) + "点/秒\n";

    judgeResult.textContent = output;

    // ---- 軍師報告 ----
    const blueFinal = blueScore + blueAdd;
    const redFinal  = redScore + redAdd;
    const currentDiff = blueScore - redScore;

    let report = "";

    report += blueFinal > redFinal ? "🔵青勝利予測\n\n"
            : redFinal > blueFinal ? "🔴赤勝利予測\n\n"
            : "引き分け予測\n\n";

    report += "現在ポイント\n";
    report += "🔵青:" + blueScore.toLocaleString() + "\n";
    report += "🔴赤:" + redScore.toLocaleString() + "\n";
    report += "現在差:" + currentDiff.toLocaleString() + "\n\n";
    report += "毎秒差:" + (bluePerSec - redPerSec) + "点/秒\n\n";

    if (finalSeconds > 0 && currentDiff !== 0) {
        const need = Math.ceil((Math.abs(currentDiff) + 1) / finalSeconds);
        report += (currentDiff > 0 ? "赤" : "青") + "逆転条件:+" + need + "点/秒\n\n";
    }

    report += "終了時予測\n";
    report += "🔵青:" + Math.floor(blueFinal).toLocaleString() + "\n";
    report += "🔴赤:" + Math.floor(redFinal).toLocaleString();

    reportResult.textContent = report;

    const elapsedMin = Math.floor(elapsedTime / 60);
    const elapsedSec = elapsedTime % 60;
    elapsedDisplay.textContent =
        "経過時間:" + elapsedMin + ":" + String(elapsedSec).padStart(2, "0");
});

/* =====================================================
   測量モード(マウス・タッチ両対応)
   ===================================================== */

let startX = 0;
let startY = 0;
let dragging = false;

measureCanvas.style.touchAction = "none";

function getPos(e) {
    const rect = measureCanvas.getBoundingClientRect();
    return {
        x: Math.round((e.clientX - rect.left) * measureCanvas.width  / rect.width),
        y: Math.round((e.clientY - rect.top)  * measureCanvas.height / rect.height)
    };
}

measureCanvas.addEventListener("pointerdown", function (e) {
    const p = getPos(e);
    startX = p.x;
    startY = p.y;
    dragging = true;
    measureCanvas.setPointerCapture(e.pointerId);
});

measureCanvas.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    const p = getPos(e);

    measureCtx.clearRect(0, 0, measureCanvas.width, measureCanvas.height);
    measureCtx.drawImage(preview, 0, 0);
    measureCtx.strokeStyle = "red";
    measureCtx.lineWidth = 3;
    measureCtx.strokeRect(startX, startY, p.x - startX, p.y - startY);
});

measureCanvas.addEventListener("pointerup", function (e) {
    if (!dragging) return;
    dragging = false;

    const p = getPos(e);
    measureInfo.textContent =
`x:${Math.min(startX, p.x)}
y:${Math.min(startY, p.y)}
width:${Math.abs(p.x - startX)}
height:${Math.abs(p.y - startY)}`;
});
