document.addEventListener("DOMContentLoaded", async () => {
    const groupList = document.getElementById("groupList");
    const groupSearch = document.getElementById("groupSearch");
    const searchButton = document.getElementById("searchButton");

    // グループ一覧を取得
    async function fetchGroups() {
        const response = await fetch("/group-handler.js");
        if (!response.ok) {
            groupList.innerHTML = "<p>グループを取得できませんでした。</p>";
            return;
        }

        const groups = await response.json();
        displayGroups(groups);
    }

    // グループ一覧を表示
    function displayGroups(groups) {
        groupList.innerHTML = ""; // 初期化
        groups.forEach(group => {
            const groupItem = document.createElement("div");
            groupItem.className = "group-item";
            groupItem.innerHTML = `
                <h3>${group.group_name}</h3>
                <p>${group.description || "説明がありません"}</p>
            `;
            groupList.appendChild(groupItem);
        });
    }

    // 検索機能
    searchButton.addEventListener("click", () => {
        const query = groupSearch.value.toLowerCase();
        const groupItems = document.querySelectorAll(".group-item");
        groupItems.forEach(item => {
            const groupName = item.querySelector("h3").innerText.toLowerCase();
            item.style.display = groupName.includes(query) ? "block" : "none";
        });
    });

    await fetchGroups();
});
