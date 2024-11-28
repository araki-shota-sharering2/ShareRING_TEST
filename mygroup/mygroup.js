document.getElementById('group-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const groupName = document.getElementById('group-name').value;
    const description = document.getElementById('group-description').value;
    const groupImageUrl = document.getElementById('group-image-url').value;

    const response = await fetch('/group-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupName, description, groupImageUrl }),
    });

    if (response.ok) {
        alert("グループが作成されました！");
        loadGroups();
    } else {
        alert("グループ作成に失敗しました。");
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
            <img src="${group.group_image_url}" alt="${group.group_name}" width="100">
            <small>作成日: ${new Date(group.created_at).toLocaleDateString()}</small>
        </div>
    `).join('');
}

loadGroups();
