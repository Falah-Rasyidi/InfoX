export default async function handler(req, res) {
    const isDocker = process.env.IS_DOCKER === 'true'; // Check if running in Docker
    const apiUrl = isDocker ? 'http://backend:5000/retrieve' : 'http://localhost:5000/retrieve';

    if (req.method === 'POST') {
        try {
            const { prompt } = req.body;
            console.log("[retrieve.js] News Article Retrieval Prompt For: ", prompt);

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            const data = await response.json();

            res.status(200).json({ message: data });
        } catch (error) {
            console.error("[retrieve.js] Error: ", error);
            res.status(500).json({ error: 'Error in retrieve endpoint' });
        }
    } else if (req.method === 'GET') {
        res.status(200).json({ message: "GET endpoint working" });
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
