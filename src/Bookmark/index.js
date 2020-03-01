import React from 'react'

import './styles.css'

export default function Bookmark(props) {
	let [isShowingButton, showButton] = React.useState(false)

	function mouseEnter() {
		showButton(true)
	}
	function mouseLeave() {
		showButton(false)
	}

	let renderDeleteButton = () => (
		<button
			onClick={() => props.onClickDelete(props.uid)}
			style={{ visibility: isShowingButton ? 'visible' : 'hidden' }}>
			Delete
		</button>
	)

	let renderEditButton = () => (
		<button
			onClick={() => props.onClickEdit(props)}
			style={{ visibility: isShowingButton ? 'visible' : 'hidden' }}>
			Edit
		</button>
	)

	return (
		<div
			className='bookmark'
			onMouseEnter={mouseEnter}
			onMouseLeave={mouseLeave}>
			<div className='contents-and-tags'>
				<div className='contents'>
					<img
						alt='Bookmark Favicon'
						className='favicon'
						src={`http://www.google.com/s2/favicons?domain=${props.url}`}
					/>
					<div className='title'>{props.title}</div>
					<div className='url'>
						<a target='_blank' rel='noopener noreferrer' href={props.url}>
							{props.url}
						</a>
					</div>
				</div>

				<div className='tags'>
					{props.tags
						? props.tags.map(t => (
								<span key={t} className='tag'>
									{t}
								</span>
						  ))
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
