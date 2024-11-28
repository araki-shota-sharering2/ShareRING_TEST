document.getElementById('groupForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);

    try {
        const response = await fetch('/group-create', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (response.ok) {
            alert('グループ作成が成功しました！');
            loadGroups();
        } else {
            alert('グループ作成に失敗しました: ' + result.message);
        }
    } catch (error) {
        console.error('エラー:', error);
        alert('グループ作成中にエラーが発生しました。');
    }
});

async function loadGroups() {
    const response = await fetch('/group-list');
    const groups = await response.json();

    const groupsContainer = document.getElementById('groups');
    groupsContainer.innerHTML = groups.map(group => `
        <div class="group-card">
            <h3>${group.group_name}</h3>
            <p>${group.description}</p>
            <img src="${group.group_image_url}" alt="${group.group_name}" width="100%">
        </div>
    `).join('');
}

loadGroups();
