const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = 'EAAUkIzhDP1oBPEfJ9Kczhc0jhw92XNNlvOWHRbZC0sbvJKiTF6yWWHssu5ZAJn89vRZArh1gDuBJA2SwsioXZCmlLNITrM9dnUFJvcEAXenpUeXywRHCZB1lNQjxxYcngqNDByJvWzh2vYuOaWZCxjw9SZAnxfwvw8psxymljqMiPZBDQvPgepZCc3cyYzZCaD7CkbouHG7QemWkGWUmKBPdGV0ZBAqCvZCZBMwC8XpRnuAZDZD';

// ✅ Tambahan untuk lewati ngrok warning
app.use((req, res, next) => {
  res.setHeader("ngrok-skip-browser-warning", "true");
  next();
});

// 🌐 Tambahan: Root endpoint
app.get('/', (req, res) => {
  res.send('🚀 Server Webhook aktif. Kamu bisa lanjut setup Meta Webhook.');
});

// Handler untuk verifikasi webhook dari Meta
app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = "cacascsacasvassvdv34534gtrt"; // Ubah token ini sesuai keinginan kamu

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook terverifikasi oleh Meta');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Verifikasi gagal. Token tidak cocok.');
    res.sendStatus(403);
  }
});

app.post('/webhook', (req, res) => {
  res.sendStatus(200); // ✅ Langsung beri respons agar Facebook puas

  const body = req.body;

  if (body.entry) {
    for (let entry of body.entry) {
      for (let change of entry.changes) {
        if (change.field === 'comments') {
          const comment = change.value;
          const igUserId = comment.from.id;
          const mediaId = comment.media.id;
          const text = comment.text;

          console.log(`Comment dari user ${igUserId} pada media ${mediaId}: "${text}"`);

          if (text.toLowerCase().includes('saya mau')) {
            console.log(`Trigger DM karena mengandung "saya mau"`);

            // Jalankan DM di background
            sendDM(igUserId, "Hai! Ini info lengkapnya ya 😄 👉 https://linkkamu.com")
              .then(() => console.log('DM sent!'))
              .catch(err => console.error('Failed to send DM:', err));
          }
        }
      }
    }
  } else {
    console.log('Tidak ada entry dalam body request');
  }
});

async function sendDM(userId, message) {
  try {
    console.log(`Mengirim DM ke userId: ${userId} dengan pesan: "${message}"`);

    await axios.post(
      `https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        messaging_type: 'RESPONSE',
        recipient: { id: userId },
        message: { text: message }
      }
    );

    console.log('✅ DM berhasil dikirim ke user: ' + userId);
  } catch (err) {
    console.error('❌ Gagal kirim DM:', err.response?.data || err.message);
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server berjalan di port ${PORT}`));
