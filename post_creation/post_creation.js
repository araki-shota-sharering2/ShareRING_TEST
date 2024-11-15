document.addEventListener("DOMContentLoaded", () => {
    displayLocation();
    setupCamera();
    setupRingSelection();
    setupShareButton();
});

let stream; // グローバル変数としてストリームを保持

function displayLocation() {
    const locationData = JSON.parse(localStorage.getItem("selectedLocation"));
    if (locationData && locationData.name) {
        document.getElementById("locationName").textContent = locationData.name;
    } else {
        document.getElementById("locationName").textContent = "位置情報が取得できません";
    }
}

function setupCamera() {
    const takePhotoButton = document.getElementById("takePhotoButton");
    const video = document.createElement("video");
    video.setAttribute("playsinline", true); // iOSのSafariでの表示をサポート
    video.style.width = "100%";
    video.style.maxWidth = "300px";
    document.body.insertBefore(video, takePhotoButton);

    navigator.mediaDevices.getUserMedia({ video: true })
        .then((mediaStream) => {
            stream = mediaStream;
            video.srcObject = stream;
            video.play();

            takePhotoButton.addEventListener("click", () => capturePhoto(video));
        })
        .catch((error) => {
            console.error("カメラのアクセスに失敗しました:", error);
            alert("カメラのアクセスに失敗しました。ブラウザの設定を確認してください。");
        });
}

function capturePhoto(video) {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL("image/png");
    localStorage.setItem("capturedPhoto", imageDataUrl);

    alert("写真が保存されました");

    // ストリームを停止する（必要に応じてユーザーがその場で確認するために停止しない場合もあります）
    stopCamera();
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
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
