import * as FontAwesomeIcon from '@fortawesome/react-fontawesome'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { changePage } from '../../actions'

class Header extends React.Component<IHeaderProps, {}> {

	public goBack = () => {
		this.props.dispatch(changePage('HOME'))
	}

	public render () {
		return (
			<div className='titleHeader'>
				<button className='buttonHeader' onClick={() => this.goBack()}>
					<FontAwesomeIcon icon='chevron-left' size='2x'/>
				</button>
				<h1>Settings</h1>
			</div>
		)
	}
}

export default connect()(Header)

interface IHeaderProps {
	dispatch: any
}
