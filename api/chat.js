import fs from 'fs';
import path from 'path';

// Function to find relevant information from site-data.json
function getFallbackResponse(message, siteData) {
  const query = message.toLowerCase();
  let bestMatch = null;
  let highestScore = 0;

  // Search through intents
  for (const intentName in siteData.chatbot.intents) {
    const intent = siteData.chatbot.intents[intentName];
    for (const example of intent.examples) {
      const score = similarity(query, example.toLowerCase());
      if (score > highestScore) {
        highestScore = score;
        bestMatch = intent.templates[Math.floor(Math.random() * intent.templates.length)];
      }
    }
  }

  if (highestScore > 0.5) {
    // Replace placeholders in the template
    return bestMatch.replace(/{{(.*?)}}/g, (match, p1) => {
      const keys = p1.split('.');
      let value = siteData;
      for (const key of keys) {
        value = value[key];
      }
      return value;
    });
  }

  return siteData.chatbot.fallback.noAnswer;
}

// Simple string similarity function (Jaro-Winkler)
function similarity(s1, s2) {
  let m = 0;
  const range = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;
  const s1Matches = new Array(s1.length).fill(false);
  const s2Matches = new Array(s2.length).fill(false);

  for (let i = 0; i < s1.length; i++) {
    const start = Math.max(0, i - range);
    const end = Math.min(i + range + 1, s2.length);
    for (let j = start; j < end; j++) {
      if (!s2Matches[j] && s1[i] === s2[j]) {
        s1Matches[i] = true;
        s2Matches[j] = true;
        m++;
        break;
      }
    }
  }

  if (m === 0) return 0;

  let t = 0;
  let k = 0;
  for (let i = 0; i < s1.length; i++) {
    if (s1Matches[i]) {
      while (!s2Matches[k]) k++;
      if (s1[i] !== s2[k]) t++;
      k++;
    }
  }

  const jaro = (m / s1.length + m / s2.length + (m - t / 2) / m) / 3;
  let p = 0;
  const l = Math.min(4, Math.min(s1.length, s2.length));
  while (p < l && s1[p] === s2[p]) p++;

  return jaro + l * p * (1 - jaro);
}

export default async function handler(req, res) {
  const allowed = (process.env.ALLOWED_ORIGINS || '')
    .split(',').map(s => s.trim()).filter(Boolean);
  const origin = req.headers.origin || '';
  const allowOrigin = allowed.length ? (allowed.includes(origin) ? origin : '') : '*';

  res.setHeader('Access-Control-Allow-Origin', allowOrigin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: 'Server misconfiguration: GROQ_API_KEY is not set.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body || '{}'); } catch { body = {}; } }
    else if (!body) {
      const chunks = []; for await (const c of req) chunks.push(c);
      const raw = Buffer.concat(chunks).toString('utf8');
      try { body = JSON.parse(raw || '{}'); } catch { body = {}; }
    }
    const { messages } = body || {};
    if (!Array.isArray(messages)) return res.status(400).json({ error: 'messages array required' });

    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages,
        temperature: 0.2,
        max_tokens: 512,
        stream: false
      })
    });

    const data = await r.json();
    if (!r.ok) {
        throw new Error('Groq API call failed');
    }

    const reply = data?.choices?.[0]?.message?.content || '';
    res.status(200).json({ reply });
  } catch (e) {
    console.error(e);
    try {
        const siteDataPath = path.resolve(process.cwd(), 'assets', 'site-data.json');
        const siteData = JSON.parse(fs.readFileSync(siteDataPath, 'utf-8'));
        const messages = req.body.messages;
        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'messages array is missing or empty in the request body' });
        }
        const userMessage = messages.slice(-1)[0].content;
        const fallbackReply = getFallbackResponse(userMessage, siteData);
        res.status(200).json({ reply: fallbackReply });
    } catch (fallbackError) {
        console.error(fallbackError);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
  }
}
GROQ_API_KEY