import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import { processIdentity } from './services/identity.service'; // Update path if needed

const app = express();
const port = process.env.PORT || 3000;


app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // ← serve HTML from here
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

console.log("Initializing server...");
console.log("Static path:", path.join(__dirname, 'public'));
console.log("PORT:", port);


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

app.listen(port, () => {
  console.log(` Server running at http://localhost:${port}`);
});
