document.addEventListener("DOMContentLoaded", async () => {
    const timelineContainer = document.querySelector(".timeline");
    const prevButton = document.querySelector("#prev-button");
    const nextButton = document.querySelector("#next-button");
    const modal = document.querySelector("#modal");
    const modalImage = document.querySelector("#modal-image");
    const modalCaption = document.querySelector("#modal-caption");
    const deletePostButton = document.querySelector("#delete-post");
    const closeModalButton = document.querySelector("#modal-close");
    let currentPage = 1;
    let currentPostId = null;

    async function fetchPosts(page) {
        try {
            timelineContainer.querySelectorAll(".timeline-item").forEach((item) => item.remove());

            const response = await fetch(`/functions/myring-handler?page=${page}`, {
                method: "GET",
                credentials: "include",
            });

            if (response.ok) {
                const posts = await response.json();

                posts.forEach((post) => {
                    const timelineItem = document.createElement("div");
                    timelineItem.classList.add("timeline-item");

                    timelineItem.innerHTML = `
                        <div class="timeline-marker" style="border-color: ${post.ring_color || "#cccccc"};">
                            <img src="${post.image_url}" alt="投稿画像" data-post-id="${post.post_id}">
                        </div>
                        <div class="timeline-content">
                            <p class="timeline-title">${post.caption || "キャプションなし"}</p>
                            <p class="timeline-address">${post.address || "住所情報なし"}</p>
                            <p class="timeline-date">${new Date(post.created_at).toLocaleString()}</p>
                        </div>
                    `;

                    timelineItem.querySelector("img").addEventListener("click", () => {
                        openModal(post.post_id, post.image_url, post.caption);
                    });

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

    function openModal(postId, imageUrl, caption) {
        currentPostId = postId;
        modalImage.src = imageUrl;
        modalCaption.textContent = caption || "キャプションなし";
        modal.style.display = "flex";
    }

    closeModalButton.addEventListener("click", () => {
        modal.style.display = "none";
    });

    deletePostButton.addEventListener("click", async () => {
        if (!confirm("この投稿を削除しますか？")) {
            return;
        }

        try {
            const response = await fetch(`/functions/delete-post`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ postId: currentPostId }),
            });

            if (response.ok) {
                alert("投稿が削除されました。");
                modal.style.display = "none";
                fetchPosts(currentPage);
            } else {
                alert("削除に失敗しました。");
            }
        } catch (error) {
            console.error("削除エラー:", error);
            alert("削除に失敗しました。");
        }
    });

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
