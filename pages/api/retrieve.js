export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { prompt } = req.body;
            console.log(prompt);

            const response = await fetch('http://localhost:5000/retrieve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });
            console.log(data)

            res.status(200).json({ message: data });
        } catch (error) {
            res.status(500).json({ error: 'Error in retrieve endpoint' });
        }
    } else if (req.method === 'GET') {
        res.status(200).json({ message: "GET endpoint working" })
    } else {
        res.status(405).json({ error: 'Method not allowed' })
    }
}