import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs-extra';
import cron from 'node-cron';
import fetch from 'node-fetch';
import bodyParser from 'body-parser';

dotenv.config();
const app = express();
const PORT = 3000;

app.use(bodyParser.json());

const CLIENTES_PATH = './clientes.json';
const LOG_PATH = './log-envios.json';

const ZAPI_INSTANCE_ID = process.env.ZAPI_INSTANCE_ID;
const ZAPI_TOKEN = process.env.ZAPI_TOKEN;
const ZAPI_URL = `https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}/send-messages`;

// Função para envio imediato ou agendado
function enviarMensagem(cliente) {
  const payload = {
    phone: '55' + cliente.numero,
    message: cliente.mensagem
  };

  fetch(ZAPI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(data => {
      console.log('Mensagem enviada para:', cliente.nome);
      salvarLog(cliente, true);
    })
    .catch(err => {
      console.error('Erro ao enviar para', cliente.nome, err);
      salvarLog(cliente, false);
    });
}

// Log
function salvarLog(cliente, sucesso) {
  const logs = fs.readJSONSync(LOG_PATH);
  logs.push({
    nome: cliente.nome,
    numero: cliente.numero,
    mensagem: cliente.mensagem,
    horario: new Date().toISOString(),
    sucesso
  });
  fs.writeJSONSync(LOG_PATH, logs, { spaces: 2 });
}

// Rota de envio manual
app.post('/api/send', (req, res) => {
  const { phone, message, schedule } = req.body;
  const cliente = {
    nome: 'Manual',
    numero: phone.replace(/^55/, ''),
    mensagem: message
  };

  if (schedule) {
    const date = new Date(schedule);
    const cronExp = `${date.getMinutes()} ${date.getHours()} ${date.getDate()} ${date.getMonth() + 1} *`;
    cron.schedule(cronExp, () => enviarMensagem(cliente), { timezone: 'America/Sao_Paulo' });
    return res.json({ agendado: schedule });
  }

  enviarMensagem(cliente);
  res.json({ status: 'enviado' });
});

// Importação de clientes em lote com agendamento
app.post('/api/import', async (req, res) => {
  const novosClientes = req.body; // array

  if (!Array.isArray(novosClientes)) {
    return res.status(400).json({ error: 'Esperado um array de clientes' });
  }

  const clientes = await fs.readJSON(CLIENTES_PATH);

  novosClientes.forEach(cliente => {
    clientes.push(cliente);

    if (cliente.agendamento) {
      const date = new Date(cliente.agendamento);
      const cronExp = `${date.getMinutes()} ${date.getHours()} ${date.getDate()} ${date.getMonth() + 1} *`;
      cron.schedule(cronExp, () => enviarMensagem(cliente), { timezone: 'America/Sao_Paulo' });
    } else {
      enviarMensagem(cliente);
    }
  });

  await fs.writeJSON(CLIENTES_PATH, clientes, { spaces: 2 });

  res.json({ total: novosClientes.length, status: 'importado com sucesso' });
});

// Webhook para respostas automáticas
app.post('/webhook', (req, res) => {
  const mensagem = req.body?.message?.body?.toLowerCase();
  const numero = req.body?.message?.from;

  if (mensagem && numero) {
    let resposta = null;

    if (mensagem.includes('sim')) {
      resposta = 'Ótimo! Em breve enviaremos mais informações.';
    } else if (mensagem.includes('quero')) {
      resposta = 'Legal! A equipe vai te chamar no privado.';
    } else if (mensagem.includes('info') || mensagem.includes('informações')) {
      resposta = 'Você pode acessar nossos serviços aqui: https://seusite.com';
    }

    if (resposta) {
      fetch(ZAPI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: numero, message: resposta })
      });
    }
  }

  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});