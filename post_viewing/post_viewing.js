document.addEventListener("DOMContentLoaded", async () => {
    const dynamicContainer = document.getElementById("dynamic-container");
    const modal = document.getElementById("post-details-modal");
    const modalImage = document.getElementById("modal-image");
    const modalUsername = document.getElementById("modal-username");
    const modalCaption = document.getElementById("modal-caption");
    const modalAddress = document.getElementById("modal-address");

    let posts = [];

    async function fetchPosts() {
        try {
            const response = await fetch(`/post-viewing-handler`, {
                method: "GET",
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();
                posts = data;
                displayPosts();
            } else {
                console.error("投稿データの取得に失敗しました");
            }
        } catch (error) {
            console.error("エラーが発生しました:", error);
        }
    }

    function displayPosts() {
        dynamicContainer.innerHTML = "";
        posts.forEach((post, index) => {
            const postBubble = document.createElement("div");
            postBubble.classList.add("post-bubble");
            postBubble.style.top = `${Math.random() * 80}%`;
            postBubble.style.left = `${Math.random() * 80}%`;
            postBubble.style.borderColor = post.ring_color || "#394575";
            postBubble.style.animationDelay = `${Math.random() * 5}s`;

            const img = document.createElement("img");
            img.src = post.image_url;

            postBubble.appendChild(img);
            postBubble.addEventListener("click", () => openModal(index));
            dynamicContainer.appendChild(postBubble);
        });
    }

    function openModal(index) {
        const post = posts[index];
        modalImage.src = post.image_url;
        modalUsername.textContent = post.username || "匿名ユーザー";
        modalCaption.textContent = post.caption || "キャプションなし";
        modalAddress.textContent = post.address || "場所情報なし";
        modal.style.display = "flex";
    }

    window.closeModal = () => {
        modal.style.display = "none";
    };

    fetchPosts();
});
