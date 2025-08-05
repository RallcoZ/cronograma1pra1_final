// api/_lib/formidable.js
import { formidable } from 'formidable';

export async function parseForm(req) {
    return new Promise((resolve, reject) => {
        const form = formidable({});
        form.parse(req, (err, fields, files) => {
            if (err) {
                return reject(err);
            }
            // Transforma os campos que são arrays em strings simples
            const singleFields = {};
            for (const key in fields) {
                if (Object.prototype.hasOwnProperty.call(fields, key)) {
                    singleFields[key] = Array.isArray(fields[key]) ? fields[key][0] : fields[key];
                }
            }
            resolve({ fields: singleFields, files });
        });
    });
}