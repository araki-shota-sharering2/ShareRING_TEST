// ページが読み込まれたときにユーザー情報を取得
async function fetchUserInfo() {
    try {
        const response = await fetch('/user-info', {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            const user = await response.json();

            // ユーザー情報をHTMLに反映
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

// ログアウトボタンのクリックイベントを設定
document.getElementById('logout-button').addEventListener('click', async () => {
    try {
        const response = await fetch('/logout', {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            // ログアウト成功後にログインページにリダイレクト
            window.location.href = '/login/login.html';
        } else {
            console.error("ログアウトに失敗しました");
        }
    } catch (error) {
        console.error("エラーが発生しました:", error);
    }
});

// ページロード時にユーザー情報を取得
fetchUserInfo();
