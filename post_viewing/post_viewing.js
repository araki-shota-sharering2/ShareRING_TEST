document.addEventListener("DOMContentLoaded", async () => {
    const timelineContainer = document.querySelector(".timeline");
    const previewSlider = document.querySelector(".preview-slider");
    let posts = [];
    let currentPage = 1;
    const itemsPerPage = 8;

    // 投稿を取得してプレビューアイコンを生成
    async function fetchPosts(page) {
        try {
            const response = await fetch(`/post-viewing-handler?page=${page}`, {
                method: "GET",
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();
                posts = data.posts || [];
                displayPosts();
                displayPreviewIcons();
            } else {
                console.error("投稿データの取得に失敗しました");
            }
        } catch (error) {
            console.error("エラーが発生しました:", error);
        }
    }

    // 投稿詳細を表示
    function displayPosts() {
        timelineContainer.innerHTML = "";
        posts.forEach((post) => {
            const postHTML = `
                <div class="timeline-item">
                    <div class="timeline-image">
                        <img src="${post.image_url}" alt="投稿画像">
                    </div>
                    <div class="timeline-content">
                        <div class="user-info">
                            <img src="${post.profile_image || '/assets/images/default-user.png'}" alt="ユーザー画像">
                            <p>${post.username || "匿名ユーザー"}</p>
                        </div>
                        <p class="timeline-caption">${post.caption || "キャプションなし"}</p>
                        <p class="timeline-address">${post.address || "住所なし"}</p>
                        <p class="timeline-date">${new Date(post.created_at).toLocaleString()}</p>
                        <div class="buttons">
                            <button>
                                <img src="/assets/icons/navigation.svg" alt="ナビアイコン">ここへ行く
                            </button>
                            <button>
                                <img src="/assets/icons/like.svg" alt="いいねアイコン">いいね
                            </button>
                            <button>
                                <img src="/assets/icons/save.svg" alt="保存アイコン">Keep
                            </button>
                        </div>
                    </div>
                </div>
            `;
            timelineContainer.innerHTML += postHTML;
        });
    }

    // プレビューアイコンを表示
    function displayPreviewIcons() {
        previewSlider.innerHTML = "";
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, posts.length);

        for (let i = startIndex; i < endIndex; i++) {
            const previewItem = document.createElement("img");
            previewItem.src = posts[i].image_url;
            previewItem.alt = "投稿プレビュー";
            previewItem.dataset.index = i;

            if (i === startIndex) previewItem.classList.add("active");

            previewItem.addEventListener("click", () => {
                document.querySelectorAll(".preview-slider img").forEach((img) => {
                    img.classList.remove("active");
                });
                previewItem.classList.add("active");
                displayPost(i);
            });

            previewSlider.appendChild(previewItem);
        }
    }

    // 特定の投稿を表示
    function displayPost(index) {
        const post = posts[index];
        timelineContainer.innerHTML = `
            <img src="${post.image_url}" alt="投稿画像">
            <div class="post-details">
                <div class="post-title">
                    <span>${post.username || "匿名ユーザー"}</span>
                    <span>${post.address || "場所情報なし"}</span>
                </div>
                <p class="post-comment">${post.caption || "コメントなし"}</p>
                <p class="post-location">投稿日: ${new Date(post.created_at).toLocaleDateString()}</p>
                <div class="buttons">
                    <button>
                        <img src="/assets/icons/navigation.svg" alt="ナビアイコン">ここへ行く
                    </button>
                    <button>
                        <img src="/assets/icons/like.svg" alt="いいねアイコン">いいね
                    </button>
                    <button>
                        <img src="/assets/icons/save.svg" alt="保存アイコン">Keep
                    </button>
                </div>
            </div>
        `;
    }

    // スワイプイベントの追加
    function addSwipeEvents() {
        let startX = 0;

        previewSlider.addEventListener("touchstart", (e) => {
            startX = e.touches[0].clientX;
        });

        previewSlider.addEventListener("touchend", (e) => {
            const endX = e.changedTouches[0].clientX;
            const diff = endX - startX;

            if (diff > 50 && currentPage > 1) {
                currentPage--;
                fetchPosts(currentPage);
            } else if (diff < -50 && posts.length === itemsPerPage) {
                currentPage++;
                fetchPosts(currentPage);
            }
        });
    }

    fetchPosts(currentPage);
    addSwipeEvents();
});
