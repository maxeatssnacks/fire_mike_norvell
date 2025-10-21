// Vercel serverless function for persistent counter
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    const filePath = path.join(process.cwd(), 'data', 'counter.json');

    try {
        if (req.method === 'GET') {
            // Read current count
            let count = 0;
            try {
                const data = fs.readFileSync(filePath, 'utf8');
                count = JSON.parse(data).count;
            } catch (error) {
                // File doesn't exist, start with 0
            }

            res.status(200).json({ count });
        } else if (req.method === 'POST') {
            // Increment count
            let count = 0;
            try {
                const data = fs.readFileSync(filePath, 'utf8');
                count = JSON.parse(data).count;
            } catch (error) {
                // File doesn't exist, start with 0
            }

            count++;

            // Ensure data directory exists
            const dataDir = path.dirname(filePath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            // Write updated count
            fs.writeFileSync(filePath, JSON.stringify({ count }));

            res.status(200).json({ count });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update counter' });
    }
}
