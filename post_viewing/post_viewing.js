document.addEventListener("DOMContentLoaded", async () => {
    const timeline = document.querySelector(".timeline");
    const previewSlider = document.querySelector(".preview-slider");
    let posts = [];
    let currentPage = 1;

    async function fetchPosts() {
        try {
            const response = await fetch("/post-viewing-handler?page=1", {
                method: "GET",
                credentials: "include",
            });
            if (response.ok) {
                posts = await response.json();
                displayPosts();
                displayPreviewIcons();
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
        }
    }

    function displayPosts() {
        timeline.innerHTML = "";
        if (posts.length > 0) {
            const post = posts[currentPage - 1];
            timeline.innerHTML = `<img src="${post.image_url}" alt="Post Image">`;
        }
    }

    function displayPreviewIcons() {
        previewSlider.innerHTML = posts.map(
            (post, index) => `<img src="${post.image_url}" class="${index === currentPage - 1 ? "active" : ""}" data-index="${index}">`
        ).join("");
    }

    previewSlider.addEventListener("click", (e) => {
        if (e.target.tagName === "IMG") {
            currentPage = parseInt(e.target.dataset.index, 10) + 1;
            displayPosts();
            displayPreviewIcons();
        }
    });

    fetchPosts();
});
