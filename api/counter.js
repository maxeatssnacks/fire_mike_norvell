// Free CountAPI counter - no charges, truly persistent
export default async function handler(req, res) {
    try {
        if (req.method === 'GET') {
            // Get current count from CountAPI
            const response = await fetch('https://api.countapi.xyz/get/fire-mike-norvell/visits');
            const data = await response.json();
            res.status(200).json({ count: data.value || 0 });

        } else if (req.method === 'POST') {
            // Increment count using CountAPI
            const response = await fetch('https://api.countapi.xyz/hit/fire-mike-norvell/visits');
            const data = await response.json();
            res.status(200).json({ count: data.value || 0 });

        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('CountAPI error:', error);
        res.status(500).json({
            error: 'Failed to update counter',
            details: error.message
        });
    }
}
