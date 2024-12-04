document.addEventListener("DOMContentLoaded", () => {
    // グループ作成フォームの処理
    document.getElementById("group-form").addEventListener("submit", async (event) => {
        event.preventDefault();

        const groupName = document.getElementById("group-name").value;
        const description = document.getElementById("group-description").value;
        const groupImage = document.getElementById("group-image").files[0];

        if (!groupName || !groupImage) {
            alert("グループ名と画像は必須です");
            return;
        }

        const formData = new FormData();
        formData.append("groupName", groupName);
        formData.append("description", description);
        formData.append("groupImage", groupImage);

        try {
            const response = await fetch("/group-create-handler", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                alert("グループが作成されました");
                fetchGroups();
            } else {
                alert(`エラー: ${result.message}`);
            }
        } catch (error) {
            console.error("グループ作成エラー:", error);
            alert("グループ作成中にエラーが発生しました");
        }
    });

    // グループ参加フォームの処理
    document.getElementById("join-form").addEventListener("submit", async (event) => {
        event.preventDefault();

        const groupId = document.getElementById("group-id").value;

        if (!groupId) {
            alert("グループIDを入力してください");
            return;
        }

        try {
            const response = await fetch("/group-join-handler", {
                method: "POST",
                body: new URLSearchParams({ groupId }),
            });

            const result = await response.json();

            if (response.ok) {
                alert("グループに参加しました");
                fetchGroups();
            } else {
                alert(`エラー: ${result.message}`);
            }
        } catch (error) {
            console.error("グループ参加エラー:", error);
            alert("グループ参加中にエラーが発生しました");
        }
    });

    // グループIDから参加
    async function joinGroupById(groupId) {
        try {
            const response = await fetch("/group-join-handler", {
                method: "POST",
                body: new URLSearchParams({ groupId }),
            });

            const result = await response.json();

            if (response.ok) {
                alert("グループに参加しました");
                fetchGroups();
            } else {
                alert(`エラー: ${result.message}`);
            }
        } catch (error) {
            console.error("グループ参加エラー:", error);
            alert("グループ参加中にエラーが発生しました");
        }
    }

    // グループ一覧を取得して表示
    async function fetchGroups() {
        try {
            const response = await fetch("/group-handler");
            const groups = await response.json();

            const groupList = document.getElementById("groups");
            groupList.innerHTML = "";

            groups.forEach((group) => {
                const li = document.createElement("li");
                li.classList.add("group-item");

                const img = document.createElement("img");
                img.src = group.group_image_url || "default-image.jpg";
                img.alt = group.group_name;
                img.classList.add("group-image");

                const name = document.createElement("p");
                name.textContent = group.group_name;
                name.classList.add("group-name");

                li.appendChild(img);
                li.appendChild(name);

                li.addEventListener("click", () => {
                    window.location.href = `/mygroup/mygroup_viewing.html?groupId=${group.group_id}`;
                });

                groupList.appendChild(li);
            });
        } catch (error) {
            console.error("グループ取得エラー:", error);
        }
    }

    // 初期化時にグループを取得
    fetchGroups();
});
