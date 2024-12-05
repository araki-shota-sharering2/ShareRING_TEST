export async function onRequestPost(context) {
    const { user_id } = await context.request.json();
    const db = context.env.DB;

    // アチーブメント一覧（達成条件と計算ロジックを定義）
    const achievements = [
        {
            id: 1,
            name: "投稿デビュー",
            description: "初めて投稿を行う。",
            goal: 1,
            query: `SELECT COUNT(*) as progress FROM user_posts WHERE user_id = ?`
        },
        {
            id: 2,
            name: "投稿ベテラン",
            description: "累計30件の投稿を作成。",
            goal: 30,
            query: `SELECT COUNT(*) as progress FROM user_posts WHERE user_id = ?`
        },
        {
            id: 3,
            name: "投稿マスター",
            description: "累計50件の投稿を作成。",
            goal: 50,
            query: `SELECT COUNT(*) as progress FROM user_posts WHERE user_id = ?`
        },
        {
            id: 4,
            name: "散歩好き",
            description: "累計10kmを歩行。",
            goal: 10,
            query: `SELECT IFNULL(SUM(distance), 0) as progress FROM fitness_activities WHERE user_id = ?`
        },
        {
            id: 5,
            name: "街歩きマスター",
            description: "累計50kmを歩行。",
            goal: 50,
            query: `SELECT IFNULL(SUM(distance), 0) as progress FROM fitness_activities WHERE user_id = ?`
        },
        {
            id: 6,
            name: "歩行の達人",
            description: "累計100kmを歩行。",
            goal: 100,
            query: `SELECT IFNULL(SUM(distance), 0) as progress FROM fitness_activities WHERE user_id = ?`
        },
        {
            id: 7,
            name: "カロリーカッター",
            description: "累計500kcalを消費。",
            goal: 500,
            query: `SELECT IFNULL(SUM(calories_burned), 0) as progress FROM fitness_activities WHERE user_id = ?`
        },
        {
            id: 8,
            name: "カロリーバーナー",
            description: "累計2000kcalを消費。",
            goal: 2000,
            query: `SELECT IFNULL(SUM(calories_burned), 0) as progress FROM fitness_activities WHERE user_id = ?`
        },
        {
            id: 9,
            name: "カロリーマスター",
            description: "累計5000kcalを消費。",
            goal: 5000,
            query: `SELECT IFNULL(SUM(calories_burned), 0) as progress FROM fitness_activities WHERE user_id = ?`
        },
        {
            id: 10,
            name: "グループ参加者",
            description: "グループに1件投稿。",
            goal: 1,
            query: `SELECT COUNT(*) as progress FROM group_posts WHERE user_id = ?`
        },
        {
            id: 11,
            name: "グループ活性化員",
            description: "グループに3件投稿。",
            goal: 3,
            query: `SELECT COUNT(*) as progress FROM group_posts WHERE user_id = ?`
        },
        {
            id: 12,
            name: "コミュニティリーダー",
            description: "グループに10件投稿。",
            goal: 10,
            query: `SELECT COUNT(*) as progress FROM group_posts WHERE user_id = ?`
        },
        {
            id: 13,
            name: "グループ初心者",
            description: "1グループを作成。",
            goal: 1,
            query: `SELECT COUNT(*) as progress FROM user_groups WHERE created_by = ?`
        },
        {
            id: 14,
            name: "グループリーダー",
            description: "3グループを作成。",
            goal: 3,
            query: `SELECT COUNT(*) as progress FROM user_groups WHERE created_by = ?`
        },
        {
            id: 15,
            name: "グループマスター",
            description: "5グループを作成。",
            goal: 5,
            query: `SELECT COUNT(*) as progress FROM user_groups WHERE created_by = ?`
        },
        {
            id: 16,
            name: "ログインスターター",
            description: "累計5日ログイン。",
            goal: 5,
            query: `
                SELECT COUNT(DISTINCT DATE(created_at)) as progress 
                FROM user_sessions WHERE user_id = ?
            `
        },
        {
            id: 17,
            name: "ログイン常連者",
            description: "累計10日ログイン。",
            goal: 10,
            query: `
                SELECT COUNT(DISTINCT DATE(created_at)) as progress 
                FROM user_sessions WHERE user_id = ?
            `
        },
        {
            id: 18,
            name: "ログインマスター",
            description: "累計30日ログイン。",
            goal: 30,
            query: `
                SELECT COUNT(DISTINCT DATE(created_at)) as progress 
                FROM user_sessions WHERE user_id = ?
            `
        }
    ];

    const results = [];

    try {
        for (const achievement of achievements) {
            // 各アチーブメントの進捗を計算
            const progressResult = await db.prepare(achievement.query).bind(user_id).first();
            const progress = progressResult ? progressResult.progress : 0;
            const achieved_at = progress >= achievement.goal ? new Date().toISOString() : null;

            // `awards`テーブルから対応する画像URLを取得
            const imageResult = await db.prepare(
                `SELECT image_url FROM awards WHERE name = ?`
            ).bind(achievement.name).first();

            results.push({
                name: achievement.name,
                description: achievement.description,
                goal: achievement.goal,
                progress: progress,
                achieved_at: achieved_at,
                image_url: imageResult ? imageResult.image_url : '/default-image.png' // デフォルト画像を設定
            });
        }

        return new Response(JSON.stringify(results), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error) {
        console.error('Error in achievements handler:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to calculate achievements' }),
            { headers: { 'Content-Type': 'application/json' }, status: 500 }
        );
    }
}
