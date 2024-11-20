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

    async function fetchPosts(page) {
        try {
            const response = await fetch(`/myring-handler?page=${page}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const posts = await response.json();

                // If no posts, disable load more button
                if (posts.length < 15) {
                    loadMoreButton.style.display = "none";
                }

                posts.forEach((post) => {
                    const ringColor = post.ring_color || "#cccccc"; // Default ring color

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

                    // Add click event to show modal
                    timelineItem.querySelector(".timeline-marker img").addEventListener("click", () => {
                        showModal(post.image_url);
                    });

                    timelineContainer.appendChild(timelineItem);
                });
            } else {
                console.error("Failed to fetch posts");
                if (currentPage === 1) {
                    timelineContainer.textContent = "投稿データの取得に失敗しました。";
                }
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
            if (currentPage === 1) {
                timelineContainer.textContent = "エラーが発生しました。";
            }
        }
    }

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

    // Add "Load More" button
    const loadMoreButton = document.createElement("button");
    loadMoreButton.textContent = "もっと見る";
    loadMoreButton.style.display = "block";
    loadMoreButton.style.margin = "20px auto";
    document.body.appendChild(loadMoreButton);

    loadMoreButton.addEventListener("click", () => {
        currentPage++;
        fetchPosts(currentPage);
    });

    // Fetch the first page
    fetchPosts(currentPage);
});
