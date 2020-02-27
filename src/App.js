import React, { useState } from 'react'
import Select from 'react-select/creatable'
import uuid from 'uuid/v4'

import Bookmark from './Bookmark'
import { cipher, decipher } from './cipher'
import './App.css'

let bookmarksRoute = 'https://travisk.info/api/bookmarks'
let tagsRoute = 'https://travisk.info/api/tags'

function formatTagsForSelect(tags) {
	if (!tags instanceof Array) return { label: tags, value: tags }
	return tags.map(t => ({ label: t, value: t }))
}

function attachTagstoBookmarks(bookmarks, tags) {
	bookmarks.forEach(bm => {
		bm.tags = []
		tags.forEach(tag => {
			if (bm.uid === tag.uid) {
				bm.tags.push(tag)
			}
		})
	})
	return bookmarks
}

function App() {
	let [bookmarks, setBookmarks] = useState([])
	let [user, setUser] = useState({
		name: '',
		password: '',
		loggedIn: false,
	})
	let [bookmarkForm, setBookmarkForm] = useState({
		id: '',
		title: '',
		url: '',
		tags: [],
		inputMode: 'add',
	})
	let [tagOptions, setTagOptions] = useState([
		{ label: 'test', value: 'test' },
		{ label: 'yay', value: 'yay' },
		{ label: 'bravo', value: 'bravo' },
	])

	async function getBookmarks() {
		let { name, password } = user
		let params = { user_id: cipher(password)(name) }
		let url = new URL(bookmarksRoute)
		Object.keys(params).forEach(key =>
			url.searchParams.append(key, params[key]),
		)
		try {
			let response = await fetch(url)
			let [untaggedBookmarks, tags] = await response.json()
			let bookmarks = attachTagstoBookmarks(untaggedBookmarks, tags)
			setBookmarks(bookmarks)
		} catch (e) {
			throw new Error(e)
		}
	}

	async function getTagOptions() {
		try {
			let response = await fetch(tagsRoute)
			let json = await response.json()
			let tags = json.map(({ tag }) => decipher(user.password)(tag))
			setTagOptions(formatTagsForSelect(tags))
		} catch (e) {
			throw new Error(e)
		}
	}

	async function getBookmark(uid) {
		let route = `${bookmarksRoute}/${uid}`
		try {
			let response = await fetch(route)
			let [untaggedBookmark, tags] = await response.json()
			let bookmark = attachTagstoBookmarks(untaggedBookmark, tags)
			setBookmarks(bookmarks.concat(bookmark))
		} catch (e) {
			throw new Error(e)
		}
	}

	async function addBookmark() {
		let uid = uuid()
		let { name, password } = user
		let { title, url, tags } = bookmarkForm
		let params = {
			uid,
			user: cipher(password)(name),
			title: cipher(password)(title),
			url: cipher(password)(url),
			tags: tags.map(t => cipher(password)(t.label)),
		}
		let endPoint = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(params),
		}
		try {
			await fetch(bookmarksRoute, endPoint)
			setBookmarkForm({ url: '', title: '', tags: [] })
			getBookmark(uid)
		} catch (e) {
			throw new Error(e)
		}
	}

	async function updateBookmark() {
		let { name, password } = user
		let { id, title, url, tags } = bookmarkForm
		let route = `${bookmarksRoute}/${id}`
		let params = {
			title: cipher(password)(title),
			url: cipher(password)(url),
			user: cipher(password)(name),
			tags: tags.map(t => cipher(password)(t.label)),
		}
		let endPoint = {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(params),
		}
		try {
			await fetch(route, endPoint)
			setBookmarkForm({
				id: '',
				title: '',
				url: '',
				tags: [],
				inputMode: 'add',
			})
			getBookmarks()
			getTagOptions()
		} catch (e) {
			throw new Error(e)
		}
	}

	async function deleteBookmark(uid) {
		let route = `${bookmarksRoute}/${uid}`
		let endPoint = { method: 'DELETE' }
		try {
			await fetch(route, endPoint)
			getBookmarks()
			getTagOptions()
		} catch (e) {
			throw new Error(e)
		}
	}

	function submitCredentials(e) {
		e.preventDefault()
		setUser({
			...user,
			loggedIn: true,
		})
		getBookmarks()
		getTagOptions()
	}

	function logout(e) {
		e.preventDefault()
		setBookmarks([])
		setUser({
			name: '',
			password: '',
			loggedIn: false,
		})
	}

	function startEditMode({ id, title, url, tags }) {
		setBookmarkForm({
			id,
			title,
			url,
			tags: formatTagsForSelect(tags),
			inputMode: 'edit',
		})
	}

	function renderLoginForm() {
		let { name, password, loggedIn } = user
		if (loggedIn) return <button>Logout</button>
		function updateUsername(e) {
			setUser({
				...user,
				name: e.target.value,
			})
		}
		function updatePassword(e) {
			setBookmarks([])
			setUser({
				...user,
				password: e.target.value,
			})
		}
		let usernameInput = (
			<input
				size='10'
				id='user-input'
				autoComplete='username'
				onChange={updateUsername}
				value={name}
			/>
		)
		let passwordInput = (
			<input
				size='10'
				id='pass-input'
				type='password'
				autoComplete='current-password'
				onChange={updatePassword}
				value={password}
			/>
		)
		return (
			<>
				{usernameInput}
				{passwordInput}
				<button disabled={!name || !password}>Login</button>
			</>
		)
	}

	function renderBookmarks() {
		function renderBookmark(encryptedBookmark) {
			let { title, url, tags, uid } = encryptedBookmark
			return (
				<Bookmark
					onClickDelete={deleteBookmark}
					onClickEdit={startEditMode}
					key={uid}
					uid={uid}
					title={decipher(user.password)(title)}
					url={decipher(user.password)(url)}
					tags={tags ? tags.map(({ tag }) => decipher(user.password)(tag)) : []}
				/>
			)
		}
		return bookmarks.map(renderBookmark)
	}

	function renderBookmarkForm() {
		let { title, url, tags, inputMode } = bookmarkForm
		function updateTitle(e) {
			setBookmarkForm({
				...bookmarkForm,
				title: e.target.value,
			})
		}
		function updateUrl(e) {
			setBookmarkForm({
				...bookmarkForm,
				url: e.target.value,
			})
		}
		function updateTags(value, meta) {
			setBookmarkForm({
				...bookmarkForm,
				tags: value,
			})
		}
		function submitActiveBookmark(e) {
			e.preventDefault()
			inputMode === 'add' ? addBookmark() : updateBookmark()
		}
		return (
			<form id='new-bookmark' onSubmit={submitActiveBookmark}>
				<div id='active-bookmark-section-title'>New Bookmark</div>
				<input id='new-bookmark-title' onChange={updateTitle} value={title} />
				<input id='new-bookmark-url' onChange={updateUrl} value={url} />
				<div id='tags-container'>
					<Select
						isMulti
						value={tags}
						onChange={updateTags}
						options={tagOptions}
						isClearable
					/>
				</div>
				<button disabled={!title || !url}>
					{inputMode === 'add' ? 'Add Bookmark' : 'Edit Bookmark'}
				</button>
			</form>
		)
	}

	return (
		<div id='app-root'>
			<div id='header'>
				<span id='title'>Smartmarks</span>
				<div id='header-spacer' />
				{/* <div id='credentials-form' /> */}
				<form
					id='credentials-form'
					onSubmit={user.loggedIn ? logout : submitCredentials}>
					{renderLoginForm()}
				</form>
			</div>
			{renderBookmarkForm()}
			{renderBookmarks()}
		</div>
	)
}

export default App
