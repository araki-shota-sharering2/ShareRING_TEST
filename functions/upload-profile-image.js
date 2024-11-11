export async function onRequestPost(context) {
    const { env, request } = context;

    const cookieHeader = request.headers.get("Cookie");
    const cookies = new Map(cookieHeader?.split("; ").map(c => c.split("=")));
    const sessionId = cookies.get("session_id");

    if (!sessionId) {
        console.error("Unauthorized access: No session ID found");
        return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    try {
        // ユーザーIDと現在のプロフィール画像URLを取得
        const session = await env.DB.prepare(`
            SELECT user_id, profile_image FROM user_accounts 
            JOIN user_sessions ON user_accounts.user_id = user_sessions.user_id 
            WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP
        `).bind(sessionId).first();

        if (!session) {
            console.error("Unauthorized access: No valid session found");
            return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const formData = await request.formData();
        const profileImage = formData.get('file');

        if (!profileImage) {
            console.error("No file uploaded");
            return new Response(JSON.stringify({ message: "No file uploaded" }), { status: 400 });
        }

        // タイムスタンプを利用して一意のファイル名を作成
        const timestamp = Date.now();
        const uniqueFileName = `profile-${session.user_id}-${timestamp}-${profileImage.name}`;
        const r2Key = `profile_images/${uniqueFileName}`;

        // 古い画像の削除（存在する場合）
        if (session.profile_image) {
            const oldImageName = session.profile_image.replace(/^.+\/([^/]+)$/, '$1');
            try {
                await env.MY_R2_BUCKET.delete(oldImageName);
                console.log(`Old image deleted: ${oldImageName}`);
            } catch (deleteError) {
                console.error("Error deleting old image:", deleteError);
            }
        }

        // 新しい画像をR2にアップロード
        try {
            await env.MY_R2_BUCKET.put(r2Key, profileImage.stream(), {
                headers: { 'Content-Type': profileImage.type }
            });
            console.log(`New image uploaded: ${r2Key}`);
        } catch (uploadError) {
            console.error("Error uploading new image:", uploadError);
            return new Response(JSON.stringify({ message: "Failed to upload new image" }), { status: 500 });
        }

        // 新しいURLを生成
        const newImageUrl = `https://pub-ae948fe5f8c746a298df11804f9d8839.r2.dev/${r2Key}`;

        // データベースを更新
        try {
            await env.DB.prepare(`
                UPDATE user_accounts SET profile_image = ? WHERE user_id = ?
            `).bind(newImageUrl, session.user_id).run();
            console.log("Database updated with new image URL");
        } catch (dbError) {
            console.error("Error updating database:", dbError);
            return new Response(JSON.stringify({ message: "Failed to update database" }), { status: 500 });
        }

        return new Response(JSON.stringify({ message: 'プロフィール画像が更新されました', newImageUrl }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error("Unknown error:", error);
        return new Response(JSON.stringify({ message: "サーバーエラー", error: error.message }), { status: 500 });
    }
}
