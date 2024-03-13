import OpenAI from "openai";

let client = new OpenAI({apiKey: process.env.OPENAI_API_KEY});


// Function that gets a list of vectors from a single content string
// Input: content: string
// Output: array of vectors
export async function create_vectors(content) {
    try {
        const embedding = await client.embeddings.create({
            model: "text-embedding-3-small",
            inputs: content,
            encoding_format: "float"
        })
        return embedding.data[0].embedding;
    } catch (err) {
        console.error(err);
        return { success: false, error: err.message };
    }
}