const imageInput =
    document.getElementById("imageInput");

const preview =
    document.getElementById("preview");

const scoreImageInput =
    document.getElementById("scoreImageInput");

const scorePreview =
    document.getElementById("scorePreview");

const timeResult =
    document.getElementById("timeResult");

let blueScore = 0;
let redScore = 0;
let remainingTime = "";
let remainingSeconds = 0;

const measureCanvas =
    document.getElementById("measureCanvas");

const scoreArea = {
    x:695,
    y:92,
    width:125,
    height:30
};
const blueScoreArea = {
    x:671,
    y:30,
    width:108,
    height:30
};
const redScoreArea = {
    x: 941,
    y: 30,
    width: 108,
    height: 30
};

const measureInfo =
    document.getElementById("measureInfo");

const measureCtx =
    measureCanvas.getContext("2d");

let startX;
let startY;
let dragging = false;


const areas = [
  {
    name: "北_拠点",
    type: "拠点",
    point: 0,
    unlockTime: 0,
    maxPoint: null,
    remainingPoint: null,
    x:685, y:76, width:150, height:62
  },

  {
    name: "西_拠点1",
    type: "拠点",
    point: 0,
    unlockTime: 0,
    maxPoint: null,
    remainingPoint: null,
    x:498, y:259, width:119, height:62
  },

  {
    name: "西_療養所",
    type: "療養所",
    point: 0,
    unlockTime: 0,
    maxPoint: null,
    remainingPoint: null,
   x:610, y:308, width:124, height:62
  },

  {
    name: "東_矢倉",
    type: "矢倉",
    point: 0,
    unlockTime: 0,
    maxPoint: null,
    remainingPoint: null,
   x:799, y:306, width:119, height:64
  },

  {
    name: "東_拠点1",
    type: "拠点",
    point: 0,
    unlockTime: 0,
    maxPoint: null,
    remainingPoint: null,
   x:908, y:259, width:119, height:62
  },

  {
    name: "西_拠点2",
    type: "拠点",
    point: 0,
    unlockTime: 0,
    maxPoint: null,
    remainingPoint: null,
    x:483, y:414, width:101, height:62
  },

  {
    name: "西_望楼",
    type: "望楼",
    point: 0,
    unlockTime: 0,
    maxPoint: null,
    remainingPoint: null,
    x:571, y:426, width:83, height:43
  },

  {
    name: "小田原城",
    type: "城",
    point: 0,
    unlockTime: 0,
    maxPoint: null,
    remainingPoint: null,
     x:695, y:406, width:125, height:55
  },

  {
    name: "東_望楼",
    type: "望楼",
    point: 0,
    unlockTime: 0,
    maxPoint: null,
    remainingPoint: null,
    x:867, y:426, width:80, height:44
  },

  {
    name: "東_拠点2",
    type: "拠点",
    point: 0,
    unlockTime: 0,
    maxPoint: null,
    remainingPoint: null,
    x:929, y:414, width:114, height:60
  },

  {
    name: "西_拠点3",
    type: "拠点",
    point: 0,
    unlockTime: 0,
    maxPoint: null,
    remainingPoint: null,
    x:0, y:0, width:0, height:0
  },

  {
    name: "西_矢倉",
    type: "矢倉",
    point: 0,
    unlockTime: 0,
    maxPoint: null,
    remainingPoint: null,
    x:0, y:0, width:0, height:0
  },

  {
    name: "東_療養所",
    type: "療養所",
    point: 0,
    unlockTime: 0,
    maxPoint: null,
    remainingPoint: null,
   x:799, y:306, width:119, height:64
  },

  {
    name: "東_拠点3",
    type: "拠点",
    point: 0,
    unlockTime: 0,
    maxPoint: null,
    remainingPoint: null,
    x:0, y:0, width:0, height:0
  },

  {
    name: "南_拠点",
    type: "拠点",
    point: 0,
    unlockTime: 0,
    maxPoint: null,
    remainingPoint: null,
    x:0, y:0, width:0, height:0
  }
];
// ★ここから追加
const remainAreas = [
    {
        name:"北_1城",
        x:694,
        y:116,
        width:135,
        height:22
    },
    {
        name:"北_2城",
        x:694,
        y:284,
        width:135,
        height:22
    },
    {
        name:"南_3城",
        x:694,
        y:621,
        width:135,
        height:22
    },
    {
        name:"南_4城",
        x:694,
        y:789,
        width:135,
        height:22
    }
];

