// Persistent global counter backed by Upstash Redis through its REST API.
// Configure in Vercel -> Project -> Settings -> Environment Variables:
//   UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
// The Vercel Marketplace Upstash integration sets these automatically
// (KV_REST_API_URL / KV_REST_API_TOKEN from the older KV integration also work).
const KEY = 'fire-mike-norvell:views';

export default async function handler(req, res) {
    const baseUrl = (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '').replace(/\/$/, '');
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

    // Never let the CDN cache the count
    res.setHeader('Cache-Control', 'no-store');

    if (!baseUrl || !token) {
        console.error('Upstash Redis env vars are not set');
        return res.status(500).json({ error: 'Counter is not configured' });
    }

    // GET reads the count, POST increments it (INCR creates the key at 0 if missing)
    const command = req.method === 'GET' ? 'get' : req.method === 'POST' ? 'incr' : null;
    if (!command) {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const response = await fetch(`${baseUrl}/${command}/${KEY}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok || data.error) {
            throw new Error(data.error || `Upstash responded with ${response.status}`);
        }
        res.status(200).json({ count: Number(data.result) || 0 });
    } catch (error) {
        console.error('Upstash Redis error:', error);
        res.status(500).json({
            error: 'Failed to update counter',
            details: error.message
        });
    }
}
