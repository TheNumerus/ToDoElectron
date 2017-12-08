import * as fontawesome from '@fortawesome/fontawesome'
import brands from '@fortawesome/fontawesome-free-brands'
import regular from '@fortawesome/fontawesome-free-regular'
import solid from '@fortawesome/fontawesome-free-solid'
import * as React from 'react'
import Homepage from './homepageComponents'
import Settings from './settingsComponents'
import Board from './trelloComponents'
import CardDetail from './trelloDetailsComponents'

export default class App extends React.Component<any, any> {
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
		switch (this.state.page) {
			default:
			case 'home':
				return <Homepage changePage={this.changePage}/>
			case 'trelloBoard':
				return  <Board idBoard={this.state.args[0]} changePage={this.changePage}/>
			case 'trelloCard':
				return  <CardDetail idCard={this.state.args[0]} changePage={this.changePage}/>
			case 'settings':
				return  <Settings changePage={this.changePage}/>
		}
	}
}
