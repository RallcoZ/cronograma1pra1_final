// api/test.js
export default function handler(req, res) {
  // Este console.log TEM que aparecer nos logs da Vercel se a função for chamada.
  console.log("--- API de teste /api/test foi chamada com sucesso! ---");

  res.status(200).json({ message: "Olá do backend! A rota de API está funcionando.", success: true });
}