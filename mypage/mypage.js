// ページが読み込まれたときにユーザー情報を取得
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

// 編集ボタンのクリックイベント
document.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', (event) => {
        const field = event.target.getAttribute('data-field');
        const displayElement = document.getElementById(field);
        const inputElement = document.getElementById(`edit-${field}`);

        // 表示と入力フィールドの切り替え
        if (inputElement.style.display === 'none') {
            inputElement.value = displayElement.textContent;
            displayElement.style.display = 'none';
            inputElement.style.display = 'inline';
            event.target.textContent = '保存';
        } else {
            const formData = new FormData();
            formData.append(field, inputElement.value);
            updateUserInfo(formData, field, displayElement, inputElement, event.target);
        }
    });
});

// ユーザー情報の更新
async function updateUserInfo(formData, field, displayElement, inputElement, button) {
    try {
        const response = await fetch('/update-user-info', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        if (response.ok) {
            displayElement.textContent = formData.get(field);
            inputElement.style.display = 'none';
            displayElement.style.display = 'inline';
            button.textContent = '編集';
            alert("情報が更新されました");
        } else {
            const result = await response.json();
            console.error("情報の更新に失敗しました:", result.message);
            alert("情報の更新に失敗しました: " + result.message);
        }
    } catch (error) {
        console.error("エラーが発生しました:", error);
        alert("情報の更新中にエラーが発生しました");
    }
}

// ログアウトボタンのクリックイベント
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

// アカウント削除ボタンのクリックイベント
document.getElementById('delete-account-button').addEventListener('click', async () => {
    if (confirm("本当にアカウントを削除しますか？この操作は元に戻せません。")) {
        try {
            const response = await fetch('/delete-account-handler', { method: 'DELETE', credentials: 'include' });
            if (response.ok) {
                alert("アカウントが削除されました");
                window.location.href = '/login/login.html';
            } else {
                const result = await response.json();
                console.error("アカウント削除に失敗しました:", result.message);
                alert("アカウント削除に失敗しました: " + result.message);
            }
        } catch (error) {
            console.error("エラーが発生しました:", error);
            alert("アカウント削除中にエラーが発生しました");
        }
    }
});
