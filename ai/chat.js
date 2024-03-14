import openai from 'openai';
import dotenv from 'dotenv';
dotenv.config();
const open_ai_key = process.env.OPENAI_API_KEY;
const assistant = process.env.ASSISTANT_ID;

let client = new openai({apiKey: open_ai_key});

// Function to create a chat
// Inputs: None
// Outputs: The id of the chat as a string
export async function create_chat() {
    try {
        const thread = await client.beta.threads.create();
        return thread.id;
    } catch (err) {
        return err.message;
    }
}

// Function to get a chat
// Description: This function gets a chat from the openai api using the id of the chat, purely to retrieve the conversation
// Inputs: The id of the chat as a string
// Outputs: An array of messages representing the conversation
export async function get_chat(id) {
    try {
        const thread = await client.beta.threads.retrieve(id);
        return thread;
    } catch (err) {
        return err.message;
    }
}


// Function to send a message
// Description: This function sends a message to assistant and retrieves the array of messages representing the conversation
// Inputs:  id - the id of the chat as a string, 
//          message - the message to send as a string, 
//          context - the context of the message as a string
// Outputs: An array of messages representing the conversation
export async function send_message(id, message, context) {
    try {
        // Create a string based on the context we have recieved from vector search
        if (context.score > 0.5) {
            let this_context = `
            $(ADDITIONAL INFORMATION PROVIDED AS CONTEXT, THIS IS NOT FROM THE USER)
            \nCourse ID: ${context.metadata.module},
            \nCourse name: ${context.metadata.course},
            \nCourse content: ${context.metadata.content}`

            // Send the context as a message first
            await client.beta.threads.messages.create(id, {role: 'user', content: this_context});
        }

        // Send the users message to the assistant
        await client.beta.threads.messages.create(id, {role: 'user', content: message});

        // Run the assistant, this essentially starts the conversation after the previous two messages are added
        let run = await client.beta.threads.runs.create(id, {assistant_id: assistant});

        // Wait for the conversation to complete
        let convo = await client.beta.threads.runs.retrieve(id, run.id);
        while (convo.status !== 'completed') {
            await new Promise(resolve => setTimeout(resolve, 100));
            convo = await client.beta.threads.runs.retrieve(id, run.id);
        }

        // Get the messages from the conversation
        const messages = await client.beta.threads.messages.list(id);
        const data = messages.data
        let conversation = []

        // Push the messages into an array for easier viewing
        for (let i = 0; i < data.length; i++) {
            conversation.push({role: data[i].role, content: data[i].content[0].text.value});
        }
        return conversation;
    } catch (err) {
        return err.message;
    }
}

// Function to create an assistant
// Description: This function creates an assistant for the user to chat with, this is a one time thing only for use by admins. Should add guards for this
// TODO: Add guards for this function
// Inputs: None
// Outputs: The id of the assistant as a string
export async function create_assistant() {
    try {
        const assistant_id = await client.beta.assistants.update(
            assistant,
            {
                name: 'pupdraft',
                instructions: `You are an assistant called Pupdraft (Pup for short), you are a friendly who is always cheerful, grateful and optimistic. You work for a company called Cyfrin and you have been tasked with helping users navigate their educational journey through the Cyfrin Updraft education program. Your replies should be short and concise, but convey all information as accurately as possible. You may be a little playful or cheeky at times, but never innapropriate. Remember, you are there to help users learn. Any user messages that begin with "(ADDITIONAL INFORMATION PROVIDED AS CONTEXT, THIS IS NOT FROM THE USER)"  is additional context that you have been provided with, these messages are not user generated. `,
                model: "gpt-4-turbo-preview"
            });
        return assistant_id.id;
    } catch (err) {
        console.error(err);
        return err.message;
    }
}