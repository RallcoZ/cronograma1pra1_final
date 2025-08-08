// api/uploadAttachment.js
import { formidable } from 'formidable';
import fs from 'fs';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    const CLICKUP_API_TOKEN = process.env.CLICKUP_API_TOKEN;
    if (!CLICKUP_API_TOKEN) {
        return res.status(500).json({ err: 'Token da API do ClickUp não configurado no servidor.' });
    }

    try {
        const form = formidable({});
        const [fields, files] = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                resolve([fields, files]);
            });
        });

        const taskId = fields.taskId?.[0];
        const attachment = files.attachment?.[0];

        if (!taskId || !attachment) {
            return res.status(400).json({ err: 'É necessário o ID da tarefa e o arquivo de anexo.' });
        }
        
        const fileContent = fs.readFileSync(attachment.filepath);
        const formData = new FormData();
        const fileBlob = new Blob([fileContent], { type: attachment.mimetype });
        formData.append('attachment', fileBlob, attachment.originalFilename);
        
        const url = `https://api.clickup.com/api/v2/task/${taskId}/attachment`;
        
        const clickupResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': CLICKUP_API_TOKEN },
            body: formData,
        });

        const responseText = await clickupResponse.text();

        if (!clickupResponse.ok) {
            try {
                const errorJson = JSON.parse(responseText);
                return res.status(clickupResponse.status).json(errorJson);
            } catch (e) {
                return res.status(clickupResponse.status).json({ err: "Erro não-JSON recebido do ClickUp", details: responseText });
            }
        }
        
        const responseJson = JSON.parse(responseText);
        res.status(200).json(responseJson);

    } catch (error) {
        console.error("[/api/uploadAttachment] ERRO CRÍTICO:", error);
        res.status(500).json({ err: 'A função do servidor falhou.', details: error.message });
    }
}