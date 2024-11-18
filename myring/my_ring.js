document.addEventListener("DOMContentLoaded", async () => {
    const postContainer = document.getElementById("post-container");
    const modal = document.getElementById("modal");
    const modalContent = document.getElementById("modal-content");
    const modalClose = document.getElementById("modal-close");

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

                const ringColor = post.ring_color || "#cccccc"; // デフォルトリングカラー

                postCard.innerHTML = `
                    <div class="image-wrapper" style="border-color: ${ringColor};">
                        <img src="${post.image_url}" alt="投稿画像">
                    </div>
                    <div class="caption">${post.caption || "キャプションなし"}</div>
                `;

                // クリックイベントでモーダル表示
                postCard.addEventListener("click", () => {
                    modalContent.innerHTML = `
                        <img src="${post.image_url}" alt="投稿画像">
                        <div class="modal-details">
                            <p><strong>キャプション:</strong> ${post.caption || "なし"}</p>
                            <p><strong>住所:</strong> ${post.address || "なし"}</p>
                            <p><strong>投稿日時:</strong> ${new Date(post.created_at).toLocaleString()}</p>
                        </div>
                        <button id="modal-close">×</button>
                    `;

                    modal.style.display = "flex";

                    // モーダルを閉じる
                    document.getElementById("modal-close").addEventListener("click", () => {
                        modal.style.display = "none";
                    });
                });

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
