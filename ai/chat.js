import openai from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const open_ai_key = process.env.OPENAI_API_KEY;
const assistant = process.env.ASSISTANT_ID;
let client = new openai({apiKey: open_ai_key});

export function return_key() {
    return open_ai_key;
}

export async function create_chat() {
    try {

        const thread = await client.beta.threads.create();
        return thread.id ;
    } catch (err) {
        return err.message;
    }
}

export async function get_chat(id) {
    try {
        const thread = await client.beta.threads.retrieve(id);
        return thread;
    } catch (err) {
        return err.message;
    }
}

export async function send_message(id, message) {
    try {
        await client.beta.threads.messages.create(id, {role: 'user', content: message});
        let run = await client.beta.threads.runs.create(id, {assistant_id: assistant});
        let convo = await client.beta.threads.runs.retrieve(id, run.id);
        while (convo.status !== 'completed') {
            await new Promise(resolve => setTimeout(resolve, 100));
            convo= await client.beta.threads.runs.retrieve(id, run.id);
        }
        const messages = await client.beta.threads.messages.list(id);
        const data = messages.data
        let conversation = []
        for (let i = 0; i < data.length; i++) {
            conversation.push({role: data[i].role, content: data[i].content[0].text.value});
        }
        return conversation;
    } catch (err) {
        return err.message;
    }
}

export async function create_assistant() {
    try {
        const assistant = await client.beta.assistants.create({
            name: 'pup',
            instructions: 'You are an assistant called pup',
            model: "gpt-4-turbo-preview"
        });
        return assistant.id;
    } catch (err) {
        console.error(err);
        return err.message;
    }
}