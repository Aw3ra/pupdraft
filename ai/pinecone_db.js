import { Pinecone } from '@pinecone-database/pinecone';
import { create_vectors } from './vectors.js';
const pc = new Pinecone({
    apiKey: process.env.PINECONE_KEY,
});
const index = pc.index('pupdraft');


// Function to upsert vectors into the data base
// Input: vectors - list of vectors to be upserted in the format:
// [
//     {
//         "id": "1",
//         "vector": [1, 2, 3],
//         "metadata": {
//             "content": "The text content that has been vectorised"
//         }
//     }
// ]
export async function upsert_vectors(vectors) {
    try {
        let upserts = await index.upsert(vectors);
        return upserts;
    } catch (err) {
        return err.message;
    }
}

// Function to search for the nearest vectors to a given vector
// Input: vector - the vector to search for
//        k - the number of nearest vectors to return
// Output: A list of the k nearest vectors
export async function search_vector(vector, k) {
    try {
        const results = await index.query({
            vector: vector,
            k: k
        });
        return { success: true, results: results };
    } catch (err) {
        return err.message;
    }
}

// Function to convert a json object to a vectors in the right format for uploading
// Input: data - the json object to be converted
// Output: A list of vectors
export async function conversion(data) {
    let vectors = [];
    for (let name in data) {
        for (let module in data[name]) {
            let vector = {
                "id": module,
                "values": await create_vectors(data[name][module]),
                "metadata": {
                    "content": data[name][module]
                }
            }
            vectors.push(vector);
        }
    }
    return vectors;
}