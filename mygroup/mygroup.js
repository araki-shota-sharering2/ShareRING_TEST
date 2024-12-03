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
        // グループ作成リクエスト
        const response = await fetch("/group-create-handler", {
            method: "POST",
            body: formData,
        });

        const result = await response.json();

        if (response.ok) {
            const groupId = result.groupId;

            // メンバー登録リクエスト
            const registerResponse = await fetch("/group-register-handler", {
                method: "POST",
                body: new URLSearchParams({ groupId }),
            });

            if (registerResponse.ok) {
                alert("グループが正常に作成され、メンバー登録が完了しました");
                fetchGroups();
            } else {
                const registerError = await registerResponse.json();
                console.error("メンバー登録エラー:", registerError);
                alert(`メンバー登録エラー: ${registerError.message}`);
            }
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
