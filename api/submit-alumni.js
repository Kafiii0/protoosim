// api/submit-alumni.js (Kode Serverless Function untuk Vercel - FINAL)

import sanityClient from '@sanity/client';
import formidable from 'formidable';
import fs from 'fs'; 

const client = sanityClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET,
    apiVersion: 'v2021-10-26',
    token: process.env.SANITY_API_WRITE_TOKEN, 
    useCdn: false,
});

export const config = {
    api: {
        bodyParser: false, 
    },
};

// --- FUNGSI HELPER UPLOAD FILE KE SANITY ---
async function uploadFileToSanity(file, filename) {
    if (!file) return null;
    
    const fileToUpload = fs.createReadStream(file.filepath);
    
    const asset = await client.assets.upload('file', fileToUpload, {
        filename: filename,
        contentType: file.mimetype,
    });
    
    // Hapus file sementara dari serverless function setelah upload
    fs.unlinkSync(file.filepath);
    
    return {
        _type: 'file',
        asset: { _type: 'reference', _ref: asset._id },
    };
}

// Handler utama
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    // 1. Parsing FormData
    const form = formidable({ multiples: true, maxFileSize: 10 * 1024 * 1024 /* 10MB */ }); // Ukuran dinaikkan karena 3 file

    const [fields, files] = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) return reject(err);
            resolve([fields, files]);
        });
    }).catch(err => {
        return res.status(500).json({ success: false, message: 'Kesalahan parsing formulir atau file terlalu besar.' });
    });
    
    // Ambil nilai dari fields array
    const getFieldValue = (field) => fields[field] ? fields[field][0] : undefined;
    
    const requiredFiles = {
        manGradProof: files.graduationProof ? files.graduationProof[0] : null, // Wajib
        formalPhoto: files.formalProfilePhoto ? files.formalProfilePhoto[0] : null,
        uniGradProof: files.uniGraduationProof ? files.uniGraduationProof[0] : null,
    };

    try {
        // 2. Validasi File Wajib
        if (!getFieldValue('fullName') || !getFieldValue('contactEmail') || !requiredFiles.manGradProof) {
            return res.status(400).json({ success: false, message: 'Nama, Email, dan Bukti Kelulusan MAN 1 wajib diisi.' });
        }
        
        // 3. Upload File ke Sanity
        
        // A. Upload Bukti Lulus MAN 1 (Wajib)
        const manGradAsset = await uploadFileToSanity(requiredFiles.manGradProof, `${getFieldValue('fullName')}_SKL_MAN`);

        // B. Upload Foto Formal (Opsional, tapi penting untuk direktori)
        const photoAsset = await uploadFileToSanity(requiredFiles.formalPhoto, `${getFieldValue('fullName')}_Photo`);
        
        // C. Upload Bukti Lulus Kampus (Opsional)
        const uniGradAsset = await uploadFileToSanity(requiredFiles.uniGradProof, `${getFieldValue('fullName')}_SKL_Uni`);


        // 4. Membuat Dokumen Pengajuan (alumniApplication)
        const doc = {
            _type: 'alumniApplication',
            fullName: getFieldValue('fullName'),
            contactEmail: getFieldValue('contactEmail'),
            contactPhone: getFieldValue('contactPhone') || '',
            socialMedia: getFieldValue('socialMedia') || '',
            
            // Data Pendidikan
            currentEducationInstitution: getFieldValue('currentEducationInstitution') || '',
            institutionAddress: getFieldValue('institutionAddress') || '',
            major: getFieldValue('major') || '',

            // File Bukti (References)
            graduationProof: manGradAsset, // Wajib
            formalProfilePhoto: photoAsset ? { _type: 'image', asset: photoAsset.asset } : undefined, // Gambar butuh format khusus
            uniGraduationProof: uniGradAsset,
            
            status: 'pending',
            adminNotes: 'Menunggu peninjauan bukti SKL.',
        };

        // 5. Simpan dokumen di Sanity
        await client.create(doc);

        return res.status(200).json({ success: true, message: 'Pengajuan berhasil.' });

    } catch (error) {
        console.error('Sanity Write Error:', error);
        return res.status(500).json({ success: false, message: `Kesalahan Server: ${error.message}. Pastikan Sanity Write Token valid.` });
    }
}
