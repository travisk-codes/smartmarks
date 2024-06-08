const cors = require('cors')
const mysql = require('mysql')
const express = require('express')
const body_parser = require('body-parser')

const { mysql_secrets } = require('./secrets')

const server = express()
const router = express.Router()
const db = mysql.createConnection(mysql_secrets)

server.use(cors())
server.use(body_parser.json())
server.use('/api', router)

router.get('/bookmarks', (req, res) => {
	const { user_id } = req.query
	const query = `
		select * from bookmarks where user = ?;
		select * from tags where user = ?;
	`
	db.query(query, [user_id, user_id], (err, results) => {
		if (err) return res.status(500).send(err)
		return res.send(results)
	})
})

router.get('/bookmarks/:uid', (req, res) => {
	const { uid } = req.params
	const query = `
		select * from bookmarks where uid = ?;
		select * from tags where uid = ?;
	`
	db.query(query, [uid, uid], (err, result) => {
		if (err) return res.status(500).send(err)
		return res.send(result)
	})
})

router.get('/tags', (req, res) => {
	const { user_id } = req.query
	let query = 'select distinct tag from tags where user = ?'
	db.query(query, [user_id], (err, result) => {
		if (err) return res.status(500).send(err)
		return res.send(result)
	})
})

router.post('/bookmarks', (req, res) => {
	let { uid, user, title, url, tags } = req.body
	let query = `
		insert into bookmarks (uid, user, title, url) values (?, ?, ?, ?);
	`
	if (tags.length) {
		query += 'insert into tags (uid, user, tag) values'
		tags.forEach(tag => (query += `("${uid}", "${user}", "${tag}"),`))
		query = query.replace(/.$/, ';')
	}
	db.query(query, [uid, user, title, url], (err, results) => {
		if (err) return res.status(500).send(err)
		return res.send(results)
	})
})

router.put('/bookmarks/:uid', (req, res) => {
	let { url, tags, title, user } = req.body
	let { uid } = req.params
	let query = `
		update bookmarks set title = ?, url = ? where uid = ?;
		delete from tags where uid = ?;
	`
	if (tags.length) {
		query += 'insert into tags (uid, user, tag) values'
		tags.forEach(tag => (query += `("${uid}", "${user}", "${tag}"),`))
		query = query.replace(/.$/, ';')
	}
	db.query(query, [title, url, uid, uid], (err, result) => {
		if (err) return res.status(500).send(err)
		return res.send(result)
	})
})

router.delete('/bookmarks/:uid', (req, res) => {
	const { uid } = req.params
	const sql = `
		delete from bookmarks where uid = ?; 
		delete from tags where uid = ?;
	`
	db.query(sql, [uid, uid], (err, result) => {
		if (err) return res.status(500).send(err)
		return res.send(result)
	})
})

server.listen(7779)
