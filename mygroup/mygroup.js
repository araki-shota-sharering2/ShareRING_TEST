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
            const groupId = result.groupId;

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
            // グループのリストアイテムを作成
            const li = document.createElement("li");
            li.classList.add("group-item");

            // グループ画像を表示する要素を作成
            const img = document.createElement("img");
            img.src = group.group_image_url || "default-image.jpg"; // デフォルト画像を設定
            img.alt = group.group_name;
            img.classList.add("group-image");

            // グループ名を表示する要素を作成
            const name = document.createElement("p");
            name.textContent = group.group_name;
            name.classList.add("group-name");

            // 要素をリストアイテムに追加
            li.appendChild(img);
            li.appendChild(name);

// クリックイベントを追加してグループIDを渡す
li.addEventListener("click", () => {
    // mygroup_viewing.html ページにグループIDを渡して遷移
    window.location.href = `/mygroup/mygroup_viewing.html?groupId=${group.group_id}`;
});

            // リストにアイテムを追加
            groupList.appendChild(li);
        });
    } catch (error) {
        console.error("グループ取得エラー:", error);
    }
}

// 初期化時にグループを取得
fetchGroups();


// 初期化時にグループを取得
fetchGroups();
