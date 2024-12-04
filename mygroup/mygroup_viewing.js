document.addEventListener("DOMContentLoaded", async () => {
    const timeline = document.querySelector(".timeline");
    const loadMoreButton = document.getElementById("load-more-button");
    const groupNameElement = document.getElementById("group-name");

    let currentPage = 1;
    const postsPerPage = 8; // 1ページあたりの投稿数

    // URLパラメータからグループIDを取得
    const groupId = new URLSearchParams(window.location.search).get("groupId");

    if (!groupId) {
        console.error("グループIDが指定されていません。");
        alert("グループIDが指定されていません。");
        return;
    }

    // グループ名を取得して表示
    async function fetchGroupName() {
        try {
            const response = await fetch(`/group-name-handler?groupId=${groupId}`);
            if (response.ok) {
                const data = await response.json();
                groupNameElement.textContent = data.groupName || "グループ名不明";
            } else {
                console.error("グループ名の取得に失敗しました");
                groupNameElement.textContent = "取得エラー";
            }
        } catch (error) {
            console.error("グループ名取得中にエラーが発生しました:", error);
            groupNameElement.textContent = "エラー";
        }
    }

    // 投稿データを取得して表示
    async function fetchPosts(page = 1) {
        try {
            const response = await fetch(`/group-post-viewing-handler?groupId=${groupId}&page=${page}`, { method: "GET" });
            if (response.ok) {
                const posts = await response.json();
                displayPosts(posts);
                updateLoadMoreButton(posts.length);
            } else {
                console.error("投稿データの取得に失敗しました");
                alert("投稿データの取得に失敗しました");
            }
        } catch (error) {
            console.error("投稿データの取得中にエラーが発生しました:", error);
            alert("投稿データの取得中にエラーが発生しました。");
        }
    }

    // 投稿を表示
    function displayPosts(posts) {
        if (!posts.length) {
            alert("表示する投稿がありません。");
            return;
        }

        posts.forEach((post) => {
            const postFrame = document.createElement("div");
            postFrame.className = "post-frame";

            const ringColor = post.ring_color || "#FFFFFF";
            postFrame.innerHTML = `
                <div class="post-content">
                    <div class="post-frame-wrapper">
                        <img src="${post.image_url}" alt="投稿画像" class="post-image" style="border-color: ${ringColor};">
                        <img src="/assets/images/main/ring_keeper.svg" alt="Keep画像" class="keep-image" data-post-id="${post.group_post_id}">
                    </div>
                    <div class="post-details">
                        <div class="user-info">
                            <img class="user-avatar" src="${post.profile_image || '/assets/images/default-avatar.png'}" alt="ユーザー画像">
                            <span>${post.username || "匿名ユーザー"}</span>
                            <span class="post-address">${post.address || "住所情報なし"}</span>
                        </div>
                        <p class="post-comment">${post.caption || "コメントなし"}</p>
                        <p class="post-date">投稿日: ${new Date(post.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
            `;
            addSwipeFunctionality(postFrame, post.address);
            setupKeepFeature(postFrame); // Keep機能をセットアップ
            timeline.appendChild(postFrame);
        });
    }

    // Keepボタンの機能をセットアップ
    function setupKeepFeature(postFrame) {
        const keepImage = postFrame.querySelector(".keep-image");
        keepImage.addEventListener("click", async (event) => {
            const postId = event.target.getAttribute("data-post-id");

            try {
                const response = await fetch("/keep-post-handler", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ postId })
                });

                if (response.ok) {
                    const result = await response.json();
                    alert(result.message || "投稿をKeepしました！");
                } else {
                    const errorResult = await response.json();
                    alert(errorResult.error || "Keepに失敗しました");
                }
            } catch (error) {
                console.error("Keep処理中のエラー:", error);
                alert("サーバーエラーが発生しました。もう一度お試しください。");
            }
        });
    }

    // もっと見るボタンの状態を更新
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

    // スワイプしてGoogleマップに移動
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

    // Googleマップでルート案内を開始
    function openGoogleMapsRoute(address) {
        const baseURL = "https://www.google.com/maps/dir/?api=1";
        const params = new URLSearchParams({
            origin: "My+Location",
            destination: address,
            travelmode: "walking",
        });
        const url = `${baseURL}&${params.toString()}`;
        console.log(`Generated Google Maps URL: ${url}`);
        window.location.href = url;
    }

    // もっと見るボタンのクリックイベント
    loadMoreButton.addEventListener("click", () => {
        if (!loadMoreButton.classList.contains("disabled")) {
            currentPage++;
            fetchPosts(currentPage);
        }
    });

    // 星をランダムに配置
    const body = document.querySelector("body");
    for (let i = 0; i < 100; i++) {
        const star = document.createElement("div");
        star.classList.add("star");
        star.style.top = Math.random() * 100 + "vh";
        star.style.left = Math.random() * 100 + "vw";
        star.style.animationDuration = Math.random() * 2 + 1 + "s";
        body.appendChild(star);
    }

    // 初期データを読み込み
    await fetchGroupName();
    await fetchPosts(currentPage);
});
