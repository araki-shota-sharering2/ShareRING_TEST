document.addEventListener("DOMContentLoaded", async () => {
    const timeline = document.querySelector(".timeline");
    const loadMoreButton = document.getElementById("load-more-button");

    let currentPage = 1;
    const postsPerPage = 8; // 1ページあたりの投稿数

    async function fetchPosts(page = 1) {
        try {
            const response = await fetch(`/post-viewing-handler?page=${page}`, { method: "GET" });
            if (response.ok) {
                const posts = await response.json();
                displayPosts(posts);
                updateLoadMoreButton(posts.length);
            } else {
                console.error("投稿データの取得に失敗しました");
            }
        } catch (error) {
            console.error("投稿データの取得中にエラーが発生しました:", error);
        }
    }

    function displayPosts(posts) {
        posts.forEach((post) => {
            const postFrame = document.createElement("div");
            postFrame.className = "post-frame";

            const ringColor = post.ring_color || "#FFFFFF";
            postFrame.innerHTML = `
                <div class="post-content">
                    <img src="${post.image_url}" alt="投稿画像" class="post-image" style="border-color: ${ringColor};">
                    <div class="post-details">
                        <div class="user-info">
                            <img class="user-avatar" src="${post.profile_image || '/assets/images/default-avatar.png'}" alt="ユーザー画像">
                            <span>${post.username || "匿名ユーザー"}</span>
                            <span class="post-address">${post.address || "住所情報なし"}</span>
                        </div>
                        <p class="post-comment">${post.caption || "コメントなし"}</p>
                        <p class="post-date">投稿日: ${new Date(post.created_at).toLocaleDateString()}</p>
                    </div>
                    <div class="post-actions">
                    <img src="/assets/images/main/ring_keeper.svg" alt="Keep画像" class="keep-image">
                        <div class="swipe-guide">↑ スワイプしてルート案内を開始</div>
                    </div>
                </div>
            `;
            addSwipeFunctionality(postFrame, post.address);
            timeline.appendChild(postFrame);
        });
    }

    function updateLoadMoreButton(postsCount) {
        if (postsCount < postsPerPage) {
            loadMoreButton.classList.add("disabled");
            loadMoreButton.setAttribute("disabled", true);
            loadMoreButton.textContent = "これ以上投稿はありません";
        } else {
            loadMoreButton.classList.remove("disabled");
            loadMoreButton.removeAttribute("disabled");
            loadMoreButton.textContent = "もっと見る";
        }
    }

    function addSwipeFunctionality(postFrame, address) {
        let startY = 0;
        let endY = 0;

        postFrame.addEventListener("touchstart", (e) => {
            startY = e.touches[0].clientY;
        });

        postFrame.addEventListener("touchmove", (e) => {
            endY = e.touches[0].clientY;
        });

        postFrame.addEventListener("touchend", () => {
            if (startY - endY > 50) {
                if (!address || address.trim() === "住所情報なし") {
                    alert("有効な場所が指定されていません。");
                } else {
                    openGoogleMapsRoute(address);
                }
            }
        });
    }

    function openGoogleMapsRoute(address) {
        const baseURL = "https://www.google.com/maps/dir/?api=1";
        const params = new URLSearchParams({
            origin: "My+Location",
            destination: address, // 住所のエンコードは不要。URLSearchParamsが自動エンコード
            travelmode: "walking", // 徒歩案内
        });
        const url = `${baseURL}&${params.toString()}`;
        console.log(`Generated Google Maps URL: ${url}`); // デバッグ用にURLを出力
        window.location.href = url; // 同じタブで開く
    }

    loadMoreButton.addEventListener("click", () => {
        if (!loadMoreButton.classList.contains("disabled")) {
            currentPage++;
            fetchPosts(currentPage);
        }
    });
        // 星をランダムに配置
        const body = document.querySelector('body');
        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            star.classList.add('star');
            star.style.top = Math.random() * 100 + 'vh';
            star.style.left = Math.random() * 100 + 'vw';
            star.style.animationDuration = (Math.random() * 2 + 1) + 's';
            body.appendChild(star);
        }

    await fetchPosts(currentPage);
});
