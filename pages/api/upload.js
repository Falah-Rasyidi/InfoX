import axios from "axios"; // Import axios

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const { corpus_key } = req.query; // Extract corpus_key from query parameters
  const documentData = req.body; // Extract document data from request body

  // Basic validation
  if (!corpus_key) {
    return res.status(400).json({ message: "Corpus key is required" });
  }

  if (!documentData || typeof documentData !== 'object') {
    return res.status(400).json({ message: "Document data is required and should be an object" });
  }

  // Validate the document
  if (!documentData.id || !documentData.type || !documentData.document_parts || !Array.isArray(documentData.document_parts)) {
    return res.status(400).json({ message: "Document must have id, type, and document_parts (array)" });
  }

  for (const part of documentData.document_parts) {
    if (!part.text || !part.context) {
      return res.status(400).json({ message: "Each document part must have text and context" });
    }
  }

  try {
    // Define the payload
    const data = {
      id: documentData.id,
      type: documentData.type,
      document_parts: documentData.document_parts.map(part => ({
        text: part.text,
        context: part.context
      }))
    };

    // Configure the request
    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `https://api.vectara.io/v2/corpora/${corpus_key}/documents`, // Vectara's API URL
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-api-key": process.env.VECTARA_PERSONAL_API_KEY, // Secure your API key using environment variables
      },
      data: JSON.stringify(data),
    };

    // Make the API request to upload the document
    const response = await axios(config);

    res.status(201).json({
      message: "Document uploaded successfully.",
      data: response.data,
    });
  } catch (error) {
    console.error("Error uploading document:", error);

    // Handle specific errors
    if (error.response) {
      return res
        .status(error.response.status)
        .json({ message: error.response.data.message || "API Error", error: error.response.data });
    }

    res.status(500).json({ message: "Unexpected error occurred", error: error.message });
  }
}