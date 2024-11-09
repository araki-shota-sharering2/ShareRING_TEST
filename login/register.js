document.getElementById('registration-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const profileImage = document.getElementById('profile-image').files[0];

    if (!profileImage) {
        alert('プロフィール画像を選択してください');
        return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('profile-image', profileImage);

    try {
        const response = await fetch('/register', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            alert('ユーザー登録が完了しました');
            location.reload();
        } else {
            throw new Error('登録に失敗しました');
        }
    } catch (error) {
        alert(`エラー: ${error.message}`);
    }
});
