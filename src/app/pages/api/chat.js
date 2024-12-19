export default async function handler(req, res) {
    if (req.method === 'POST') {
      try {
        const { prompt } = req.body;
        console.log(prompt);
  
        // Call the GPT-4All API (replace the URL with your actual endpoint)
        const response = await fetch('http://backend:5000/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
        });
        
        const data = await response.json();
  
        // Send the response back to the client
        res.status(200).json({ message: data });
      } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
      }
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  }