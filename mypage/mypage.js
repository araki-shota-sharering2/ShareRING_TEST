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
            document.getElementById('profile-image-url').textContent = user.profile_image || '';

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

// 編集ボタンのイベント設定
document.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', () => {
        const field = button.dataset.field;
        const displayElement = document.getElementById(field);
        const inputElement = document.getElementById(`edit-${field}`);
        
        // 表示と入力を切り替え
        if (inputElement.style.display === 'none') {
            inputElement.style.display = 'block';
            displayElement.style.display = 'none';
            button.textContent = '保存';
        } else {
            // 編集データをサーバーに送信
            updateUserInfo(field, inputElement.value)
                .then(success => {
                    if (success) {
                        // 成功時に表示を更新し、編集モードを終了
                        displayElement.textContent = inputElement.value;
                        if (field === 'profile_image') {
                            document.getElementById('profile-image').src = inputElement.value || '/assets/images/default-profile.png';
                            document.getElementById('profile-image-url').textContent = inputElement.value || '';
                        }
                        inputElement.style.display = 'none';
                        displayElement.style.display = 'block';
                        button.textContent = '編集';
                    } else {
                        alert("情報の更新に失敗しました。再試行してください。");
                    }
                });
        }
    });
});

// 更新関数
async function updateUserInfo(field, value) {
    const updatedData = { [field]: value };

    try {
        const response = await fetch('/update-user-info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(updatedData)
        });

        if (response.ok) {
            alert("情報が更新されました");
            return true;
        } else {
            console.error("情報の更新に失敗しました:", await response.text());
            return false;
        }
    } catch (error) {
        console.error("エラーが発生しました:", error);
        return false;
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
