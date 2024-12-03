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
        const response = await fetch("/group-handler", {
            method: "POST",
            body: formData,
        });

        const result = await response.json();

        if (response.ok) {
            alert("グループが正常に作成されました");
            // グループリストを更新
            fetchGroups();
        } else {
            alert(`エラー: ${result.message}`);
        }
    } catch (error) {
        console.error("グループ作成エラー:", error);
        alert("グループ作成中にエラーが発生しました");
    }
});

async function fetchGroups() {
    try {
        const response = await fetch("/group-handler");
        const groups = await response.json();

        const groupList = document.getElementById("groups");
        groupList.innerHTML = "";

        groups.forEach((group) => {
            const li = document.createElement("li");
            li.textContent = group.group_name;
            groupList.appendChild(li);
        });
    } catch (error) {
        console.error("グループ取得エラー:", error);
    }
}

// 初期化時にグループを取得
fetchGroups();
