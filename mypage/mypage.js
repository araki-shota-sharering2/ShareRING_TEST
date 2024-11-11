// ページが読み込まれたときにユーザー情報を取得
async function fetchUserInfo() {
    try {
        const response = await fetch('/user-info', {
            method: 'GET',
            credentials: 'include'
        });

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

// 画像クリック時のファイル選択
document.getElementById('file-input').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
        // 古い画像の削除と新しい画像のアップロード
        const formData = new FormData();
        formData.append('file', file);

        const uploadResponse = await fetch('/upload-profile-image', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        if (uploadResponse.ok) {
            const { newImageUrl } = await uploadResponse.json();
            document.getElementById('profile-image').src = newImageUrl;
            alert("プロフィール画像が更新されました");
        } else {
            console.error("画像のアップロードに失敗しました");
        }
    } catch (error) {
        console.error("エラーが発生しました:", error);
    }
});

// ログアウトボタンのクリックイベント
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
