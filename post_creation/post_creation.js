document.addEventListener("DOMContentLoaded", () => {
    displayLocationWithIcon();
    setupPhotoCapture();
    setupColorPicker();
    setupShareButton();
});

function displayLocationWithIcon() {
    const locationData = JSON.parse(localStorage.getItem("selectedLocation"));
    const locationNameElement = document.getElementById("locationName");

    if (locationData && locationData.name) {
        locationNameElement.innerHTML = `${locationData.name}
            <a href="/post_creation/search_place.html">
                <img src="/assets/images/post_creation/reload.svg" alt="変更アイコン" id="changeLocationIcon">
            </a>`;
    } else {
        locationNameElement.innerHTML = `位置情報が取得できません
            <a href="/post_creation/search_place.html">
                <img src="/assets/images/post_creation/reload.svg" alt="変更アイコン" id="changeLocationIcon">
            </a>`;
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

function setupShareButton() {
    const shareButton = document.getElementById("shareButton");
    shareButton.addEventListener("click", async () => {
        const caption = document.getElementById("captionInput").value;
        const locationData = JSON.parse(localStorage.getItem("selectedLocation"));
        const ringColor = localStorage.getItem("ringColor");
        const imageDataUrl = localStorage.getItem("capturedPhoto");

        if (!imageDataUrl) {
            alert("写真がありません。撮影してください。");
            return;
        }

        const response = await fetch(imageDataUrl);
        const imageBlob = await response.blob();

        const formData = new FormData();
        formData.append("caption", caption);
        formData.append("location", JSON.stringify(locationData));
        formData.append("ring_color", ringColor);
        formData.append("image", imageBlob, "post-image.jpg");

        try {
            const response = await fetch("/post_creation", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                alert("投稿が完了しました！");
                localStorage.clear();
                window.location.href = "/post_viewing/post_viewing.html";
            } else {
                alert("投稿に失敗しました");
            }
        } catch (error) {
            console.error("投稿エラー:", error);
            alert("投稿に失敗しました。");
        }
    });
            // 星をランダムに配置
            const body = document.querySelector('body');
            for (let i = 0; i < 100; i++) {
                const star = document.createElement('div');
                star.classList.add('star');
                star.style.top = Math.random() * 100 + 'vh';
                star.style.left = Math.random() * 100 + 'vw';
                star.style.animationDuration = (Math.random() * 2 + 1) + 's';
                body.appendChild(star);
            }
    
}
