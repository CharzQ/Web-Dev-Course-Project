import express from 'express';
import cors from 'cors';


const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

let sessions = [];

app.get('/api/sessions', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(sessions, null, 2));
});

app.post('/api/sessions', (req, res) => {
  const newSession = {
    id: Date.now(),
    ...req.body
  };

  sessions.push(newSession);
  res.json(newSession);
});

app.delete('/api/sessions/:id', (req, res) => {
  const id = Number(req.params.id);
  sessions = sessions.filter(s => s.id !== id);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});