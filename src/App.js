import React, { useState, useEffect, useCallback } from 'react'
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
	let [user, setUser] = useState({
		name: localStorage.getItem('username') || '',
		password: localStorage.getItem('password') || '',
		loggedIn: localStorage.getItem('loggedIn') === 'true',
	})
	let [bookmarks, setBookmarks] = useState([])
	let [bookmarkForm, setBookmarkForm] = useState({
		uid: '',
		title: '',
		url: '',
		tags: [],
		inputMode: 'add',
	})
	let [tagOptions, setTagOptions] = useState([])

	// wrapping function in useCallback to allow call in useEffect
	// https://reactjs.org/docs/hooks-faq.html#is-it-safe-to-omit-functions-from-the-list-of-dependencies
	let getBookmarks = useCallback(async () => {
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
	}, [user])

	useEffect(() => {
		if (user.loggedIn) getBookmarks()
	}, [user, getBookmarks])

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
			setBookmarkForm({ ...bookmarkForm, url: '', title: '', tags: [] })
			getBookmark(uid)
			getTagOptions()
		} catch (e) {
			throw new Error(e)
		}
	}

	async function updateBookmark() {
		let { name, password } = user
		let { uid, title, url, tags } = bookmarkForm
		let route = `${bookmarksRoute}/${uid}`
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
				uid: '',
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
		localStorage.setItem('loggedIn', 'true')
		localStorage.setItem('username', user.name)
		localStorage.setItem('password', user.password)
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
		localStorage.setItem('loggedIn', 'false')
		localStorage.setItem('username', '')
		localStorage.setItem('password', '')
		setUser({
			name: '',
			password: '',
			loggedIn: false,
		})
	}

	function startEditMode({ uid, title, url, tags }) {
		setBookmarkForm({
			uid,
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

	function renderHeader() {
		return (
			<div id='header'>
				<span id='title'>Smartmarks</span>
				<div id='header-spacer' />
				<form
					id='credentials-form'
					onSubmit={user.loggedIn ? logout : submitCredentials}>
					{renderLoginForm()}
				</form>
			</div>
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
		let selectTheme = theme => ({
			...theme,
			colors: {
				...theme.colors,
				primary: '#ff5050',
				primary25: '#ffdddd',
			},
		})
		return (
			<form id='new-bookmark' onSubmit={submitActiveBookmark}>
				<input
					placeholder='New bookmark'
					id='new-bookmark-title'
					onChange={updateTitle}
					value={title}
				/>
				<input
					placeholder='URL'
					id='new-bookmark-url'
					onChange={updateUrl}
					value={url}
				/>
				<div id='select-tags-container'>
					<Select
						isMulti
						value={tags}
						onChange={updateTags}
						options={tagOptions}
						isClearable
						theme={selectTheme}
						placeholder='Select Tags...'
					/>
				</div>
				<button disabled={!title || !url}>
					{inputMode === 'add' ? 'Add Bookmark' : 'Save Bookmark'}
				</button>
			</form>
		)
	}

	function renderPitch() {
		return (
			<div>
				<div className='pitch'>
					Smartmarks is a client-side encrypted bookmarks app. Your data is
					secured before it is sent to the server, and your password never
					leaves your computer.
				</div>
				<div className='pitch'>
					Smartmarks is made by Travis Kohlbeck. You can donate to their{' '}
					<a href='https://patreon.com/travisk_creates'>Patreon</a> or if you
					are looking to hire, check out their{' '}
					<a href='https://hire.travisk.info'>portfolio.</a> Thanks for
					visiting! ❤️
				</div>
			</div>
		)
	}

	return (
		<div id='app-root'>
			{renderHeader()}
			{renderBookmarks()}
			{user.loggedIn ? renderBookmarkForm() : null}
			{renderPitch()}
		</div>
	)
}

export default App
