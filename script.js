async function processImage() {

    const file = document.getElementById("imageInput").files[0];

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("https://project-2-13q7.onrender.com", {
        method: "POST",
        body: formData
    });

    const data = await response.json();

    document.getElementById("classificationResult").innerText =
        "Quality: " + data.result;
}