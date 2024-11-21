document.addEventListener("DOMContentLoaded", () => {
    const timelineContainer = document.querySelector(".timeline");
    const prevButton = document.querySelector("#prev-button");
    const nextButton = document.querySelector("#next-button");
    const modal = document.querySelector("#modal");
    const modalImage = document.querySelector("#modal-image");
    const modalCaption = document.querySelector("#modal-caption");
    const modalCloseButton = document.querySelector("#modal-close");

    let currentPage = 1;
    let totalPosts = [];
    const postsPerPage = 10;

    const fetchPosts = async () => {
        try {
            timelineContainer.innerHTML = "";

            const response = await fetch(`/myring-handler`, {
                method: "GET",
                credentials: "include",
            });

            if (!response.ok) {
                console.error("投稿データ取得エラー:", await response.text());
                return;
            }

            totalPosts = await response.json();
            renderPage(currentPage);
            updatePaginationButtons();
        } catch (error) {
            console.error("投稿データ取得中にエラー:", error);
        }
    };

    const renderPage = (page) => {
        timelineContainer.innerHTML = "";
        const startIndex = (page - 1) * postsPerPage;
        const endIndex = Math.min(startIndex + postsPerPage, totalPosts.length);
        const pagePosts = totalPosts.slice(startIndex, endIndex);

        pagePosts.forEach((post) => {
            const timelineItem = createTimelineItem(post);
            timelineContainer.appendChild(timelineItem);
        });
    };

    const createTimelineItem = (post) => {
        const timelineItem = document.createElement("div");
        timelineItem.classList.add("timeline-item");

        timelineItem.innerHTML = `
            <div class="timeline-marker" style="border-color: ${post.ring_color || "#cccccc"};">
                <img src="${post.image_url}" alt="投稿画像">
            </div>
            <div class="timeline-content">
                <p class="timeline-title">${post.caption || "キャプションなし"}</p>
                <p class="timeline-address">${post.address || "住所情報なし"}</p>
                <p class="timeline-date">${new Date(post.created_at).toLocaleString()}</p>
            </div>
        `;

        timelineItem.querySelector(".timeline-marker img").addEventListener("click", () => {
            openModal(post);
        });

        return timelineItem;
    };

    const openModal = (post) => {
        modalImage.src = post.image_url;
        modalCaption.textContent = post.caption || "キャプションなし";
        modal.style.display = "flex";
    };

    modalCloseButton.addEventListener("click", () => {
        modal.style.display = "none";
    });

    const updatePaginationButtons = () => {
        const totalPages = Math.ceil(totalPosts.length / postsPerPage);
        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage >= totalPages;
    };

    prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderPage(currentPage);
            updatePaginationButtons();
        }
    });

    nextButton.addEventListener("click", () => {
        if (currentPage * postsPerPage < totalPosts.length) {
            currentPage++;
            renderPage(currentPage);
            updatePaginationButtons();
        }
    });

    fetchPosts();
});
