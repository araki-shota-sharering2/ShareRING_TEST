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

    let currentPage = 1;

    // 投稿データを取得する関数
    async function fetchPosts(page) {
        try {
            const response = await fetch(`/myring-handler?page=${page}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const posts = await response.json();

                // 10件未満の場合、ボタンを非表示
                if (posts.length < 10) {
                    loadMoreButton.style.display = "none";
                }

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

                    // 写真をタップしたときのモーダル表示
                    timelineItem.querySelector(".timeline-marker img").addEventListener("click", () => {
                        showModal(post.image_url);
                    });

                    timelineContainer.appendChild(timelineItem);
                });
            } else {
                console.error("投稿データの取得に失敗しました");
                if (currentPage === 1) {
                    timelineContainer.textContent = "投稿データの取得に失敗しました。";
                }
            }
        } catch (error) {
            console.error("エラーが発生しました:", error);
            if (currentPage === 1) {
                timelineContainer.textContent = "エラーが発生しました。";
            }
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

    // 「もっと見る」ボタンを作成
    const loadMoreButton = document.createElement("button");
    loadMoreButton.textContent = "もっと見る";
    loadMoreButton.style.display = "block";
    loadMoreButton.style.margin = "20px auto";
    document.body.appendChild(loadMoreButton);

    loadMoreButton.addEventListener("click", () => {
        currentPage++;
        fetchPosts(currentPage);
    });

    // 初回ロード
    fetchPosts(currentPage);
});
