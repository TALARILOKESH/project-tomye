async function processImage() {

    const file = document.getElementById("imageInput").files[0];

    if (!file) {
        alert("Please upload an image first.");
        return;
    }

    const preview = document.getElementById("preview");
    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";

    const formData = new FormData();
    formData.append("image", file);

    document.getElementById("result").innerText = "Processing...";

    try {
        const response = await fetch(
            "https://new-one-0sbx.onrender.com/detect",
            {
                method: "POST",
                body: formData
            }
        );

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);

        document.getElementById("preview").src = imageUrl;
        document.getElementById("result").innerText = "Detection Complete ✅";

    } catch (error) {
        console.error(error);
        document.getElementById("result").innerText = "Server Error ❌";
    }
}