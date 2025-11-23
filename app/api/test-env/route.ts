import { NextResponse } from 'next/server';

export async function GET() {
    const config = {
        DB_HOST: process.env.DB_HOST || 'NOT SET',
        DB_PORT: process.env.DB_PORT || 'NOT SET',
        DB_USERNAME: process.env.DB_USERNAME || 'NOT SET',
        DB_PASSWORD: process.env.DB_PASSWORD ? '***SET***' : 'NOT SET',
        DB_DATABASE: process.env.DB_DATABASE || 'NOT SET',
    };

    console.log('📋 Environment Variables Check:', config);

    return NextResponse.json({
        message: 'Environment variables check',
        config,
        allEnvKeys: Object.keys(process.env).filter(key => key.startsWith('DB_'))
    });
}
