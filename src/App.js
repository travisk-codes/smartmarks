import React from 'react'
import uuid from 'uuid/v4'
import Bookmark from './Bookmark'
import { cipher, decipher } from './cipher'
import './App.css';

const api_location = 'https://travisk.info/smartmarks'

function App() {
  let [ userText, setUserText ] = React.useState('')
  let [ passText, setPassText ] = React.useState('')
  let [ bookmarks, setBookmarks ] = React.useState([])
  let [ inputMode, setInputMode ] = React.useState('add')
  let [ currentUid, setCurrentUid ] = React.useState('')
  let [ newBookmark, setNewBookmark ] = React.useState({
    url: '',
    title: '',
  })

  async function getBookmarks() { try {
    const params = { user_id: cipher(passText)(userText) }
    let url = new URL(api_location)
    Object.keys(params)
      .forEach(key => url.searchParams.append(key, params[key]))

    const res = await fetch(url)
    const json = await res.json()
    setBookmarks(json)

  } catch(e) {
    throw new Error(e)
  }}

  async function addBookmark() { try {
    const params = {
      uid: uuid(),
      user: cipher(passText)(userText),
      title: cipher(passText)(newBookmark.title),
      url: cipher(passText)(newBookmark.url)
    }
    await fetch(api_location, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params)
    })
    setNewBookmark({url: '', title:''})
    getBookmarks()
  } catch(e) {
    throw new Error(e)
  }}

  async function updateBookmark() { try {
    const { title, url } = newBookmark
    const uid = currentUid
    console.log(JSON.stringify({uid, title, url}))
    const params = {
      uid: currentUid,
      title: cipher(passText)(title),
      url: cipher(passText)(url)
    }
    const res = await fetch(api_location, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params)
    })
    const json = await res.json()
    console.log(json)

    setNewBookmark({url: '', title: ''})
    setCurrentUid('')
    setInputMode('add')
    getBookmarks()

  } catch(e) {
    throw new Error(e)
  }}



  async function deleteBookmark(uid) { try {
    await fetch(api_location, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uid })
    })
    getBookmarks()
  } catch(e) {
    throw new Error(e)
  }}

  function submitCredentials(e) {
    e.preventDefault()
    if (!userText) {
      console.log('must provide username to login')
      return
    }
    if (!passText) {
      console.log('must provide password to login')
      return
    }
    getBookmarks()
  }

  function submitNewBookmark(e) {
    e.preventDefault()
    if (!newBookmark.title || !newBookmark.url) {
      console.log('need both title and url to submit bookmark')
      return
    }
    if (!userText || !passText) {
      console.log('must sign in to submit bookmark')
      return
    }
    if (inputMode === 'add') {
      addBookmark()
    } else {
      console.log(currentUid)
      updateBookmark()
    }
  }

  function fillFieldsAndPassUid({ uid, title, url}) {
    setNewBookmark({ title, url})
    setCurrentUid(uid)
    setInputMode('edit')
  }

  function renderBookmarks() {
    return bookmarks.map(bm => {
      const title = decipher(passText)(bm.title)
      const url = decipher(passText)(bm.url)
      return <Bookmark 
        onClickDelete={deleteBookmark}
        onClickEdit={fillFieldsAndPassUid}
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
          onChange={e => setUserText(e.target.value)}
          value={userText}
        />
        <input
          id='pass-input'
          type='password'
          onChange={e => {
            setBookmarks([])
            setPassText(e.target.value)
          }}
          value={passText}
        />
        <button
          disabled={!userText || !passText}>
          Submit
        </button>
      </form>

      <form id='new-bookmark' onSubmit={submitNewBookmark}>
        <p>New Bookmark</p>

        <input
          id='new-bookmark-title'
          onChange={e => setNewBookmark(
            {...newBookmark, title: e.target.value}
          )}
          value={newBookmark.title}
        />
        <input
          id='new-bookmark-url'
          onChange={e => setNewBookmark(
            {...newBookmark, url: e.target.value}
          )}
          value={newBookmark.url}
        />

        <button 
          disabled={!newBookmark.title || !newBookmark.url}>
          {inputMode === 'add' ? 'Add Bookmark' : 'Edit Bookmark'}
        </button>

      </form>

      {renderBookmarks()}

    </div>
  );
}

export default App;
