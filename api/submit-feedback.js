// api/submit-feedback.js

import sanityClient from '@sanity/client';

const client = sanityClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET,
    apiVersion: 'v2021-10-26',
    token: process.env.SANITY_API_WRITE_TOKEN, // Token aman di server
    useCdn: false,
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { name, kelas, message } = req.body;

    if (!message) {
        return res.status(400).json({ success: false, message: 'Pesan kritik/saran wajib diisi.' });
    }

    try {
        const doc = {
            _type: 'feedback',
            name: name || 'Hamba Allah (Anonim)',
            kelas: kelas || '-',
            message: message,
            submittedAt: new Date().toISOString(),
            status: 'new'
        };

        await client.create(doc);

        return res.status(200).json({ success: true, message: 'Terima kasih! Masukan Anda telah kami terima.' });

    } catch (error) {
        console.error('Feedback Error:', error);
        return res.status(500).json({ success: false, message: 'Gagal mengirim pesan. Coba lagi nanti.' });
    }
}