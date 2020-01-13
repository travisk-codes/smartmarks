import React from 'react'
import Select from 'react-select/creatable'
// TODO: get tag data on mount

import uuid from 'uuid/v4'
import Bookmark from './Bookmark'
import { cipher, decipher } from './cipher'
import './App.css';

const bookmarks_url = 'https://travisk.info/api/bookmarks'

    
function Tags(props) {
  let [ tags, setTags ] = React.useState([])
  let [ tagOptions, setTagOptions ] = React.useState([])

  React.useEffect(() => {
    // TODO load tags from db given uid
  }, [])

  function handleChange(newValue, actionMeta) {
    if (actionMeta.action === 'create-option') {
      let tag = newValue.pop().value
      setTags(tags.concat([tag]))
    }

    console.group('Value Changed');
    console.log(newValue);
    console.log(`action: ${actionMeta.action}`);
    console.groupEnd();
  }

  function convertTagsIntoSelectObject(tags) {
    return tags.map(tag => ({ label: tag, value: tag}))
  }
    
  return <Select
    isMulti
    onChange={handleChange}
    options={convertTagsIntoSelectObject(tags)}
  />
}

function App() {
  let [ username, setUsername ] = React.useState('')
  let [ password, setPassword ] = React.useState('')
  let [ bookmarks, setBookmarks ] = React.useState([])
  let [ inputMode, setInputMode ] = React.useState('add')
  let [ currentUid, setCurrentUid ] = React.useState('')
  let [ activeBookmark, setActiveBookmark ] = React.useState({
    url: '',
    title: '',
  })

  async function getBookmarks() { try {
    const params = { user_id: cipher(password)(username) }
    let url = new URL(bookmarks_url)
    Object.keys(params)
      .forEach(key => url.searchParams.append(key, params[key]))

    const res = await fetch(url)
    const json = await res.json()
    setBookmarks(json)

  } catch(e) {
    throw new Error(e)
  }}

  async function getBookmark(uid) { try {
    const res = await fetch(bookmarks_url + '/' + uid)
    const json = await res.json()
    setBookmarks(bookmarks.concat(json))
  } catch(e) {
    throw new Error(e)
  }}

  async function addBookmark() { try {
    const uid = uuid()
    const params = {
      uid,
      user: cipher(password)(username),
      title: cipher(password)(activeBookmark.title),
      url: cipher(password)(activeBookmark.url)
    }

    await fetch(bookmarks_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params)
    })

    setActiveBookmark({url: '', title:''})
    getBookmark(uid)

  } catch(e) {
    throw new Error(e)
  }}

  async function updateBookmark() { try {
    const { title, url } = activeBookmark
    const params = {
      title: cipher(password)(title),
      url: cipher(password)(url)
    }

    await fetch(bookmarks_url + '/' + currentUid, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params)
    })

    setActiveBookmark({url: '', title: ''})
    setCurrentUid('')
    setInputMode('add')
    getBookmarks()

  } catch(e) {
    throw new Error(e)
  }}

  async function deleteBookmark(uid) { try {
    await fetch(bookmarks_url + '/' + uid, {
      method: 'DELETE',
      /*headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uid })*/
    })

    getBookmarks()

  } catch(e) {
    throw new Error(e)
  }}

  function submitCredentials(e) {
    e.preventDefault()
    if (!username) {
      console.log('must provide username to login')
      return
    }
    if (!password) {
      console.log('must provide password to login')
      return
    }
    getBookmarks()
  }

  function submitActiveBookmark(e) {
    e.preventDefault()
    if (!activeBookmark.title || !activeBookmark.url) {
      console.log('need both title and url to submit bookmark')
      return
    }
    if (!username || !password) {
      console.log('must sign in to submit bookmark')
      return
    }
    if (inputMode === 'add') {
      addBookmark()
    } else {
      updateBookmark()
    }
  }

  function startEditMode({ uid, title, url}) {
    setActiveBookmark({ title, url})
    setCurrentUid(uid)
    setInputMode('edit')
  }

  function renderBookmarks() {
    return bookmarks.map(bm => {
      const title = decipher(password)(bm.title)
      const url = decipher(password)(bm.url)
      return <Bookmark 
        onClickDelete={deleteBookmark}
        onClickEdit={startEditMode}
        key={bm.uid}
        uid={bm.uid} 
        title={title} 
        url={url} 
      />
    })
  }

  return (
    <div id='app-root'>

      <form id='credentials-form' onSubmit={submitCredentials}>
        <p>Smartmarks</p>

        <input
          id='user-input'
          onChange={e => setUsername(e.target.value)}
          value={username}
        />
        <input
          id='pass-input'
          type='password'
          onChange={e => {
            setBookmarks([])
            setPassword(e.target.value)
          }}
          value={password}
        />

        <button
          disabled={!username || !password}>
          Submit
        </button>
      </form>

      <form id='new-bookmark' onSubmit={submitActiveBookmark}>
        <p>New Bookmark</p>

        <input
          id='new-bookmark-title'
          onChange={e => setActiveBookmark(
            {...activeBookmark, title: e.target.value}
          )}
          value={activeBookmark.title}
        />
        <input
          id='new-bookmark-url'
          onChange={e => setActiveBookmark(
            {...activeBookmark, url: e.target.value}
          )}
          value={activeBookmark.url}
        />
        <div id='tags-container'>
          <Tags />
        </div>

        <button 
          disabled={!activeBookmark.title || !activeBookmark.url}>
          {inputMode === 'add' ? 'Add Bookmark' : 'Edit Bookmark'}
        </button>
      </form>

      {renderBookmarks()}

    </div>
  )
}

export default App
