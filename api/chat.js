// api/chat.js
export default async function handler(req, res) {
  const allowed = (process.env.ALLOWED_ORIGINS || '')
    .split(',').map(s => s.trim()).filter(Boolean);
  const origin = req.headers.origin || '';
  const allowOrigin = allowed.length ? (allowed.includes(origin) ? origin : '') : '*';

  res.setHeader('Access-Control-Allow-Origin', allowOrigin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

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
    if (!r.ok) return res.status(r.status).json({ error: data?.error || data || 'Upstream error' });

    const reply = data?.choices?.[0]?.message?.content || '';
    res.status(200).json({ reply });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
}