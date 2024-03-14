import express, { json } from 'express'
import { create_chat, create_assistant, send_message } from './ai/chat.js'
import { get_course } from './data_collection/github.js'
import { conversion, upsert_vectors, search_vector } from './ai/pinecone_db.js'
import { create_vectors } from './ai/vectors.js'
import fs from 'fs'
let app = express()
let port = 3000


app.use(express.json());

// Route for showing the endpoints
// TODO: Add more endpoints and descriptions
app.get('/', (req, res) => {
    res.send(`Welcome to PupDraft! Here are the endpoints: \n
                /chat,\n
                /chat/:id,\n
                /assistant`
            )
    }
)

// Route for creating a chat
app.post('/create-chat', async (req, res) => {
    // API key stuff
    let apikey = req.headers['apikey']; 
    if (apikey !== '1234') {
        res.status(401).send('Invalid API key');
        return;
    }
    // Create the chat, this is for users. creates more chats with the current assistant
    let thread = await create_chat();
    // Returns the chat id, as a string
    res.send(thread);
});

// Route for adding courses to the database
app.get('/add/:limit', async (req, res) => {
    // Limit is the amount of courses starting from 0 you want to add, later we can add offset to start from a certain course
    console.log("Adding courses to the database")
    let response = await get_course(req.params.limit);
    // Conver the data from json format to an array of documents for pinecone
    console.log("Converting data")
    let new_data = await conversion(response);
    // Convert this to a string literally just to write it to a file
    // console.log("Writing data to file")
    // let new_data_string = JSON.stringify(new_data, null, 4);
    // fs.writeFile('data_collection/data.json', new_data_string, (err) => {
    //     if (err) {
    //         console.error(err);
    //         return;
    //     }55555555555555
    // });
    // Upsert the data to the pinecone database
    console.log("Upserting data to pinecone")
    try{
        let vectors = await upsert_vectors(new_data);
        // Should return an amount of vectors that were added, this number will be different from the amount of courses as each will have sup modules
        res.send(vectors);
    } catch (err) {
        res.send(err);
    }
});

// Route for chatting with the assistant
app.post('/chat/:id', async (req, res) => {
    // API key stuff
    let apikey = req.headers['apikey'];
    if (apikey !== '1234') {
        res.status(401).send('Invalid API key');
        return;
    }
    // Get the chat id from the url, this is the conversation ID and should be saved locally so it's not a new conversation every time
    let chat = req.params.id;
    // Turn the message from the body into a vector for querying
    let query_vector = await create_vectors(req.body.message);
    // Search the pinecone database for the closest vectors to the message using cosine similarity
    let knn = await search_vector(query_vector, 5);
    // Send the message to the assistant, include both the message and the top result for additional context
    // Can change this later to only include a result above a certain accuracy and/or include multiple results when documents are smaller
    let thread = await send_message(chat, req.body.message, knn.results.matches[0]);
    // Return the conversation
    res.send(thread[0].content);
});

// Route for creating an assistant
app.get('/assistant', async (req, res) => {
    // API key stuff
    let apikey = req.headers['apikey'];
    if (apikey !== '1234') {
        res.status(401).send('Invalid API key');
        return;
    }
    // Create the assistant, this is for us only. Creates additional assistants the more it's called
    let assistant = await create_assistant();
    // Returns the assistant id, used for creating chats
    res.send(assistant);
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
    }
)

