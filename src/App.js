import React from 'react';
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


function App() {
  let [ userText, setUserText ] = React.useState('')
  let [ passText, setPassText ] = React.useState('')

  async function submitCredentials(e) {
    e.preventDefault()
    const password_cipher = cipher(passText)
    const data = { username: password_cipher(userText)}
    const response = await fetch('https://api.travisk.info/bookmarks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return await response.json()
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
    </div>
  );
}

export default App;
