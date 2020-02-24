import React from 'react'

export default function Bookmark(props) {
	let [isShowingButton, showButton] = React.useState(false)

	function mouseEnter() {
		showButton(true)
	}
	function mouseLeave() {
		showButton(false)
	}

	function renderDeleteButton() {
		return (
			<button
				onClick={() => props.onClickDelete(props.uid)}
				style={{ visibility: isShowingButton ? 'visible' : 'hidden' }}>
				Delete
			</button>
		)
	}

	function renderEditButton() {
		return (
			<button
				onClick={() => props.onClickEdit(props)}
				style={{ visibility: isShowingButton ? 'visible' : 'hidden' }}>
				Edit
			</button>
		)
	}
	return (
		<div
			className='bookmark'
			onMouseEnter={mouseEnter}
			onMouseLeave={mouseLeave}>
			<div className='contents-and-tags'>
				<div className='contents'>
					<div className='title'>{props.title}</div>
					<div className='url'>
						<a href={props.url}>{props.url}</a>
					</div>
				</div>

				<div className='tags'>
					{props.tags
						? props.tags.map(t => <span className='tag'>{t}</span>)
						: null}
				</div>
			</div>

			<div className='buttons'>
				{renderEditButton()}
				{renderDeleteButton()}
			</div>
		</div>
	)
}
