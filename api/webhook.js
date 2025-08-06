// api/webhook.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Apenas responda a requisições POST do ClickUp
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Pega as variáveis de ambiente seguras
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or Key not configured.');
    return res.status(500).json({ message: 'Server configuration error.' });
  }

  // Inicializa o cliente Supabase com a chave de administrador
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const payload = req.body;
    console.log('Webhook received from ClickUp:', payload.event);

    // Cria um canal para transmitir a mensagem
    const channel = supabase.channel('task-updates');

    // Envia o evento e os dados da tarefa para todos os clientes conectados
    await channel.send({
      type: 'broadcast',
      event: payload.event, // ex: 'taskUpdated'
      payload: {
        task_id: payload.task_id,
      },
    });

    // Responde ao ClickUp que recebemos o webhook com sucesso
    res.status(200).json({ message: 'Webhook received' });

  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ message: 'Error processing webhook.' });
  }
}