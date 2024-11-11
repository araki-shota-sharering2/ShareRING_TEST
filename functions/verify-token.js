import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY;

export async function onRequestPost(context) {
    const { request } = context;
    const authHeader = request.headers.get('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        return new Response(JSON.stringify({ message: 'トークンが有効です', user: decoded }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('トークン検証エラー:', error);
        return new Response('Invalid token', { status: 401 });
    }
}
