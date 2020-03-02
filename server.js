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
	let user_query =
		'select * from `bookmarks` where `user` = "' + req.query.user_id + '"'
	let tag_query =
		'select * from `tags` where user = "' + req.query.user_id + '"'
	db.query(user_query + '; ' + tag_query, (err, results) => {
		if (err) {
			console.log(err)
			return res.status(500).send(err)
		}
		return res.send(results)
	})
})
router.get('/bookmarks/:uid', (req, res) => {
	let bookmark_query =
		'select * from `bookmarks` where uid = "' + req.params.uid + '"'
	let tag_query = 'select * from `tags` where `uid` = "' + req.params.uid + '"'
	db.query(bookmark_query + ';' + tag_query, (err, result) => {
		if (err) {
			console.log(err)
			return res.status(500).send(err)
		}
		return res.send(result)
	})
})
router.get('/tags', (req, res) => {
	let query = 'select distinct `tag` from `tags`'
	db.query(query, (err, result) => {
		if (err) {
			console.log(err)
			return res.status(500).send(err)
		}
		console.log(result)
		return res.send(result)
	})
})

function tagsDbEntriesToString(a, b, c) {
	return `("${a}", "${b}", "${c}")`
}

router.post('/bookmarks', (req, res) => {
	let { uid, user, title, url, tags } = req.body

	/* 	let sql = [
		'insert into bookmarks SET',
		' uid=?',
		',user=?',
		',title=?',
		',url=?',
		';',
	]
	if (tags) {
		sql.concat(tags.map(tag => (
			[
				'insert into tags SET',
				' uid=?',
			]
		)))
	}
 */
	let bookmark_query =
		'insert into `bookmarks` (uid, user, title, url) values ("' +
		uid +
		'", "' +
		user +
		'", "' +
		title +
		'", "' +
		url +
		'")'
	let tag_query
	if (tags.length) {
		tag_query = 'insert into `tags` (uid, user, tag) values '
		tags.forEach(t => {
			tag_query += tagsDbEntriesToString(uid, user, t) + ','
		})
		tag_query = tag_query.replace(/.$/, ';')
		bookmark_query += ';' + tag_query
	}

	db.query(bookmark_query, (err, results) => {
		if (err) {
			console.log(err)
			return res.status(500).send(err)
		}
		return res.send(results)
	})
})

router.put('/bookmarks/:uid', (req, res) => {
	let { url, tags, title, user } = req.body
	let { uid } = req.params
	let query = `update bookmarks set title="${title}", url="${url}" where uid="${uid}";`
	if (tags.length) {
		let removeTagsQuery = `delete from tags where uid="${uid}"`
		let addTagsQuery = `insert into tags (uid, user, tag) values`
		tags.forEach(tag => {
			addTagsQuery += `("${uid}", "${user}", "${tag}"),`
		})
		addTagsQuery = addTagsQuery.replace(/.$/, ';')
		query += removeTagsQuery + ';' + addTagsQuery
	}
	db.query(query, (err, result) => {
		if (err) {
			console.log(err)
			return res.status(500).send(err)
		}
		return res.send(result)
	})
})

router.delete('/bookmarks/:uid', (req, res) => {
	let { uid } = req.params
	let sql =
		'delete from bookmarks where uid = ?; delete from tags where uid = ?'
	let callback = (err, result) => {
		if (err) return res.status(500).send(err)
		return res.send(result)
	}
	db.query(sql, [uid, uid], callback)
})

const port = 7779
server.listen(port, () => {
	console.log('listening on port ' + port)
})
