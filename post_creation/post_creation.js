document.addEventListener("DOMContentLoaded", () => {
    displayLocation();
    setupPhotoCapture();
    setupColorPicker();
    setupShareButton();
});

function displayLocation() {
    const locationData = JSON.parse(localStorage.getItem("selectedLocation"));
    if (locationData && locationData.name) {
        document.getElementById("locationName").textContent = locationData.name;
    } else {
        document.getElementById("locationName").textContent = "位置情報が取得できません";
    }
}

function setupPhotoCapture() {
    const takePhotoButton = document.getElementById("takePhotoButton");
    const photoInput = document.getElementById("photoInput");
    const photoPreview = document.getElementById("photoPreview");

    takePhotoButton.addEventListener("click", () => {
        photoInput.click();
    });

    photoInput.addEventListener("change", () => {
        const file = photoInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                photoPreview.src = e.target.result;
                photoPreview.style.display = "block";
                takePhotoButton.style.display = "none";
                localStorage.setItem("capturedPhoto", e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });
}

function setupColorPicker() {
    const ringColorInput = document.getElementById("ringColorInput");
    const ringPreview = document.getElementById("ringPreview");

    ringColorInput.addEventListener("input", () => {
        const selectedColor = ringColorInput.value;
        ringPreview.style.borderColor = selectedColor;
        localStorage.setItem("ringColor", selectedColor);
    });
}

async function setupShareButton() {
    const shareButton = document.getElementById("shareButton");
    shareButton.addEventListener("click", async () => {
        const caption = document.getElementById("captionInput").value;
        const locationData = JSON.parse(localStorage.getItem("selectedLocation"));
        const imageDataUrl = localStorage.getItem("capturedPhoto");
        const ringColor = localStorage.getItem("ringColor");

        if (!imageDataUrl) {
            alert("写真がありません。撮影してください。");
            return;
        }

        // 画像データをBlobに変換
        const response = await fetch(imageDataUrl);
        const blob = await response.blob();

        const formData = new FormData();
        formData.append("caption", caption);
        formData.append("location", JSON.stringify(locationData));
        formData.append("ring_color", ringColor);
        formData.append("image", blob, "post-image.jpg");

        try {
            const result = await fetch("/post_creation", {
                method: "POST",
                body: formData,
            });

            if (!result.ok) {
                throw new Error(`サーバーエラー: ${result.status}`);
            }

            const data = await result.json();
            if (data.success) {
                alert("投稿が完了しました！");
                localStorage.clear();
                window.location.href = "/post_viewing/post_viewing.html";
            } else {
                alert("投稿に失敗しました: " + data.message);
            }
        } catch (error) {
            console.error("投稿エラー:", error);
            alert("投稿に失敗しました。");
        }
    });
}
