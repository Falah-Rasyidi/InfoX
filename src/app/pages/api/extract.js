export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { prompt } = req.body;
            console.log(prompt);

            const response = await fetch('http://localhost:5000/extract', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            const data = await response.json();

            res.status(200).json({ message: data });
        } catch (error) {
            res.status(500).json({ error: 'Error in extract endpoint' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' })
    }
}