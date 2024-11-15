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