const remainInputs = {
    "北1城": document.getElementById("remain_北_1城"),
    "北2城": document.getElementById("remain_北_2城"),
    "南3城": document.getElementById("remain_南_3城"),
    "南4城": document.getElementById("remain_南_4城")
};


let remainPointResults = [];

const cropAreaElement =
    document.getElementById("cropArea");



areas.forEach((area, index) => {

    area.canvas = "canvas_" + index;

cropAreaElement.innerHTML += `
    <div class="facility facility-${index}">
        <h3>${index + 1} ${area.name}</h3>
        <canvas id="${area.canvas}"></canvas>
    </div>
`;

});
imageInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    const reader = new FileReader();
   preview.onload = function(){

    measureCanvas.width =
        preview.naturalWidth;

    measureCanvas.height =
        preview.naturalHeight;

    measureCtx.drawImage(
        preview,
        0,
        0
    );

    //readRemainPoints();
       showRemainImages();
};

    reader.onload = function (e) {

        preview.src = e.target.result;

        preview.style.display = "block";

    };


    
    reader.readAsDataURL(file);

});
scoreImageInput.addEventListener("change", function(){

    const file = this.files[0];

    if(!file) return;

    const reader = new FileReader();

reader.onload = function(e){

        scorePreview.src = e.target.result;
        scorePreview.style.display = "block";

scorePreview.onload = function(){
    cropScoreTime();
    cropBlueScore();
    cropRedScore();

    setTimeout(() => {
        readScore();
    }, 100);
};
};

    reader.readAsDataURL(file);
});
let scoreTimeCanvas;

function cropScoreTime(){

    const canvas = document.createElement("canvas");

    const ctx = canvas.getContext("2d");

    canvas.width = scoreArea.width;
    canvas.height = scoreArea.height;

    ctx.drawImage(
        scorePreview,
        scoreArea.x,
        scoreArea.y,
        scoreArea.width,
        scoreArea.height,
        0,
        0,
        scoreArea.width,
        scoreArea.height
    );
/*const imageData = ctx.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
);

const data = imageData.data;

for(let i = 0; i < data.length; i += 4){

    const r = data[i];
    const g = data[i+1];
    const b = data[i+2];

    // 白文字だけ残す
    if(r > 180 && g > 180 && b > 180){
        data[i] = 255;
        data[i+1] = 255;
        data[i+2] = 255;
    }
    else{
        data[i] = 0;
        data[i+1] = 0;
        data[i+2] = 0;
    }
}*/

// ctx.putImageData(imageData,0,0);
scoreTimeCanvas = canvas;

const box =
    document.getElementById("scorePreview_time");

if(box){
    box.innerHTML = "";
    box.appendChild(canvas);
}

setTimeout(() => {
    readTime();
}, 100);

//document.body.appendChild(canvas);

setTimeout(() => {
    readTime();
}, 100);
}

let blueScoreCanvas;

function cropBlueScore(){

    const canvas = document.createElement("canvas");

    const ctx = canvas.getContext("2d");

    canvas.width = blueScoreArea.width;
    canvas.height = blueScoreArea.height;

    ctx.drawImage(
        scorePreview,
        blueScoreArea.x,
        blueScoreArea.y,
        blueScoreArea.width,
        blueScoreArea.height,
        0,
        0,
        blueScoreArea.width,
        blueScoreArea.height
    );

   blueScoreCanvas = canvas;

const box =
    document.getElementById("scorePreview_blue");

if(box){
    box.innerHTML = "";
    box.appendChild(canvas);
}

    //document.body.appendChild(canvas);

}
let redScoreCanvas;

