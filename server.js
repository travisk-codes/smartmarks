const express = require('express')
const body_parser = require('body-parser')
const mysql = require('mysql')
const cors = require('cors')
const { mysql_secrets } = require('./secrets')

const server = express()
const router = express.Router()
const db = mysql.createConnection(mysql_secrets)

server.use(cors())
server.use(body_parser.json())
server.use('/smartmarks', router)

router.get('/bookmarks', (req, res) => {
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
router.get('/bookmarks/:uid', (req, res) => {
	let bookmark_query =
		'select * from `bookmarks` where uid = "'
		+ req.params.uid + '"'
	db.query(bookmark_query, (err, result) => {
		if (err) {
			console.log(err)
			return res.status(500).send(err)
		}
		return res.send(result)
	})
})

router.post('/bookmarks', (req, res) => {
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

router.put('/bookmarks/:uid', (req, res) => {
	let query =
		'update `bookmarks` set `title` = "' 
		+ req.body.title + '", '
		+ '`url` = "' + req.body.url + '" '
		+ 'where `uid` = "'
		+ req.params.uid + '"'
	db.query(query, (err, result) => {
		if (err) {
			return res.status(500).send(err)
		}
		return res.send(result)
	})
})

router.delete('/bookmarks/:uid', (req, res) => {
	let query = 
		'delete from `bookmarks` where `uid` = "'
		+ req.params.uid + '"'
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
