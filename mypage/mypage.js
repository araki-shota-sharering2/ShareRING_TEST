async function fetchUserInfo() {
    try {
        const response = await fetch('/user-info', { method: 'GET', credentials: 'include' });
        if (response.ok) {
            const user = await response.json();
            document.getElementById('username').textContent = user.username;
            document.getElementById('email').textContent = user.email;
            document.getElementById('created-at').textContent = new Date(user.created_at).toLocaleDateString();
            document.getElementById('profile-image').src = user.profile_image || '/assets/images/default-profile.png';
        } else {
            console.error("ユーザー情報の取得に失敗しました");
        }
    } catch (error) {
        console.error("エラーが発生しました:", error);
    }
}

document.getElementById('logout-button').addEventListener('click', async () => {
    try {
        const response = await fetch('/logout', { method: 'POST', credentials: 'include' });
        if (response.ok) {
            window.location.href = '/login/login.html';
        } else {
            console.error("ログアウトに失敗しました");
        }
    } catch (error) {
        console.error("エラーが発生しました:", error);
    }
});

document.getElementById('delete-account-button').addEventListener('click', async () => {
    if (confirm("本当にアカウントを削除しますか？この操作は元に戻せません。")) {
        try {
            const response = await fetch('/delete-account-handler', { method: 'DELETE', credentials: 'include' });
            if (response.ok) {
                alert("アカウントが削除されました");
                window.location.href = '/login/login.html';
            } else {
                console.error("アカウント削除に失敗しました");
                alert("アカウント削除に失敗しました");
            }
        } catch (error) {
            console.error("エラーが発生しました:", error);
            alert("アカウント削除中にエラーが発生しました");
        }
    }
});

fetchUserInfo();
