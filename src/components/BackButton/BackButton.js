
import React from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './BackButton.css'



const BackButton = ( props ) => {
	let toUrl = props.toUrl || '/home'
	return (
		<Link ada-enabled="enabled" ada-order={0} className="back" onClick={() => {
			console.log('Back button on touch down......', props.onTap)
			if( props.onTap ) props.onTap()
		}} to={toUrl}>
			<div className="contents">
				<FontAwesomeIcon className="fa-2x" icon={['fas', 'angle-left']} />
			</div>
		</Link>
	)
}

export default BackButton
