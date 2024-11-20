document.addEventListener("DOMContentLoaded", async () => {
    const timelineContainer = document.querySelector(".timeline");
    const modal = document.createElement("div");
    modal.id = "modal";
    modal.innerHTML = `
        <div id="modal-content">
            <button id="modal-close">×</button>
        </div>
    `;
    document.body.appendChild(modal);

    let currentPage = 1; // 現在のページ番号
    const itemsPerPage = 10; // 1ページあたりの件数

    // 投稿データを取得する関数
    async function fetchPosts(page) {
        try {
            timelineContainer.innerHTML = ""; // 前回の投稿データをクリア

            const response = await fetch(`/myring-handler?page=${page}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const posts = await response.json();

                if (posts.length === 0 && page === 1) {
                    timelineContainer.textContent = "まだ投稿がありません。";
                    paginationControls.style.display = "none"; // ページングコントロール非表示
                    return;
                }

                // データがあれば投稿を表示
                posts.forEach((post) => {
                    const ringColor = post.ring_color || "#cccccc"; // デフォルトリングカラー

                    const timelineItem = document.createElement("div");
                    timelineItem.classList.add("timeline-item");

                    timelineItem.innerHTML = `
                        <div class="timeline-marker" style="border-color: ${ringColor};">
                            <img src="${post.image_url}" alt="投稿画像">
                        </div>
                        <div class="timeline-content">
                            <p class="timeline-title">${post.caption || "キャプションなし"}</p>
                            <p class="timeline-address">${post.address || "住所情報なし"}</p>
                            <p class="timeline-date">${new Date(post.created_at).toLocaleString()}</p>
                        </div>
                    `;

                    // 写真タップでモーダルを表示
                    timelineItem.querySelector(".timeline-marker img").addEventListener("click", () => {
                        showModal(post.image_url);
                    });

                    timelineContainer.appendChild(timelineItem);
                });

                // ページングコントロールを表示
                paginationControls.style.display = "flex";

                // 「前へ」ボタンの有効/無効を設定
                prevButton.disabled = currentPage === 1;

            } else {
                console.error("投稿データの取得に失敗しました");
                timelineContainer.textContent = "投稿データの取得に失敗しました。";
            }
        } catch (error) {
            console.error("エラーが発生しました:", error);
            timelineContainer.textContent = "エラーが発生しました。";
        }
    }

    // モーダルを表示する関数
    function showModal(imageUrl) {
        const modalContent = modal.querySelector("#modal-content");
        modalContent.innerHTML = `
            <button id="modal-close">×</button>
            <img src="${imageUrl}" alt="投稿画像">
        `;
        modal.style.display = "flex";

        modal.querySelector("#modal-close").addEventListener("click", () => {
            modal.style.display = "none";
        });
    }

    // ページングコントロールを追加
    const paginationControls = document.createElement("div");
    paginationControls.style.display = "flex";
    paginationControls.style.justifyContent = "space-between";
    paginationControls.style.margin = "20px 0";

    const prevButton = document.createElement("button");
    prevButton.textContent = "前へ";
    prevButton.disabled = true; // 初期状態では無効
    prevButton.style.marginRight = "10px";

    const nextButton = document.createElement("button");
    nextButton.textContent = "次へ";

    paginationControls.appendChild(prevButton);
    paginationControls.appendChild(nextButton);
    document.body.appendChild(paginationControls);

    // 「前へ」ボタンをクリック
    prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            fetchPosts(currentPage);
        }
    });

    // 「次へ」ボタンをクリック
    nextButton.addEventListener("click", () => {
        currentPage++;
        fetchPosts(currentPage);
    });

    // 初回ロード
    fetchPosts(currentPage);
});
