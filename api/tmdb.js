export default async function handler(req, res) {
  // Set open CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { endpoint, ...queryParams } = req.query;
  if (!endpoint) {
    return res.status(400).json({ error: 'Missing endpoint parameter' });
  }

  const API_KEY = "2dca580c2a14b55200e784d157207b4d";
  const BASE = "https://api.themoviedb.org/3";
  
  // Format URL
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = new URL(`${BASE}${cleanEndpoint}`);
  url.searchParams.set('api_key', API_KEY);
  url.searchParams.set('language', 'en-US');
  
  for (const [key, value] of Object.entries(queryParams)) {
    if (key !== 'endpoint' && value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }

  try {
    const tmdbRes = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!tmdbRes.ok) {
      return res.status(tmdbRes.status).json({ error: `TMDB error ${tmdbRes.status}` });
    }

    const data = await tmdbRes.json();
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=86400');
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to fetch from TMDB' });
  }
}
