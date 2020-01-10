const express = require('express')
const body_parser = require('body-parser')
const mysql = require('mysql')
const server = express()

app.use(body_parser.json())
app.get('/bookmarks', (req, res) => {
	return res.status(200).send(`hello from server! you wrote ${req.body}`)
})

app.listen(7779)