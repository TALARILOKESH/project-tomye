let model;
let tomatoData = [];

// ============================
// Load TensorFlow Model
// ============================
async function loadModel() {
    try {
        await tf.setBackend("webgl");
        model = await tf.loadLayersModel("/model/model.json");
        console.log("TensorFlow model loaded");
    } catch (error) {
        console.log("TensorFlow model optional, not loaded");
    }
}

loadModel();


// ============================
// Wake Render Server
// ============================
async function wakeServer() {
    try {
        await fetch("https://loki1406-tomye.hf.space/detect");
        console.log("Server waking up...");
    } catch (err) {
        console.log("Wake attempt failed");
    }
}

window.onload = function () {
    wakeServer();
};

function openInfo(){
document.getElementById("infoModal").style.display="flex";
}

function closeInfo(){
document.getElementById("infoModal").style.display="none";
}


// ============================
// Resize Image in Browser
// ============================
function compressImage(file, maxSize = 640) {

    return new Promise((resolve) => {

        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = function () {

            let width = img.width;
            let height = img.height;

            const scale = maxSize / Math.max(width, height);

            if (scale < 1) {
                width = width * scale;
                height = height * scale;
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
                resolve(blob);
            }, "image/jpeg", 0.85);
        };

        img.src = url;
    });
}


// ============================
// Process Image
// ============================
async function processImage() {

    const galleryInput = document.getElementById("imageInput");
    const cameraInput = document.getElementById("cameraInput");

    const file = galleryInput.files[0] || cameraInput.files[0];

    if (!file) {
        alert("Please upload or scan an image first");
        return;
    }

    const MAX_FILE_SIZE = 4 * 1024 * 1024;

    if (file.size > MAX_FILE_SIZE) {
        const proceed = confirm("⚠️ Large image detected. Continue?");
        if (!proceed) return;
    }

    const preview = document.getElementById("preview");
    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";

    document.getElementById("result").innerText = "Compressing image...";

    const compressedBlob = await compressImage(file, 640);

    const formData = new FormData();
    formData.append("image", compressedBlob, "compressed.jpg");

    document.getElementById("result").innerText = "Processing...";

    try {

        const response = await fetch(
            "https://loki1406-tomye.hf.space/detect",
            {
                method: "POST",
                body: formData
            }
        );

        if (!response.ok) {
            throw new Error("Server error");
        }

        const blob = await response.blob();
        const imageURL = URL.createObjectURL(blob);

        const resultImage = document.getElementById("resultImage");
        resultImage.src = imageURL;
        resultImage.style.display = "block";

        document.getElementById("result").innerText = "Detection Complete ✅";

        const goodHeader = response.headers.get("X-Good-Tomatoes");
        const badHeader = response.headers.get("X-Bad-Tomatoes");
        const noTomatoHeader = response.headers.get("X-No-Tomato");
        const tomatoHeader = response.headers.get("X-Tomato-Data");

        const good = goodHeader ? parseInt(goodHeader) : 0;
        const bad = badHeader ? parseInt(badHeader) : 0;
        const noTomato = noTomatoHeader ? parseInt(noTomatoHeader) : 0;

        if (tomatoHeader) {
            tomatoData = JSON.parse(tomatoHeader);
        }

        document.getElementById("classificationResult").innerHTML =
        `Good Tomatoes: ${good} <br> Bad Tomatoes: ${bad}`;

        if (noTomato === 1) {
            const resultText = document.getElementById("result");
            resultText.innerText = "No tomatoes detected";
            resultText.style.color = "#c62828";
        }
         else {
            document.getElementById("result").innerText = "";
        }

        // ============================
        // CLICK TO INSPECT TOMATO
        // ============================

        resultImage.onclick = function(event){

            const rect = resultImage.getBoundingClientRect();

            const scaleX = resultImage.naturalWidth / rect.width;
            const scaleY = resultImage.naturalHeight / rect.height;

            const clickX = (event.clientX - rect.left) * scaleX;
            const clickY = (event.clientY - rect.top) * scaleY;

            for(let tomato of tomatoData){

                if(clickX > tomato.x1 && clickX < tomato.x2 &&
                   clickY > tomato.y1 && clickY < tomato.y2){

                    showExplain(tomato);
                    return;

                }

            }

        };

    } catch (error) {

        console.error(error);

        document.getElementById("result").innerText = "Server Error ❌";
    }
}


// ============================
// SHOW EXPLANATION POPUP
// ============================

function showExplain(tomato){

const box = document.getElementById("explanationBox");
const text = document.getElementById("explanationText");

let html = `
<b>Prediction:</b> ${tomato.prediction}<br>
<b>Confidence:</b> ${tomato.confidence}<br><br>
<b>Explanation:</b><br>
`;

for(let e of tomato.explanation){
html += "• " + e + "<br>";
}

text.innerHTML = html;
box.style.display = "block";

}


// ============================
// CLOSE EXPLANATION
// ============================

function closeExplain(){
document.getElementById("explanationBox").style.display="none";
}