async function processImage() {

    const file = document.getElementById("imageInput").files[0];

    if (!file) {
        alert("Please upload an image first.");
        return;
    }

    // Show preview
    const preview = document.getElementById("preview");
    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";

    const formData = new FormData();
    formData.append("image", file);

    document.getElementById("result").innerText = "Processing...";

    try {
        const response = await fetch(
            "https://new-one-0sbx.onrender.com",
            {
                method: "POST",
                body: formData
            }
        );

        if (!response.ok) {
            throw new Error("Server returned error");
        }

        const data = await response.json();

        document.getElementById("result").innerText =
            "Quality: " + data.result;

    } catch (error) {
        console.error(error);
        document.getElementById("result").innerText =
            "Server Error ❌";
    }
}