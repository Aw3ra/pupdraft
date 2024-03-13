import express, { json } from 'express'
import { create_chat, create_assistant, send_message } from './ai/chat.js'
import { get_course } from './data_collection/github.js'
import { conversion } from './ai/pinecone_db.js'
import fs from 'fs'
let app = express()
let port = 3000


app.use(express.json());
app.get('/', (req, res) => {
    res.send(`Welcome to PupDraft! Here are the endpoints: \n
                /chat,\n
                /chat/:id,\n
                /assistant`
            )
    }
)

app.post('/chat', async (req, res) => {
    let apikey = req.headers['apikey']; 
    if (apikey !== '1234') {
        res.status(401).send('Invalid API key');
        return;
    }
    let thread = await create_chat();
    res.send(thread);
});

app.get('/add/:link', async (req, res) => {
    let link = req.params.link;
    let response = await get_course(link);
    let new_data = conversion(response);
    let new_data_string = JSON.stringify(new_data, null, 4);
    fs.writeFile('data.json', new_data_string, (err) => {
        if (err) {
            console.error(err);
            return;
        }
    });
    res.send(new_data);
});

app.post('/chat/:id', async (req, res) => {
    let apikey = req.headers['apikey'];
    if (apikey !== '1234') {
        res.status(401).send('Invalid API key');
        return;
    }
    let chat = req.params.id;
    let thread = await send_message(chat, req.body.message);
    res.send(thread);
});

app.get('/assistant', async (req, res) => {
    let apikey = req.headers['apikey'];
    if (apikey !== '1234') {
        res.status(401).send('Invalid API key');
        return;
    }
    let assistant = await create_assistant();
    res.send(assistant);
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
    }
)

