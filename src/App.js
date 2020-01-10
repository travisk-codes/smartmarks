import React from 'react'
import uuid from 'uuid/v4'
import './App.css';

// https://stackoverflow.com/a/54026460/12392329
const cipher = salt => {
  const textToChars = text => text.split('').map(c => c.charCodeAt(0))
  const byteHex = n => ("0" + Number(n).toString(16)).substr(-2)
  const applySaltToChar = code => textToChars(salt).reduce((a,b) => a ^ b, code)    

  return text => text.split('')
    .map(textToChars)
    .map(applySaltToChar)
    .map(byteHex)
    .join('')
}
const decipher = salt => {
  const textToChars = text => text.split('').map(c => c.charCodeAt(0))
  const applySaltToChar = code => textToChars(salt).reduce((a,b) => a ^ b, code)

  return encoded => encoded.match(/.{1,2}/g)
    .map(hex => parseInt(hex, 16))
    .map(applySaltToChar)
    .map(charCode => String.fromCharCode(charCode))
    .join('')
}

function Bookmark(props) {
  return (
    <div className='bookmark'>
      <div>{props.title}</div>
      <div>{props.url}</div>
    </div>
  )
}

function App() {
  let [ userText, setUserText ] = React.useState('')
  let [ passText, setPassText ] = React.useState('')
  let [ newBookmark, setNewBookmark ] = React.useState({
    url: '',
    title: '',
  })
  let [ bookmarks, setBookmarks ] = React.useState([])

  function submitCredentials(e) {
    e.preventDefault()
    const params = { user_id: cipher(passText)(userText) }
    let url = new URL('https://travisk.info/smartmarks')
    Object.keys(params)
      .forEach(key => url.searchParams.append(key, params[key]))
    fetch(url)
      .then(res => {
        return res.json()
      })
      .then(json => {
        setBookmarks(bookmarks.concat(json))
      })
      .catch(e => console.log(e))
  }
  function submitNewBookmark(e) {
    e.preventDefault()
    if (! (newBookmark.title && newBookmark.url)) {
      console.log('need both title and url to submit bookmark')
      return
    }
    const params = {
      uid: uuid(),
      user: cipher(passText)(userText),
      title: cipher(passText)(newBookmark.title),
      url: cipher(passText)(newBookmark.url)
    }
    console.log(JSON.stringify(params))
    fetch('https://travisk.info/smartmarks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params)
    })
      .then(res => {
        return res.json()
      })
      .then(json => {
        setBookmarks(bookmarks.concat(json))
      })
      .catch(e => console.log(e))
  }
  console.log(bookmarks)
  return (
    <div id='app-root'>
      <form id='credentials-form' onSubmit={submitCredentials}>
        <p>Smartmarks</p>
        <input
          id='user-input'
          onChange={e => setUserText(e.target.value)}
          value={userText}
        />
        <br />
        <input
          id='pass-input'
          onChange={e => setPassText(e.target.value)}
          value={passText}
        />
        <br />
        <button>
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

        <button style={{
          display: newBookmark.title && newBookmark.url ? 'block' : 'none'
        }}>
          Add Bookmark
        </button>

      </form>
      {bookmarks.map(bm => {
        const title = decipher(passText)(bm.title)
        const url = decipher(passText)(bm.url)
        return <Bookmark title={title} url={url} />
      })}
    </div>
  );
}

export default App;
