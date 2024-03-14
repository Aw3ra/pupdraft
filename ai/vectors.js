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
        const questions = await client.chat.completions.create({
            model: "gpt-4-0125-preview",
            messages: [
                {
                    role: "system",
                    content: `Carefully examine the provided text. Your task is to identify the main purpose, features, and potential use cases presented in the text. Then, create a series of 5-10 search-oriented questions that a user might ask when looking for an answer that offers the solutions or benefits described in the text. These questions should be framed in such a way that they lead the user to this particular text as the answer to their queries. Ensure the questions are general in nature and are not specific to the tool or company mentioned in the text.
                    Provide some short, and some medium sized questions.
                    Only provide the search oriented questions, but still use the thought process to generate the questions.
                    Respond with only the questions in this form:
                    || Question.
                    || Question.
                    
                    Remember to base the questions on the information within the text and make them general enough so that they reflect the search intent of a user who is unaware of this particular text.
                    If there is not enough information, respond with: "No information"`
                },
                {
                    role: "user",
                    content: content
                }
            ],
        })
        let list = questions.choices[0].message.content;
        let questions_list = list.split("||");
        questions_list.shift();
        return questions_list;
    } catch (err) {
        return err.message;
    }
}