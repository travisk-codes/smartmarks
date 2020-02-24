import React, { useState } from 'react'
import Select from 'react-select/creatable'
import uuid from 'uuid/v4'

import Bookmark from './Bookmark'
import { cipher, decipher } from './cipher'
import './App.css'

let bookmarksRoute = 'https://travisk.info/api/bookmarks'
let tagsRoute = 'https://travisk.info/api/tags'

function convertTagToSelectOption(tag) {
	return { label: tag, value: tag }
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
	})
	//let [username, setUsername] = React.useState('')
	//let [password, setPassword] = React.useState('')
	//let [loggedIn, setLoggedIn] = React.useState(false)
	let [bookmarks, setBookmarks] = React.useState([])
	let [inputMode, setInputMode] = React.useState('add')
	let [currentUid, setCurrentUid] = React.useState('')
	let [activeBookmark, setActiveBookmark] = React.useState({
		url: '',
		title: '',
		tags: [],
	})
	let [tagOptions, setTagOptions] = React.useState([
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
			let tagOptions = json.map(({ tag }) =>
				convertTagToSelectOption(decipher(user.password)(tag)),
			)
			setTagOptions(tagOptions)
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
		let { title, url, tags } = activeBookmark
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
			setActiveBookmark({ url: '', title: '', tags: [] })
			getBookmark(uid)
		} catch (e) {
			throw new Error(e)
		}
	}

	async function updateBookmark() {
		let { name, password } = user
		let { title, url, tags } = activeBookmark
		let route = `${bookmarksRoute}/${currentUid}`
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
			setActiveBookmark({ url: '', title: '', tags: [] })
			setCurrentUid('')
			setInputMode('add')
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

	function startEditMode({ user, uid, title, url, tags }) {
		const tagsFormattedForSelect = tags.map(t => ({ label: t, value: t }))
		setActiveBookmark({ title, url, tags: tagsFormattedForSelect })
		setCurrentUid(uid)
		setInputMode('edit')
	}

	function renderCredentialsForm() {
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
				id='user-input'
				autoComplete='username'
				onChange={updateUsername}
				value={name}
			/>
		)
		let passwordInput = (
			<input
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
		let { title, url, tags } = activeBookmark
		function updateTitle(e) {
			setActiveBookmark({
				...activeBookmark,
				title: e.target.value,
			})
		}
		function updateUrl(e) {
			setActiveBookmark({
				...activeBookmark,
				url: e.target.value,
			})
		}
		function updateTags(value, meta) {
			setActiveBookmark({
				...activeBookmark,
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
				<form
					id='credentials-form'
					onSubmit={user.loggedIn ? logout : submitCredentials}>
					{renderCredentialsForm()}
				</form>
			</div>
			{renderBookmarkForm()}
			{renderBookmarks()}
		</div>
	)
}

export default App
