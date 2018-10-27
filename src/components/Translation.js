

import lodash from 'lodash'
import React from 'react'
import { connect } from 'react-redux'


class Translation extends React.PureComponent {

	getTranslation( key ){
		// TODO remove this when CMS JSON is correct:
		return lodash.find( this.props.languages.mappings, ( v, map ) => {
			if( lodash.isEmpty( key ) ) return false
			return ( map.toLowerCase() === key.toLowerCase() )
		})


		// Correct way:
		// return this.props.languages.mappings[ key ]
	}

	render(){
		let text = this.getTranslation( this.props.string )
		return (
			<span className="translation">{text}</span>
		)
	}
}

const mapStateToProps = ({ languages }) => ({ languages })
export default connect(mapStateToProps)(Translation)





