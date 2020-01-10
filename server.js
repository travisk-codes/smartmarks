const express = require('express')
const body_parser = require('body-parser')
//const mysql = require('mysql')
const server = express()

server.use(body_parser.json())
server.get('/', (req, res) => {
	return res.send('hello from server!')
})

const port = 7779
server.listen(port)
console.log('listening on port ' + port)
