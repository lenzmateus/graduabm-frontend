module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers['x-admin-token'];
  if (!token || token !== process.env.ADMIN_SENHA_HASH) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { path, method = 'GET', body, prefer } = req.body || {};

  if (!path || typeof path !== 'string' || !path.startsWith('/rest/v1/')) {
    return res.status(400).json({ error: 'Invalid path' });
  }

  const supaUrl = process.env.SUPA_URL;
  const supaKey = process.env.SUPA_SERVICE_KEY;

  if (!supaUrl || !supaKey) {
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  const headers = {
    'apikey': supaKey,
    'Authorization': `Bearer ${supaKey}`,
    'Content-Type': 'application/json',
    'Prefer': prefer || 'return=representation',
  };

  try {
    const fetchRes = await fetch(`${supaUrl}${path}`, {
      method: method.toUpperCase(),
      headers,
      body: (method.toUpperCase() !== 'GET' && body !== undefined) ? JSON.stringify(body) : undefined,
    });

    const text = await fetchRes.text();
    const contentRange = fetchRes.headers.get('Content-Range');
    if (contentRange) res.setHeader('Content-Range', contentRange);

    res.setHeader('Content-Type', 'application/json');
    return res.status(fetchRes.status).send(text || '[]');
  } catch (err) {
    return res.status(500).json({ error: 'Proxy error', detail: err.message });
  }
};
