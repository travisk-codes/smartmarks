import React from 'react';
import './App.css';


function App() {
  let [ userText, setUserText ] = React.useState('')
  let [ passText, setPassText ] = React.useState('')

  function submitCredentials(e) {
    e.preventDefault()
    alert(userText)
    alert(passText)
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
