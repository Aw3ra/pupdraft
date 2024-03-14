import OpenAI from "openai";

let client = new OpenAI({apiKey: process.env.OPENAI_API_KEY});


// Function that gets a list of vectors from a single content string
// Input: content - string
// Output: array of vectors
export async function create_vectors(content) {
    try {
        const embedding = await client.embeddings.create({
            model: "text-embedding-3-small",
            input: content,
            encoding_format: "float"
        })
        return embedding.data[0].embedding;
    } catch (err) {
        return err.message;
    }
}

// Function to get 5-10 questions from openai based on the content of a module
// Input: content - string
// Output: array of questions
// TODO: Need to get this working, should just be a case of setting up an assistant to do this and then calling it. Prompt should ask it to generate 5-10 thoughtful questions that a user could ask if the content was the answer. Similar to jeopardy style questions
export async function get_questions(content) {
    try {
        const questions = await client.completions.create({
            model: "text-davinci-003",
            prompt: content,
            max_tokens: 100,
            n: 5
        })
        return questions.data.choices;
    } catch (err) {
        return err.message;
    }
}