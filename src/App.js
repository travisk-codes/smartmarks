import React from 'react'
import Select from 'react-select/creatable'
// TODO: get tag data on mount

import uuid from 'uuid/v4'
import Bookmark from './Bookmark'
import { cipher, decipher } from './cipher'
import './App.css';

const bookmarks_url = 'https://travisk.info/api/bookmarks'
const tags_url = 'https://travisk.info/api/tags'
    
function ActiveBookmarkTagInput(props) {
  let [ tagOptions, setTagOptions ] = React.useState([
    { label: 'test', value: 'test' },
    { label: 'yay', value: 'yay' },
    { label: 'bravo', value: 'bravo' },
  ])

  React.useEffect(() => {
    /*async function getTags() { try {
      const params = { user_id: cipher(props.pass)(props.user) }
      let url = new URL(tags_url)
      Object.keys(params)
        .forEach(key => url.searchParams.append(key, params[key]))

      const res = await fetch(url)
      const json = await res.text()

      console.log(json)
      setTagOptions(json)
  
    } catch(e) {
      throw new Error(e)
    }}*/
  }, [])

  function handleChange(newValue, actionMeta) {
    /*if (actionMeta.action === 'create-option') {
      const newTag = newValue.pop()
      setTagOptions(tagOptions.concat([newTag]))
    }
    if (actionMeta.action)

    console.group('Value Changed');
    console.log(newValue);
    console.log(actionMeta);
    console.groupEnd();
    */
    props.onChange(newValue, actionMeta)
  }

  return <Select
    isMulti
    value={props.value}
    onChange={handleChange}
    options={tagOptions}
    isClearable
  />
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
  let [ username, setUsername ] = React.useState('')
  let [ password, setPassword ] = React.useState('')
  let [ loggedIn, setLoggedIn ] = React.useState(false)
  let [ bookmarks, setBookmarks ] = React.useState([])
  let [ inputMode, setInputMode ] = React.useState('add')
  let [ currentUid, setCurrentUid ] = React.useState('')
  let [ activeBookmark, setActiveBookmark ] = React.useState({
    url: '',
    title: '',
    tags: [],
  })

  async function getBookmarks() { try {
    const params = { user_id: cipher(password)(username) }
    let url = new URL(bookmarks_url)
    Object.keys(params)
      .forEach(key => url.searchParams.append(key, params[key]))

    const res = await fetch(url)
    const json = await res.json()
    const bookmarks = attachTagstoBookmarks(json[0], json[1])
    setBookmarks(bookmarks)

  } catch(e) {
    throw new Error(e)
  }}

  async function getBookmark(uid) { try {
    const res = await fetch(bookmarks_url + '/' + uid)
    const json = await res.json()
    const bookmark = attachTagstoBookmarks(json[0], json[1])
    console.log(bookmark)
    setBookmarks(bookmarks.concat(bookmark))
  } catch(e) {
    throw new Error(e)
  }}

  async function addBookmark() { try {
    const uid = uuid()
    const params = {
      uid,
      user: cipher(password)(username),
      title: cipher(password)(activeBookmark.title),
      url: cipher(password)(activeBookmark.url),
      tags: activeBookmark.tags.map(t => cipher(password)(t.label)),
    }

    await fetch(bookmarks_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params)
    })

    setActiveBookmark({url: '', title:'', tags: []})
    getBookmark(uid)

  } catch(e) {
    throw new Error(e)
  }}

  async function updateBookmark() { try {
    const { title, url } = activeBookmark
    const params = {
      title: cipher(password)(title),
      url: cipher(password)(url),
      user: cipher(password)(username),
      tags: activeBookmark.tags.map(t => cipher(password)(t.label)),
    }

    await fetch(bookmarks_url + '/' + currentUid, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params)
    })

    setActiveBookmark({url: '', title: '', tags: []})
    setCurrentUid('')
    setInputMode('add')
    getBookmarks()

  } catch(e) {
    throw new Error(e)
  }}

  async function deleteBookmark(uid) { try {
    await fetch(bookmarks_url + '/' + uid, {
      method: 'DELETE',
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
    setLoggedIn(true)
    getBookmarks()
  }

  function logout(e) {
    e.preventDefault()
    setUsername('')
    setPassword('')
    setBookmarks([])
    setLoggedIn(false)
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

  function startEditMode({ user, uid, title, url, tags}) {
    const tagsFormattedForSelect = tags.map(t => ({ label: t, value: t}))
    console.log(tagsFormattedForSelect)
    setActiveBookmark({ title, url, tags: tagsFormattedForSelect })
    setCurrentUid(uid)
    setInputMode('edit')
  }

  function renderCredentialsForm() {
    if (loggedIn) {
      return <button>Logout</button>
    } else {
      return (
        <>
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
            Login
          </button>
        </>
      )
    }
  }

  function renderBookmarks() {
    return bookmarks.map(bm => {
      const title = decipher(password)(bm.title)
      const url = decipher(password)(bm.url)
      const tags = bm.tags ? bm.tags.map(t => decipher(password)(t.tag)) : []
      return <Bookmark 
        onClickDelete={deleteBookmark}
        onClickEdit={startEditMode}
        key={bm.uid}
        uid={bm.uid} 
        title={title} 
        url={url} 
        tags={tags}
      />
    })
  }
  return (
    <div id='app-root'>
      <div id='header'>
        <span id='title'>Smartmarks</span>
        <form id='credentials-form'
          onSubmit={loggedIn ? logout : submitCredentials}>
          {renderCredentialsForm()}
        </form>
      </div>

      <form id='new-bookmark' onSubmit={submitActiveBookmark}>
        <div id='active-bookmark-section-title'>New Bookmark</div>

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
          <ActiveBookmarkTagInput 
            onChange={(value, meta) => {
              setActiveBookmark({
                ...activeBookmark,
                tags: value,
              })
            }}
            value={activeBookmark.tags}
            user={username}
            pass={password}
          />
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
