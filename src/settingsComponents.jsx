import React from 'react'
import {ipcRenderer} from 'electron'

export default class Settings extends React.Component {
	render () {
		return (
			<div>
				<Header/>
			</div>
		)
	}
}

class Header extends React.Component {
	constructor (props) {
		super(props)
		this.goBack = this.goBack.bind(this)
	}

	goBack () {
		ipcRenderer.send('goBack')
	}

	render () {
		return (
			<div className="titleHeader">
				<button className='buttonHeader' onClick={this.goBack}>
					<i className='fa fa-arrow-left fa-2x'></i>
				</button>
				<h1>Settings</h1>
			</div>
		)
	}
}