function cropRedScore(){

    const canvas = document.createElement("canvas");

    const ctx = canvas.getContext("2d");

    canvas.width = redScoreArea.width;
    canvas.height = redScoreArea.height;

    ctx.drawImage(
        scorePreview,
        redScoreArea.x,
        redScoreArea.y,
        redScoreArea.width,
        redScoreArea.height,
        0,
        0,
        redScoreArea.width,
        redScoreArea.height
    );

  redScoreCanvas = canvas;

const box =
    document.getElementById("scorePreview_red");

if(box){
    box.innerHTML = "";
    box.appendChild(canvas);
}

    //document.body.appendChild(canvas);

}


async function readTime(){

    const { data:{ text } } =
        await Tesseract.recognize(
            scoreTimeCanvas,
            "eng"
        );

    console.log(text);

 remainingTime = text.trim();

remainingSeconds =
    timeToSeconds(remainingTime);

timeResult.textContent =
    "残り時間：" + remainingTime +
    "（" + remainingSeconds + "秒）";
document.getElementById("inputRemainTime").value =
    remainingTime;
}
async function readScore(){

    const blueResult =
        await Tesseract.recognize(
            blueScoreCanvas,
            "eng"
        );

    const redResult =
        await Tesseract.recognize(
            redScoreCanvas,
            "eng"
        );


    blueScore =
        Number(
            blueResult.data.text.replace(/\D/g,"")
        ) || 0;


    redScore =
        Number(
            redResult.data.text.replace(/\D/g,"")
        ) || 0;


   console.log({
    blueScore,
    redScore
});

document.getElementById("inputBlueScore").value =
    blueScore;

document.getElementById("inputRedScore").value =
    redScore;


scoreResult.textContent =
    "青スコア：" + blueScore.toLocaleString() +
    "\n赤スコア：" + redScore.toLocaleString();


    
}
async function readRemainPoints(){

    const previewBox =
        document.getElementById("remainPreview");

    previewBox.innerHTML = "";

    for(const area of remainAreas){

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = area.width;
        canvas.height = area.height;


        ctx.drawImage(
            preview,
            area.x,
            area.y,
            area.width,
            area.height,
            0,
            0,
            area.width,
            area.height
        );


        const result =
            await Tesseract.recognize(
                canvas,
                "eng",
                {
                    tessedit_char_whitelist:"0123456789/",
                    tessedit_pageseg_mode:"7"
                }
            );


console.log(
    area.name,
    result.data.text
);

const value =
    Number(
        result.data.text.replace(/\D/g,"")
    ) || 0;

const target =
    areas.find(
        a => a.name === area.name
    );

if(target){
    target.remainingPoint = value;
}

const input =
    document.getElementById(
        "remain_" + area.name
    );
        if(input){
            input.value = value;
        }
    }
}

function showRemainImages(){

    for(const area of remainAreas){

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = area.width;
        canvas.height = area.height;

        ctx.drawImage(
            preview,
            area.x,
            area.y,
            area.width,
            area.height,
            0,
            0,
            area.width,
            area.height
        );

        const box =
            document.getElementById(
                "remainPreview_" + area.name
            );

        if(box){
            box.innerHTML = "";
            box.appendChild(canvas);
        }

    }

}
function timeToSeconds(time){

    // 全角コロンを半角に変換
    time = time.replace("：", ":");

    const parts = time.split(":");

    // 分:秒
    if(parts.length === 2){

        const min = parseInt(parts[0]) || 0;
        const sec = parseInt(parts[1]) || 0;

        return min * 60 + sec;
    }

    // 時:分:秒（OCR用）
    if(parts.length === 3){

        const hour = parseInt(parts[0]) || 0;
        const min = parseInt(parts[1]) || 0;
        const sec = parseInt(parts[2]) || 0;

        return hour * 3600 + min * 60 + sec;
    }

    return 0;
}
const analyzeButton =
    document.getElementById("analyzeButton");

