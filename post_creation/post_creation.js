document.addEventListener("DOMContentLoaded", () => {
    displayLocation();
    setupPhotoCapture();
    setupRingSelection();
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

    // カメラを起動するためのファイル入力ボタンをクリック
    takePhotoButton.addEventListener("click", () => {
        photoInput.click();
    });

    // ファイルが選択されたときの処理
    photoInput.addEventListener("change", () => {
        const file = photoInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                photoPreview.src = e.target.result;
                photoPreview.style.display = "block";
                localStorage.setItem("capturedPhoto", e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });
}

function setupRingSelection() {
    const chooseRingButton = document.getElementById("chooseRingButton");
    chooseRingButton.addEventListener("click", () => {
        const ringColor = prompt("RINGの色を選択してください (例: #ff0000)");
        if (ringColor) {
            localStorage.setItem("ringColor", ringColor);
        }
    });
}

function setupShareButton() {
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

        const postData = {
            user_id: sessionStorage.getItem("user_id"),
            caption: caption,
            location: locationData,
            image_url: imageDataUrl,
            ring_color: ringColor,
        };

        try {
            const response = await fetch("/api/post_creation", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(postData),
            });

            const result = await response.json();
            if (result.success) {
                alert("投稿が完了しました！");
            } else {
                alert("投稿に失敗しました: " + result.error);
            }
        } catch (error) {
            console.error("投稿エラー:", error);
            alert("投稿に失敗しました");
        }
    });
}
