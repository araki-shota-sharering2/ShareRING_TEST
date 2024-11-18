document.addEventListener("DOMContentLoaded", async () => {
    const postContainer = document.getElementById("post-container");

    try {
        const response = await fetch('/myring-handler', {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            const posts = await response.json();
            posts.forEach(post => {
                const postCard = document.createElement("div");
                postCard.classList.add("post-card");

                postCard.innerHTML = `
                    <img src="${post.image_url}" alt="投稿画像">
                    <div class="caption">${post.caption || "キャプションなし"}</div>
                    <div class="address">${post.address || "住所情報なし"}</div>
                    <div class="created-at">${new Date(post.created_at).toLocaleString()}</div>
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
