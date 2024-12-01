document.addEventListener("DOMContentLoaded", () => {
    const createGroupBtn = document.getElementById("create-group-btn");
    const groupList = document.getElementById("group-list");
    const groupsContainer = document.getElementById("groups-container");
    const groupPostsSection = document.getElementById("group-posts");
    const postsContainer = document.getElementById("posts-container");
    const backToGroupsBtn = document.getElementById("back-to-groups-btn");
    const groupNameHeader = document.getElementById("group-name");

    // グループ一覧を取得して表示
    async function fetchGroups() {
        try {
            const response = await fetch("/list-groups");
            const groups = await response.json();
            groupsContainer.innerHTML = "";
            groups.forEach(group => {
                const li = document.createElement("li");
                li.textContent = group.group_name;
                li.dataset.groupId = group.group_id;
                li.addEventListener("click", () => showGroupPosts(group));
                groupsContainer.appendChild(li);
            });
        } catch (error) {
            console.error("Failed to fetch groups:", error);
        }
    }

    // グループの投稿を表示
    async function showGroupPosts(group) {
        try {
            const response = await fetch(`/group-posts?group_id=${group.group_id}`);
            const posts = await response.json();
            postsContainer.innerHTML = "";
            posts.forEach(post => {
                const div = document.createElement("div");
                div.textContent = post.caption || "No caption";
                postsContainer.appendChild(div);
            });
            groupNameHeader.textContent = group.group_name;
            groupList.classList.add("hidden");
            groupPostsSection.classList.remove("hidden");
        } catch (error) {
            console.error("Failed to fetch group posts:", error);
        }
    }

    // グループ作成ボタンのクリックイベント
    createGroupBtn.addEventListener("click", () => {
        const groupName = prompt("Enter group name:");
        if (groupName) {
            createGroup(groupName);
        }
    });

    // グループを作成
    async function createGroup(name) {
        try {
            const response = await fetch("/create-group", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ group_name: name }),
            });
            if (response.ok) {
                alert("Group created successfully!");
                fetchGroups();
            } else {
                throw new Error("Failed to create group");
            }
        } catch (error) {
            console.error("Error creating group:", error);
        }
    }

    // グループ一覧に戻る
    backToGroupsBtn.addEventListener("click", () => {
        groupPostsSection.classList.add("hidden");
        groupList.classList.remove("hidden");
    });

    // 初期化
    fetchGroups();
});
