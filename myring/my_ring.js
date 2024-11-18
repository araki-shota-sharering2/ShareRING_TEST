document.addEventListener("DOMContentLoaded", async () => {
    const postContainer = document.getElementById("post-container");

    try {
        const response = await fetch('/myring-handler', {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            const posts = await response.json();

            // 投稿を1件ずつ作成して表示
            posts.forEach(post => {
                const postCard = document.createElement("div");
                postCard.classList.add("post-card");

                const ringColor = post.ring_color || "#cccccc"; // デフォルトリングカラー

                postCard.innerHTML = `
                    <div class="image-wrapper" style="border-color: ${ringColor};">
                        <img src="${post.image_url}" alt="投稿画像">
                    </div>
                    <div class="caption">${post.caption || "キャプションなし"}</div>
                    <div class="address">${post.address || ""}</div>
                    <div class="created-at">${new Date(post.created_at).toLocaleDateString()}</div>
                `;

                postContainer.appendChild(postCard);
            });
        } else {
            console.error("投稿データの取得に失敗しました");
            postContainer.textContent = "投稿データの取得に失敗しました。";
        }
    } catch (error) {
        console.error("エラーが発生しました:", error);
        postContainer.textContent = "エラーが発生しました。";
    }
});
