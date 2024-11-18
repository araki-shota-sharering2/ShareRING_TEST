document.addEventListener("DOMContentLoaded", async () => {
    const postContainer = document.getElementById("post-container");
    const modal = document.getElementById("modal");
    const modalContent = document.getElementById("modal-content");

    let posts = []; // 投稿データを保持
    let currentIndex = 0; // 現在の投稿のインデックス

    try {
        const response = await fetch('/myring-handler', {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            posts = await response.json();

            posts.forEach((post, index) => {
                const postCard = document.createElement("div");
                postCard.classList.add("post-card");

                const ringColor = post.ring_color || "#cccccc"; // デフォルトリングカラー

                postCard.innerHTML = `
                    <div class="image-wrapper" style="border-color: ${ringColor};">
                        <img src="${post.image_url}" alt="投稿画像">
                    </div>
                    <div class="caption">${post.caption || "キャプションなし"}</div>
                    <div class="post-date">${new Date(post.created_at).toLocaleDateString()}</div>
                `;

                // クリックイベントでモーダル表示
                postCard.addEventListener("click", () => {
                    currentIndex = index; // 現在のインデックスを保存
                    showModal(post);
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

    // モーダルを表示
    function showModal(post) {
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

        // スワイプ操作を有効化
        enableSwipe();
        document.getElementById("modal-close").addEventListener("click", () => {
            modal.style.display = "none";
        });
    }

    // スワイプ操作を設定
    function enableSwipe() {
        let startX = 0;

        modal.addEventListener("touchstart", (event) => {
            startX = event.touches[0].clientX;
        });

        modal.addEventListener("touchmove", (event) => {
            if (!startX) return;

            const endX = event.touches[0].clientX;
            const diffX = startX - endX;

            if (diffX > 50) {
                // 左にスワイプ（次の投稿）
                navigatePost(1);
                startX = 0; // リセット
            } else if (diffX < -50) {
                // 右にスワイプ（前の投稿）
                navigatePost(-1);
                startX = 0; // リセット
            }
        });
    }

    // 前後の投稿に移動
    function navigatePost(direction) {
        currentIndex = (currentIndex + direction + posts.length) % posts.length; // インデックスを循環させる
        showModal(posts[currentIndex]);
    }
});
