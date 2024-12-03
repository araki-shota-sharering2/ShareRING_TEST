export async function onRequestPost(context) {
    const { env, request } = context;

    try {
        const cookieHeader = request.headers.get("Cookie");
        const cookies = Object.fromEntries(
            cookieHeader?.split("; ").map((c) => c.split("=").map(decodeURIComponent)) || []
        );
        const sessionId = cookies.session_id;

        if (!sessionId) {
            return new Response(JSON.stringify({ message: "セッションIDがありません。" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const session = await env.DB.prepare(
            "SELECT user_id FROM user_sessions WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP"
        ).bind(sessionId).first();

        if (!session) {
            return new Response(JSON.stringify({ message: "セッションが無効または期限切れです。" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        const userId = session.user_id;

        const formData = await request.formData();
        const groupName = formData.get("groupName");
        const description = formData.get("description") || "";
        const groupImage = formData.get("groupImage");

        if (!groupName || !groupImage) {
            return new Response(JSON.stringify({ message: "グループ名と画像は必須です。" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const timestamp = Date.now();
        const uniqueFileName = `group-${timestamp}-${groupImage.name}`;
        const r2Key = `group_images/${uniqueFileName}`;

        try {
            await env.MY_R2_BUCKET.put(r2Key, groupImage.stream(), {
                headers: { "Content-Type": groupImage.type },
            });
        } catch (error) {
            console.error("画像アップロードエラー:", error);
            return new Response(JSON.stringify({ message: "画像のアップロードに失敗しました。" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }

        const groupImageUrl = `https://pub-ae948fe5f8c746a298df11804f9d8839.r2.dev/${r2Key}`;

        // 7桁のランダムな英字IDを生成
        const generateRandomGroupId = () => {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
            let result = '';
            for (let i = 0; i < 7; i++) {
                result += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            return result;
        };

        const randomGroupId = generateRandomGroupId();

        let groupId;
        try {
            const createGroupQuery = `
                INSERT INTO user_groups (group_id, group_name, description, group_image_url, created_by)
                VALUES (?, ?, ?, ?, ?)
            `;
            const result = await env.DB.prepare(createGroupQuery)
                .bind(randomGroupId, groupName, description, groupImageUrl, userId)
                .run();
            groupId = randomGroupId;
        } catch (error) {
            console.error("グループ作成エラー:", error);
            return new Response(JSON.stringify({ message: "グループ作成に失敗しました。" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify({ message: "グループが正常に作成されました", groupId }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("全体エラー:", error);
        return new Response(JSON.stringify({ message: "グループ作成に失敗しました。", error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