const judgeResult =
    document.getElementById("judgeResult");

const reportResult =
    document.getElementById("reportResult");

const elapsedDisplay =
    document.getElementById("elapsedDisplay");

const scoreResult =
    document.getElementById("scoreResult");

analyzeButton.addEventListener("click", async function () {

    if (!preview.src) {

        alert("画像を選択してください");

        return;

    }

    
const remainText =
    document.getElementById("inputRemainTime").value;
   
remainingSeconds =
    timeToSeconds(remainText);

    console.log("残り時間入力:", remainText);
    console.log("remainingSeconds:", remainingSeconds);

    judgeResult.textContent = "解析中・・・";
    reportResult.textContent = "解析中・・・";
    
blueScore =
    Number(document.getElementById("inputBlueScore").value) || 0;

redScore =
    Number(document.getElementById("inputRedScore").value) || 0;
   judgeResult.textContent = "解析中・・・";
   reportResult.textContent = "解析中・・・";

    // 残ポイント入力を反映
areas.forEach(area => {

    const input =
        document.getElementById(
            "remain_" + area.name
        );

    if(input){
        area.remainingPoint =
            Number(input.value);
    }

});
    
for (const area of remainAreas) {

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = area.width;
    canvas.height = area.height;

    ctx.drawImage(
        preview,
        area.x,
        area.y,
        area.width,
        area.height,
        0,
        0,
        area.width,
        area.height
    );
  
    //document.body.appendChild(canvas);


 
// ★4倍拡大
/*const scale = 4;

const bigCanvas = document.createElement("canvas");

bigCanvas.width = canvas.width * scale;
bigCanvas.height = canvas.height * scale;

const bigCtx = bigCanvas.getContext("2d");

bigCtx.imageSmoothingEnabled = false;

bigCtx.drawImage(
    canvas,
    0,
    0,
    bigCanvas.width,
    bigCanvas.height
);
*/
//document.body.appendChild(canvas);


// 元画像をOCR
const result =
    await Tesseract.recognize(
        canvas,
        "eng",
{
    tessedit_char_whitelist: "0123456789:",
    tessedit_pageseg_mode: "7",
    preserve_interword_spaces: "0"
}
    );


    console.log(
        area.name,
        result.data.text
    );

}
    
const totalGameTime = 3600;

const elapsedTime =
    totalGameTime - remainingSeconds;


// ★経過時間表示
const elapsedMin = Math.floor(elapsedTime / 60);
const elapsedSec = elapsedTime % 60;

const elapsedText =
    elapsedMin + ":" + String(elapsedSec).padStart(2,"0");


// 元画像
const img = preview;


// OCR（まだ仮）
let output = "解析結果\n";

let bluePerSec = 0;
let redPerSec = 0;

for (const area of areas){

    if(area.width === 0 || area.height === 0){
        output += area.name + " : 座標未設定\n";
        continue;
    }

    cropArea(img, area);

    const canvas =
        document.getElementById(area.canvas);

    const owner =
        detectOwner(canvas, area);

area.owner = owner;
if(area.name === "中央拠点"){
    console.log(area);
}
    
    
if(area.remainingPoint === 0){
    area.active = false;
}
else{
    area.active = true;
}

    const unlocked =
    elapsedTime >= area.unlockTime;

if(unlocked){

if(owner === "青" && area.active){
    bluePerSec += area.point;
}

if(owner === "赤" && area.active){
    redPerSec += area.point;
}

}

let mark = "⚪";

if(owner === "青"){
    mark = "🔵";
}
else if(owner === "赤"){
    mark = "🔴";
}

output +=
    mark + " " + area.name.replace("_"," ") + "\n";
}
output += "\n----------------\n";
output += "🔵青 : " + bluePerSec + "点/秒\n";
output += "🔴赤 : " + redPerSec + "点/秒\n";
output += "差 : " + (bluePerSec - redPerSec) + "点/秒\n";

/*output += "\n現在ポイント\n";
output += "🔵青 : " + blueScore.toLocaleString() + "\n";
output += "🔴赤 : " + redScore.toLocaleString() + "\n";
output += "現在差 : " + (blueScore - redScore).toLocaleString() + "\n";*/

const finalSeconds = remainingSeconds - 1;

let blueAdd = 0;
let redAdd = 0;

for (const area of areas) {

    if (area.owner === "白") continue;

    let addPoint = area.point * finalSeconds;

    // 上限あり施設（城・中央拠点）
    if (area.maxPoint !== null && area.remainingPoint !== undefined) {

        addPoint = Math.min(
            addPoint,
            area.remainingPoint
        );
    }

    if (area.owner === "青") {
        blueAdd += addPoint;
    }

    if (area.owner === "赤") {
        redAdd += addPoint;
    }
}

const blueFinal = blueScore + blueAdd;
const redFinal = redScore + redAdd;
// 逆転に必要な毎秒ポイント
const currentDiff = blueScore - redScore;
const rateDiff = bluePerSec - redPerSec;
    
/*output += "\n勝敗予測\n";*/



/*output += "\n逆転条件\n";

if (currentDiff > 0) {
    // 青が勝っている → 赤が必要
    const need =
        Math.ceil((currentDiff + 1) / finalSeconds);

    output += "赤が逆転するには +" + need + "点/秒必要\n";
}
else if (currentDiff < 0) {
    // 赤が勝っている → 青が必要
    const need =
        Math.ceil((-currentDiff + 1) / finalSeconds);

    output += "青が逆転するには +" + need + "点/秒必要\n";
}
else {
    output += "現在同点\n";
}
    
if(blueFinal > redFinal){
    output += "青勝利予測\n";
}
else if(redFinal > blueFinal){
    output += "赤勝利予測\n";
}
else{
    output += "引き分け予測\n";
}

output += "\n終了時予測\n";
output += "青 : " + Math.floor(blueFinal).toLocaleString() + "\n";
output += "赤 : " + Math.floor(redFinal).toLocaleString() + "\n";
*/    
// 左側（判定）
judgeResult.textContent = output;

// 右側（軍師報告）
let report = "";

report += (blueFinal > redFinal)
    ? "🔵青勝利予測\n\n"
    : (redFinal > blueFinal)
    ? "🔴赤勝利予測\n\n"
    : "引き分け予測\n\n";

report += "現在ポイント\n";
report += "🔵青：" + blueScore.toLocaleString() + "\n";
report += "🔴赤：" + redScore.toLocaleString() + "\n";
report += "現在差：" +
    (blueScore - redScore).toLocaleString() + "\n\n";

report += "毎秒差：" +
    (bluePerSec - redPerSec) + "点/秒\n\n";

if (currentDiff > 0) {
    const need = Math.ceil((currentDiff + 1) / finalSeconds);
    report += "赤逆転条件：+" + need + "点/秒\n\n";
}
else if (currentDiff < 0) {
    const need = Math.ceil((-currentDiff + 1) / finalSeconds);
    report += "青逆転条件：+" + need + "点/秒\n\n";
}

report += "終了時予測\n";
report += "🔵青：" + Math.floor(blueFinal).toLocaleString() + "\n";
report += "🔴赤：" + Math.floor(redFinal).toLocaleString();

    elapsedDisplay.textContent =
    "経過時間：" + elapsedText;
reportResult.textContent = report;


});
function cropArea(image, area){

    const canvas =
        document.getElementById(area.canvas);

    const ctx =
        canvas.getContext("2d");

    canvas.width =
        area.width;

    canvas.height =
        area.height;

    ctx.drawImage(

        image,

        area.x,
        area.y,
        area.width,
        area.height,

        0,
        0,
        area.width,
        area.height

    );
// 解析範囲を赤枠表示
/*
    ctx.strokeStyle = "red";
ctx.lineWidth = 2;

let targetHeight;
let startX;
let targetWidth;

if (area.type === "城" || area.type === "拠点") {
    targetHeight = Math.floor(canvas.height / 3);
    startX = Math.floor(canvas.width * 0.2);
    targetWidth = Math.floor(canvas.width * 0.6);
} else {
    targetHeight = Math.floor(canvas.height / 2);
    startX = Math.floor(canvas.width * 0.15);
    targetWidth = Math.floor(canvas.width * 0.7);
}

ctx.strokeRect(
    startX,
    0,
    targetWidth,
    targetHeight
);
*/
}

