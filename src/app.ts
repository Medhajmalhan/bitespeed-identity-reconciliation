import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import { processIdentity } from './services/identity.service'; // Update path if needed

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // ← serve HTML from here

app.post('/identify', async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;
    const result = await processIdentity(email, phoneNumber);
    res.json({ contact: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});
