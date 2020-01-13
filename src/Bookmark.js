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
    return isShowingButton
      ? <button onClick={() => props.onClickDelete(props.uid)}>Delete</button>
      : <button style={{visibility: 'hidden'}} disabled>Delete</button>
	}
	
	function renderEditButton() {
		return isShowingButton
			? <button onClick={() => props.onClickEdit(props)}>Edit</button>
			: <button style={{visibility: 'hidden'}} disabled>Edit</button>
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
