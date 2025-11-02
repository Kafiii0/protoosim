// api/submit-alumni.js (Kode Serverless Function untuk Vercel)

import sanityClient from '@sanity/client';
import formidable from 'formidable';
import fs from 'fs'; // Node.js File System module

// PENTING: Konfigurasi Client Sanity Write
const client = sanityClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET,
    apiVersion: 'v2021-10-26',
    token: process.env.SANITY_API_WRITE_TOKEN, // <-- Token diambil secara aman dari Vercel ENV VARS
    useCdn: false,
});

// Konfigurasi Formidable (untuk parsing file upload)
export const config = {
    api: {
        bodyParser: false, // Matikan body-parser Vercel agar formidable bisa bekerja dengan file
    },
};

// Handler utama
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    // 1. Parsing FormData (termasuk file)
    const form = formidable({ multiples: false, maxFileSize: 5 * 1024 * 1024 /* 5MB */ });

    const [fields, files] = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) return reject(err);
            resolve([fields, files]);
        });
    }).catch(err => {
        return [null, null];
    });
    
    if (!fields || !files) {
        return res.status(500).json({ success: false, message: 'Gagal memproses data formulir atau file terlalu besar.' });
    }
    
    const file = files.graduationProof ? files.graduationProof[0] : null;

    try {
        // 2. Validasi Data
        if (!fields.fullName || !fields.contactEmail || !file) {
            return res.status(400).json({ success: false, message: 'Nama, Email, dan Bukti Kelulusan wajib diisi.' });
        }
        
        // Data yang siap diupload
        const fileToUpload = fs.createReadStream(file.filepath);

        // 3. Upload File Bukti Kelulusan ke Sanity Assets
        const asset = await client.assets.upload('file', fileToUpload, {
            filename: `${fields.fullName}_SKL`,
            contentType: file.mimetype,
        });

        // 4. Membuat Dokumen Pengajuan (alumniApplication)
        const doc = {
            _type: 'alumniApplication',
            fullName: fields.fullName[0], // Ambil nilai array pertama dari fields
            contactEmail: fields.contactEmail[0],
            contactPhone: fields.contactPhone[0] || '',
            graduationProof: {
                _type: 'file',
                asset: {
                    _type: 'reference',
                    _ref: asset._id,
                }
            },
            status: 'pending',
            adminNotes: 'Menunggu peninjauan bukti SKL.',
        };

        // 5. Simpan dokumen di Sanity
        await client.create(doc);

        return res.status(200).json({ success: true, message: 'Pengajuan berhasil.' });

    } catch (error) {
        console.error('Sanity Write Error:', error);
        return res.status(500).json({ success: false, message: `Kesalahan Server: ${error.message}` });
    }
}
