import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';


const app = express();
const PORT = 3000;
const AI = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
});

app.use(cors());
app.use(express.json());

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


//Using knowledge of the OpenAI API from personal learning.
app.post('/api/generateStudyPlan', async (req, res) => {
  try {
    const response = await AI.chat.completions.create({
      model: 'gpt-5.4-mini',
      max_completion_tokens: 3000,
      messages: [
        {
          role: 'developer', content: `You a master at making study guides for student to use for their study's 
          ensuring they have a good chance of passing. 
          It is of appropriate difficulty for the course. It is formmated properly with new lines and bullet points, 
          spaces for padding header no * or #.
          Do not tell them what else you can do, make, or offer for them regarding their study guide generation. Please` },
        { role: 'user', content: req.body.prompt }
      ]
    });
    res.json(response.choices[0].message.content);
  } catch (err) {
    console.error('Error generating study plan:', err);
  }
})

app.post('/api/refineStudyPlan', async (req, res) => {
  try {
    const response = await AI.chat.completions.create({
      model: 'gpt-5.4-mini',
      max_completion_tokens: 3000,
      messages: [
        {
          role: 'developer', content: `You a master at refining the study guides. You take the user's feedbakc and use
          the original study guide provided as context to make the changes. You reformat the provided study guide to 
          ensure the format is not borken. It is of appropriate difficulty for the course. It is formmated properly 
          with new lines and bullet points, spaces for padding header no * or #. Do not tell them what else you can do,
          make, or offer for them regarding their study guide generation. Please` },
        { role: 'user', content: "The original study guide: " + req.body.studyGuide },
        { role: 'user', content: "User's critique: " + req.body.prompt }
      ]
    });
    res.json(response.choices[0].message.content);
  } catch (err) {
    console.error('Error generating study plan:', err);
  }
})
app.delete('/api/sessions/:id', (req, res) => {
  const id = Number(req.params.id);
  sessions = sessions.filter(s => s.id !== id);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});