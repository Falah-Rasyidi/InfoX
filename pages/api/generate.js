import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { query, corpusKey } = req.body;

    let data = JSON.stringify({
      "query": query,
      "search": {
        "corpora": [
          {
            "corpus_key": corpusKey
          }
        ]
      },
      "generation": {
        "generation_preset_name": "vectara-experimental-summary-ext-2023-12-11-med",
        "max_used_search_results": 3,
        "max_response_characters": 2048,
        "model_parameters": {
          "max_tokens": 2048
        },
        "citations": {
          "style": "none"
        },
        "enable_factual_consistency_score": false
      }
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://api.vectara.io/v2/chats',
      headers: { 
        'Content-Type': 'application/json', 
        'Accept': 'application/json', 
        'x-api-key': process.env.VECTARA_PERSONAL_API_KEY
      },
      data : data
    };

    try {
      const response = await axios(config);
      res.status(200).json(response.data);
    } catch (error) {
      res.status(500).send(error);
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}