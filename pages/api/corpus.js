import axios from "axios"; // Import axios

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const { corpusKey, description } = req.body;

  // Basic validation
  if (!corpusKey) {
    return res.status(400).json({ message: "Corpus key is required" });
  }

  try {
    // Check if the corpus already exists
    const listResponse = await axios.get("https://api.vectara.io/v2/corpora", {
      headers: {
        "x-api-key": process.env.VECTARA_PERSONAL_API_KEY,
        "Content-Type": "application/json",
      },
    });

    const existingCorpus = listResponse.data.corpora.find(
      (corpus) => corpus.key === corpusKey
    );

    if (existingCorpus) {
      return res.status(200).json({
        message: "Corpus already exists.",
        corpusKey,
      });
    }

    // Define the payload
    const data = {
      key: corpusKey,
      description: description || "Documents with important information for my prompt.",
      queries_are_answers: false,
      documents_are_questions: false,
      encoder_name: "boomerang-2023-q3",
    };

    // Configure the request
    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://api.vectara.io/v2/corpora", // Vectara's API URL
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-api-key": process.env.VECTARA_PERSONAL_API_KEY, // Secure your API key using environment variables
      },
      data: data,
    };

    // Create the corpus
    const createResponse = await axios(config);

    res.status(201).json({
      message: "Corpus created successfully.",
      data: createResponse.data,
    });
  } catch (error) {
    console.error("Error creating corpus:", error);

    // Handle specific errors
    if (error.response) {
      return res
        .status(error.response.status)
        .json({ message: error.response.data.message || "API Error", error: error.response.data });
    }

    res.status(500).json({ message: "Unexpected error occurred", error: error.message });
  }
}
