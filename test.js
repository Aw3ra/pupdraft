import http from 'http';


let path = '/chat/thread_L2ecZPtUsOFaz3Hf46OTR7tk';
// let path = '/add/cyfrin';

const postData = JSON.stringify({
    message: 'who are you?'
})

const options = {
    hostname: 'localhost',
    port: 3000,
    path: path,
    method: 'POST',
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