// 認証APIにリクエストを送り、認証状態を確認
async function checkAuthentication() {
    try {
        const response = await fetch('/authenticate', {
            method: 'GET',
            credentials: 'include' // クッキーを含めてリクエスト
        });

        if (response.status === 401) {
            // 認証されていない場合、/login/login.htmlにリダイレクト
            window.location.href = '/login/login.html';
        } else if (response.status === 200) {
            console.log("認証成功");
        }
    } catch (error) {
        console.error("認証エラー:", error);
        window.location.href = '/login/login.html'; // エラー時も/login/login.htmlにリダイレクト
    }
}

// ページロード時に認証をチェック
checkAuthentication();
