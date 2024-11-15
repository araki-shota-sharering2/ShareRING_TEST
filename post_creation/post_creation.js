document.addEventListener("DOMContentLoaded", () => {
    displayLocation();
    setupPhotoButton();
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

function setupPhotoButton() {
    const takePhotoButton = document.getElementById("takePhotoButton");
    takePhotoButton.addEventListener("click", () => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                // カメラの映像が取得できた場合、その場で写真をキャプチャ
                const video = document.createElement("video");
                video.srcObject = stream;
                video.play();

                video.addEventListener("canplay", () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    const context = canvas.getContext("2d");
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);

                    const imageDataUrl = canvas.toDataURL("image/png");
                    localStorage.setItem("capturedPhoto", imageDataUrl);

                    // ストリームを停止
                    stream.getTracks().forEach(track => track.stop());
                    alert("写真を保存しました");
                });
            })
            .catch((error) => {
                console.error("カメラのアクセスに失敗しました:", error);
            });
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
                // 必要に応じて投稿後の処理
            } else {
                alert("投稿に失敗しました: " + result.error);
            }
        } catch (error) {
            console.error("投稿エラー:", error);
            alert("投稿に失敗しました");
        }
    });
}
