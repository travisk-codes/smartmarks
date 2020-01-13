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
      : <button disabled>Delete</button>
	}
	
	function renderEditButton() {
		return isShowingButton
			? <button onClick={() => props.onClickEdit(props)}>Edit</button>
			: <button disabled>Edit</button>
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
      <div className='tags'>
        {props.tags ? props.tags.map(t => <span>{t}</span>) : null }
      </div>
			<div className='buttons'>
				{renderEditButton()}
				{renderDeleteButton()}
			</div>
    </div>
  )
}
