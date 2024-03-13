import http from 'http';


// let path = '/chat/thread_k2ETd51How8sctoeWKW76IC5';
let path = '/add/cyfrin';



const postData = JSON.stringify({
    message: 'New message'
})

const options = {
    hostname: 'localhost',
    port: 3000,
    path: path,
    method: 'GET',
    headers : {
        'Content-Type': 'application/json',
        'apikey': '1234',
        'Content-Length': Buffer.byteLength(postData)
    }
}

const req = http.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`)
    res.on('data', d => {
        process.stdout.write(d)
    })
}
)

req.on('error', error => {
    console.error(error)
})
// Do 1 request
req.write(postData)
req.end()