function detectOwner(canvas, area){

    const ctx = canvas.getContext("2d");

let targetHeight;
let startX;
let targetWidth;

if (area.type === "城" || area.type === "拠点") {
    targetHeight = Math.floor(canvas.height / 3);
    startX = Math.floor(canvas.width * 0.2);
    targetWidth = Math.floor(canvas.width * 0.6);
} else {
    targetHeight = Math.floor(canvas.height / 2);
    startX = Math.floor(canvas.width * 0.15);
    targetWidth = Math.floor(canvas.width * 0.7);
}

const imageData =
    ctx.getImageData(
        startX,
        0,
        targetWidth,
        targetHeight
    );

    let blue = 0;
    let red = 0;
    let white = 0;
    let green = 0;

    const data = imageData.data;

    for(let i = 0; i < data.length; i += 4){

        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];


        // 緑の平地は除外
        if(g > r * 1.15 && g > b * 1.15){
            green++;
            continue;
        }


// 青同盟
const brightness = r + g + b;

if(
    brightness > 150 &&
    b > r * 1.15 &&
    b > g * 1.05 &&
    b - r > 20
){
    blue++;
}


        // 赤同盟
        else if(r > b * 1.2 && r > g * 1.05){
            red++;
        }


        // 白系（未取得候補）
        else if(r > 180 && g > 180 && b > 180){
            white++;
        }

    }


    console.log({
        blue,
        red,
        white,
        green
    });


    if(blue > red && blue > 50){
        return "青";
    }


    if(red > blue && red > 50){
        return "赤";
    }


    return "白";
}
measureCanvas.addEventListener("mousedown",function(e){

    const rect =
        measureCanvas.getBoundingClientRect();

    startX =
        Math.round((e.clientX-rect.left) *
        measureCanvas.width/rect.width);

    startY =
        Math.round((e.clientY-rect.top) *
        measureCanvas.height/rect.height);

    dragging = true;

});
measureCanvas.addEventListener("mousemove",function(e){

    if(!dragging)return;

    const rect =
        measureCanvas.getBoundingClientRect();

    const nowX =
        Math.round((e.clientX-rect.left) *
        measureCanvas.width/rect.width);

    const nowY =
        Math.round((e.clientY-rect.top) *
        measureCanvas.height/rect.height);

    measureCtx.clearRect(
        0,
        0,
        measureCanvas.width,
        measureCanvas.height
    );

    measureCtx.drawImage(
        preview,
        0,
        0
    );

    measureCtx.strokeStyle="red";

    measureCtx.lineWidth=3;

    measureCtx.strokeRect(
        startX,
        startY,
        nowX-startX,
        nowY-startY
    );

});

measureCanvas.addEventListener("mouseup",function(e){

    dragging=false;

    const rect =
        measureCanvas.getBoundingClientRect();

    const endX =
        Math.round((e.clientX-rect.left) *
        measureCanvas.width/rect.width);

    const endY =
        Math.round((e.clientY-rect.top) *
        measureCanvas.height/rect.height);

    const x =
        Math.min(startX,endX);

    const y =
        Math.min(startY,endY);

    const width =
        Math.abs(endX-startX);

    const height =
        Math.abs(endY-startY);

    measureInfo.textContent=
`x:${x}
y:${y}
width:${width}
height:${height}`;
});
