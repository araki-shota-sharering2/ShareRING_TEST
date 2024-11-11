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

            // フォームに現在の情報を反映
            document.getElementById('edit-username').value = user.username;
            document.getElementById('edit-email').value = user.email;
            document.getElementById('edit-profile-image').value = user.profile_image || '';
        } else {
            console.error("ユーザー情報の取得に失敗しました");
        }
    } catch (error) {
        console.error("エラーが発生しました:", error);
    }
}

// フォーム送信時にユーザー情報を更新
document.getElementById('edit-form').addEventListener('submit', async (event) => {
    event.preventDefault(); // フォームのデフォルト送信を防ぐ

    const updatedData = {
        username: document.getElementById('edit-username').value,
        email: document.getElementById('edit-email').value,
        profile_image: document.getElementById('edit-profile-image').value
    };

    try {
        const response = await fetch('/update-user-info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(updatedData)
        });

        if (response.ok) {
            alert("登録情報が更新されました");
            fetchUserInfo(); // 更新後の情報を再取得して表示
        } else {
            console.error("情報の更新に失敗しました");
        }
    } catch (error) {
        console.error("エラーが発生しました:", error);
    }
});

// ログアウトボタンのクリックイベントを設定
document.getElementById('logout-button').addEventListener('click', async () => {
    try {
        const response = await fetch('/logout', {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
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
