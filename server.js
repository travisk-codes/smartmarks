const express = require('express')
const body_parser = require('body-parser')
const mysql = require('mysql')
const cors = require('cors')
const { mysql_secrets } = require('./secrets')

const server = express()
const db = mysql.createConnection(mysql_secrets)

server.use(cors())
server.use(body_parser.json())

server.get('/', (req, res) => {
	let user_query = 
		'select * from `bookmarks` where user = "'
		+ req.query.user_id + '"'
	db.query(user_query, (err, result) => {
		if (err) {
			console.log(err)
			return res.status(500).send(err)
		}
		return res.send(result)
	})
})

server.post('/', (req, res) => {
	let bookmark_query = 
		'insert into `bookmarks` (uid, user, title, url) values ("'
		+ req.body.uid + '", "'
		+ req.body.user + '", "'
		+ req.body.title + '", "'
		+ req.body.url + '")'
	db.query(bookmark_query, (err, result) => {
		if (err) {
			console.log(err)
			return res.status(500).send(err)
		}
		return res.send(result)
	})

})

server.put('/', (req, res) => {
	let query =
		'update `bookmarks` set `title` = "' 
		+ req.body.title + '", '
		+ '`url` = "' + req.body.url + '" '
		+ 'where `uid` = "'
		+ req.body.uid + '"'
	db.query(query, (err, result) => {
		if (err) {
			return res.status(500).send(err)
		}
		return res.send(result)
	})
})

server.delete('/', (req, res) => {
	let query = 
		'delete from `bookmarks` where `uid` = "'
		+ req.body.uid + '"'
	db.query(query, (err, result) => {
		if (err) {
			return res.status(500).send(err)
		}
		return res.send(result)
	})
})

const port = 7779
server.listen(port, () => {
	console.log('listening on port ' + port)
})
