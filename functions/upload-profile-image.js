export async function onRequestPost(context) {
    const { request, env } = context;
    const cookieHeader = request.headers.get("Cookie");
    const cookies = new Map(cookieHeader?.split("; ").map(c => c.split("=")));
    const sessionId = cookies.get("session_id");

    if (!sessionId) {
        console.error("Unauthorized access: No session ID found");
        return new Response("Unauthorized", { status: 401 });
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
            return new Response("Unauthorized", { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            console.error("No file uploaded");
            return new Response("No file uploaded", { status: 400 });
        }

        // 古い画像の削除（存在する場合）
        if (session.profile_image) {
            const oldImageName = session.profile_image.replace(/^.+\/([^/]+)$/, '$1');
            try {
                await env.R2_BUCKET.delete(oldImageName);
                console.log(`Old image deleted: ${oldImageName}`);
            } catch (deleteError) {
                console.error("Error deleting old image:", deleteError);
            }
        }

        // 新しい画像のアップロード
        const newFileName = `profile_images/${session.user_id}-${Date.now()}`;
        try {
            await env.R2_BUCKET.put(newFileName, file.stream(), {
                httpMetadata: { contentType: file.type }
            });
            console.log(`New image uploaded: ${newFileName}`);
        } catch (uploadError) {
            console.error("Error uploading new image:", uploadError);
            return new Response("Failed to upload new image", { status: 500 });
        }

        const newImageUrl = `${env.R2_PUBLIC_URL}/${newFileName}`;

        // データベースを更新
        try {
            await env.DB.prepare(`
                UPDATE user_accounts SET profile_image = ? WHERE user_id = ?
            `).bind(newImageUrl, session.user_id).run();
            console.log("Database updated with new image URL");
        } catch (dbError) {
            console.error("Error updating database:", dbError);
            return new Response("Failed to update database", { status: 500 });
        }

        return new Response(JSON.stringify({ newImageUrl }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        console.error("Unknown error:", error);
        return new Response("サーバーエラー", { status: 500 });
    }
}
