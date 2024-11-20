document.addEventListener("DOMContentLoaded", async () => {
    const timelineContainer = document.querySelector(".timeline");
    let currentPage = 1;

    // ページングボタンを生成
    const paginationControls = document.createElement("div");
    paginationControls.className = "pagination-controls";

    const prevButton = document.createElement("button");
    prevButton.id = "prev-button";
    prevButton.textContent = "前へ";

    const nextButton = document.createElement("button");
    nextButton.id = "next-button";
    nextButton.textContent = "次へ";

    paginationControls.appendChild(prevButton);
    paginationControls.appendChild(nextButton);
    timelineContainer.appendChild(paginationControls);

    async function fetchPosts(page) {
        try {
            timelineContainer.innerHTML = ""; // 前回の投稿をクリア

            const response = await fetch(`/myring-handler?page=${page}`, {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                const posts = await response.json();

                posts.forEach((post) => {
                    const ringColor = post.ring_color || "#cccccc";

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

                    timelineContainer.appendChild(timelineItem);
                });

                // タイムラインの最後にボタンを再追加
                timelineContainer.appendChild(paginationControls);

                // ボタンの有効・無効を設定
                prevButton.disabled = page === 1;
                nextButton.disabled = posts.length < 10; // 10件未満の場合は「次へ」を無効化
            } else {
                console.error("投稿データの取得に失敗しました");
                timelineContainer.textContent = "投稿データの取得に失敗しました。";
            }
        } catch (error) {
            console.error("エラーが発生しました:", error);
            timelineContainer.textContent = "エラーが発生しました。";
        }
    }

    // 「前へ」ボタンの動作
    prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            fetchPosts(currentPage);
        }
    });

    // 「次へ」ボタンの動作
    nextButton.addEventListener("click", () => {
        currentPage++;
        fetchPosts(currentPage);
    });

    // 初回ロード
    fetchPosts(currentPage);
});
