import React from 'react'

export default function Bookmark(props) {
  let [ isShowingButton, showButton ] = React.useState(false)

  function mouseEnter() {
    showButton(true)
  }
  function mouseLeave() {
    showButton(false)
  }

  function renderButton() {
    return isShowingButton
      ? <button onClick={() => props.onClickDelete(props.uid)}>X</button>
      : null
  }

  return (
    <div 
      className='bookmark'
      onMouseEnter={mouseEnter}
      onMouseLeave={mouseLeave}>
      <div>{props.title}</div>
      <div>{props.url}</div>
      {renderButton()}
    </div>
  )
}
