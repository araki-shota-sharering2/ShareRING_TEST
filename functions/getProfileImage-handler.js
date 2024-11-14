// functions/getProfileImage-handler.js

import { getUserProfileImage } from './utils';

export async function onRequestGet(context) {
    try {
        const profileImage = await getUserProfileImage(context);
        return new Response(JSON.stringify({ profile_image: profileImage }), {
            headers: { "Content-Type": "application/json" },
            status: 200
        });
    } catch (error) {
        console.error("プロフィール画像取得エラー:", error);
        return new Response(JSON.stringify({ message: "プロフィール画像を取得できませんでした" }), {
            headers: { "Content-Type": "application/json" },
            status: 500
        });
    }
}
