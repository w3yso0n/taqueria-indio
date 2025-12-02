import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { comparePassword, signToken, setSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 });
        }

        const users = await query('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (!user) {
            return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
        }

        const isValid = await comparePassword(password, user.password);

        if (!isValid) {
            return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
        }

        const token = signToken({ id: user.id, email: user.email, role: user.role });
        await setSession(token);

        return NextResponse.json({ success: true, user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
