export async function onRequestDelete(context) {
    const { env, request } = context;
    
    try {
        const formData = await request.formData();
        const email = formData.get('email'); // 削除対象のユーザー識別にemailを使用（または他の識別子）

        if (!email) {
            return new Response(JSON.stringify({ message: 'メールアドレスが必要です' }), { status: 400 });
        }

        const db = env.DB;
        
        // D1データベースからユーザーを削除
        const deleteResult = await db.prepare(`DELETE FROM user_accounts WHERE email = ?`).bind(email).run();

        if (deleteResult.changes === 0) {
            return new Response(JSON.stringify({ message: '指定されたユーザーが見つかりません' }), { status: 404 });
        }

        // R2からプロフィール画像の削除
        // プロフィール画像のURLを取得し、R2のキーを特定します
        const userResult = await db.prepare(`SELECT profile_image FROM user_accounts WHERE email = ?`).bind(email).first();

        if (userResult && userResult.profile_image) {
            const r2Key = userResult.profile_image.split('https://pub-ae948fe5f8c746a298df11804f9d8839.r2.dev/')[1];
            await env.MY_R2_BUCKET.delete(r2Key);
        }

        return new Response(JSON.stringify({ message: 'アカウントが削除されました' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('削除中のエラー:', error);
        return new Response(JSON.stringify({ message: '削除に失敗しました', error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
