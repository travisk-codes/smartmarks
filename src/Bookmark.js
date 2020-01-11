import React from 'react'

export default function Bookmark(props) {
  let [ isShowingButton, showButton ] = React.useState(false)

  function mouseEnter() {
    showButton(true)
  }
  function mouseLeave() {
    showButton(false)
  }

  function renderDeleteButton() {
    return true
      ? <button onClick={() => props.onClickDelete(props.uid)}>Delete</button>
      : null
	}
	
	function renderEditButton() {
		return true
			? <button onClick={() => props.onClickDelete(props.uid)}>Edit</button>
			: null
	}

  return (
    <div 
      className='bookmark'
      onMouseEnter={mouseEnter}
      onMouseLeave={mouseLeave}>
      <div className='title'>{props.title}</div>
      <div className='url'>
				<a href={props.url}>
					{props.url}
				</a>
			</div>
			<div className='buttons'>
				{renderEditButton()}
				{renderDeleteButton()}
			</div>
    </div>
  )
}
