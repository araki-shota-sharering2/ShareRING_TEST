import { generateUUID } from './utils';
import crypto from 'crypto';

export async function onRequestPost(context) {
    const { env, request } = context;
    const formData = await request.formData();
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');
    const profileImage = formData.get('profile_image');

    if (!username || !email || !password || !profileImage) {
        return new Response(JSON.stringify({ message: 'All fields are required' }), { status: 400 });
    }

    const salt = crypto.randomUUID();
    const iterations = 100000;
    const keyLength = 32;

    // Hash the password with PBKDF2
    const hashedPassword = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
    ).then(key => crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations, hash: 'SHA-256' },
        key,
        keyLength * 8
    ));

    const hashedPasswordHex = Array.from(new Uint8Array(hashedPassword))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    try {
        const db = env.DB;
        await db.prepare(
            `INSERT INTO user_accounts (username, email, password, profile_image, salt) VALUES (?, ?, ?, ?, ?)`
        ).bind(username, email, hashedPasswordHex, profileImage, salt).run();

        return new Response(JSON.stringify({ message: 'User registered successfully' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error during registration:', error);
        return new Response(JSON.stringify({ message: 'Registration failed', error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
