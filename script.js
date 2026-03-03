async function processImage() {

    const file = document.getElementById("imageInput").files[0];

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("https://YOUR-BACKEND.onrender.com/detect", {
        method: "POST",
        body: formData
    });

    const data = await response.json();

    document.getElementById("classificationResult").innerText =
        "Quality: " + data.result;
}