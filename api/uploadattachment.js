// api/uploadAttachment.js
import { parseForm } from './_lib/formidable.js';
import fs from 'fs';

// Desabilita o body parser padrão da Vercel para este endpoint
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const CLICKUP_API_TOKEN = process.env.CLICKUP_API_TOKEN;
    if (!CLICKUP_API_TOKEN) {
        return res.status(500).json({ error: 'ClickUp API token not configured on server.' });
    }

    try {
        const { fields, files } = await parseForm(req);
        const taskId = fields.taskId;
        const attachment = files.attachment[0];

        if (!taskId || !attachment) {
            return res.status(400).json({ error: 'taskId and attachment file are required.' });
        }

        const url = `https://api.clickup.com/api/v2/task/${taskId}/attachment`;
        
        const formData = new FormData();
        // Converte o arquivo recebido para um Blob para reenviar
        const fileBlob = new Blob([fs.readFileSync(attachment.filepath)], { type: attachment.mimetype });
        formData.append('attachment', fileBlob, attachment.originalFilename);

        const options = {
            method: 'POST',
            headers: {
                'Authorization': CLICKUP_API_TOKEN,
            },
            body: formData,
        };

        const clickupResponse = await fetch(url, options);
        const data = await clickupResponse.json();

        if (!clickupResponse.ok) {
            return res.status(clickupResponse.status).json(data);
        }
        res.status(200).json(data);

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload file.', details: error.message });
    }
}