import * as fontawesome from '@fortawesome/fontawesome'
import brands from '@fortawesome/fontawesome-free-brands'
import regular from '@fortawesome/fontawesome-free-regular'
import solid from '@fortawesome/fontawesome-free-solid'
import * as React from 'react'
import { connect } from 'react-redux'
import Homepage from './homepageComponents'
import Settings from './settingsComponents'
import Board from './trelloComponents'
import CardDetail from './trelloDetailsComponents'

class App extends React.Component<any, any> {
	constructor(props) {
		super(props)
		this.state = {page: '', args: []}
		// build icon library
		fontawesome.library.add(brands, solid, regular)
	}

	public changePage = (page: string, ...args: any[]) => {
		this.setState({page, args})
	}
	public render () {
		switch (this.props.page) {
			default:
			case 'HOME':
				return <Homepage/>
			case 'TRELLO_BOARD':
				return  <Board idBoard={this.props.id}/>
			case 'TRELLO_CARD':
				return  <CardDetail idCard={this.props.id}/>
			case 'SETTINGS':
				return  <Settings/>
		}
	}
}

const mapStateToProps = (state) => {
	return {
		page: state.page.page,
		id: state.page.id
	}
}

export default connect(mapStateToProps)(App)
