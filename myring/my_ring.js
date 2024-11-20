document.addEventListener("DOMContentLoaded", async () => {
    const timelineContainer = document.querySelector(".timeline");
    const prevButton = document.querySelector("#prev-button");
    const nextButton = document.querySelector("#next-button");
    let currentPage = 1;

    async function fetchPosts(page) {
        try {
            timelineContainer.innerHTML = ""; // 前回の投稿をクリア

            const response = await fetch(`/myring-handler?page=${page}`, {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                const posts = await response.json();

                if (posts.length === 0 && page === 1) {
                    timelineContainer.textContent = "まだ投稿がありません。";
                    prevButton.disabled = true; // 「前へ」を無効化
                    nextButton.disabled = true; // 「次へ」を無効化
                    return;
                }

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
