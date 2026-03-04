let model;

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
        await fetch("https://new-one-0sbx.onrender.com/");
        console.log("Server waking up...");
    } catch (err) {
        console.log("Wake attempt failed");
    }
}

window.onload = function () {
    wakeServer();
};


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

    const fileInput = document.getElementById("imageInput");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please upload image first");
        return;
    }

    // File size warning
    const MAX_FILE_SIZE = 4 * 1024 * 1024;

    if (file.size > MAX_FILE_SIZE) {
        const proceed = confirm(
            "⚠️ Large image detected. Continue?"
        );
        if (!proceed) return;
    }

    const preview = document.getElementById("preview");
    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";

    document.getElementById("result").innerText = "Compressing image...";

    // Compress to 640px
    const compressedBlob = await compressImage(file, 640);

    const formData = new FormData();
    formData.append("image", compressedBlob, "compressed.jpg");

    document.getElementById("result").innerText = "Processing...";

    try {

        const response = await fetch(
            "https://new-one-0sbx.onrender.com/detect",
            {
                method: "POST",
                body: formData
            }
        );

        if (!response.ok) {
            throw new Error("Server error");
        }

        // 🔴 Get tomato counts from backend headers
        const good = response.headers.get("X-Good-Tomatoes") || 0;
        const bad = response.headers.get("X-Bad-Tomatoes") || 0;

        const blob = await response.blob();
        const imageURL = URL.createObjectURL(blob);

        const resultImage = document.getElementById("resultImage");
        resultImage.src = imageURL;
        resultImage.style.display = "block";

        document.getElementById("result").innerText =
            "Detection Complete ✅";

        // 🟢 Show tomato counts on webpage
        document.getElementById("classificationResult").innerText =
            `Good Tomatoes: ${good} | Bad Tomatoes: ${bad}`;

    } catch (error) {

        console.error(error);

        document.getElementById("result").innerText =
            "Server Error ❌";
    }
}