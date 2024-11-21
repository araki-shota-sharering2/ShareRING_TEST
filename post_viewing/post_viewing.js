document.addEventListener("DOMContentLoaded", async () => {
    const timelineContainer = document.querySelector(".timeline");
    const prevButton = document.querySelector("#prev-button");
    const nextButton = document.querySelector("#next-button");
    let currentPage = 1;

    async function fetchPosts(page) {
        try {
            // 投稿をクリア
            timelineContainer.innerHTML = "";

            const response = await fetch(`/post-viewing-handler?page=${page}`, {
                method: "GET",
                credentials: "include",
            });

            if (response.ok) {
                const posts = await response.json();
                posts.forEach((post) => {
                    const timelineItem = document.createElement("div");
                    timelineItem.classList.add("timeline-item");
                    timelineItem.innerHTML = `
                        <div class="timeline-image">
                            <img src="${post.image_url}" alt="投稿画像">
                        </div>
                        <div class="timeline-content">
                            <p class="timeline-caption">${post.caption || "キャプションなし"}</p>
                            <p class="timeline-address">${post.address || "住所なし"}</p>
                            <p class="timeline-date">${new Date(post.created_at).toLocaleString()}</p>
                        </div>
                    `;
                    timelineContainer.appendChild(timelineItem);
                });

                prevButton.disabled = page === 1;
                nextButton.disabled = posts.length < 10;
            } else {
                console.error("投稿データの取得に失敗しました");
            }
        } catch (error) {
            console.error("エラーが発生しました:", error);
        }
    }

    prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            fetchPosts(currentPage);
        }
    });

    nextButton.addEventListener("click", () => {
        currentPage++;
        fetchPosts(currentPage);
    });

    fetchPosts(currentPage);
});
