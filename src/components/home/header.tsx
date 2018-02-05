import * as FontAwesomeIcon from '@fortawesome/react-fontawesome'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { changePage } from '../../actions'

class Header extends React.Component<any, any> {
	public goToSettings () {
		this.props.dispatch(changePage('SETTINGS'))
	}

	public render () {
		return (
			<div className='titleHeader'>
				<h1>ToDoElectron</h1>
				<button className='buttonHeader' onClick={() => this.goToSettings()} style={{marginLeft: 'auto'}}>
					<FontAwesomeIcon icon='wrench' size='3x'/>
				</button>
			</div>
		)
	}
}

export default connect()(Header)
