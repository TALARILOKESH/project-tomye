async function processImage() {

    const file = document.getElementById("imageInput").files[0];

    if (!file) {
        alert("Please upload an image first.");
        return;
    }

    const formData = new FormData();
    formData.append("image", file);

    document.getElementById("classificationResult").innerText = "Processing...";

    try {
        const response = await fetch("https://project-2-13q7.onrender.com/detect", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        document.getElementById("classificationResult").innerText =
            "Quality: " + data.result;

    } catch (error) {
        document.getElementById("classificationResult").innerText =
            "Server Error ❌";
        console.error(error);
    }
}