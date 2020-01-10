const express = require('express')
const body_parser = require('body-parser')
const mysql = require('mysql')
const cors = require('cors')
const server = express()
const { mysql_secrets } = require('./secrets')

const db = mysql.createConnection(mysql_secrets)

server.use(cors())
server.use(body_parser.json())
server.get('/', (req, res) => {
	let user_query = 'select * from `bookmarks` where user = "' + req.query.user_id + '"'
	db.query(user_query, (err, result) => {
		if (err) {
			console.log(err)
			return res.status(500).send(err)
		}
		if (!result.length) {
			return res.send('{"msg":"This user has no bookmarks"}')
		}
		console.log(result)
		return res.send(result)
	})
})
server.post('/', (req, res) => {
	const bookmark = req.body.bookmark
	const username = req.body.username
	// mysql look up if user exists by map reducing users in bm list
	// send 404 if user not found?
	// otherwise send list of bookmarks
	// mysql by itering through bookmarks where user is username
	// map each one to a object, add to a list
	// respond with json string of list of objects

})

const port = 7779
server.listen(port)
console.log('listening on port ' + port)
