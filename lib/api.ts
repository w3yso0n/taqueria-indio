// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
console.log('🔧 API_URL configurada:', API_URL);

export const api = {
    async get(endpoint: string) {
        const res = await fetch(`${API_URL}${endpoint}`);
        if (!res.ok) {
            const errorText = await res.text();
            console.error('GET Error:', errorText);
            throw new Error(`Network response was not ok: ${res.status}`);
        }
        return res.json();
    },

    async post(endpoint: string, data: any) {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const errorText = await res.text();
            console.error('POST Error:', errorText);
            throw new Error(`Network response was not ok: ${res.status}`);
        }
        return res.json();
    },

    async patch(endpoint: string, data: any) {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const errorText = await res.text();
            console.error('PATCH Error:', errorText);
            throw new Error(`Network response was not ok: ${res.status}`);
        }
        return res.json();
    },

    async delete(endpoint: string) {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
        });
        if (!res.ok) {
            const errorText = await res.text();
            console.error('DELETE Error:', errorText);
            throw new Error(`Network response was not ok: ${res.status}`);
        }
        return res.json();
    },
};