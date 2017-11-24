import React from 'react'
import {ipcRenderer} from 'electron'

export default class Settings extends React.Component {
	render () {
		return (
			<div>
				<Header/>
				<Checkboxes/>
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

class Checkboxes extends React.Component {
	constructor (props) {
		super(props)
		ipcRenderer.send('getSettings')
		this.state = {settings: {}}
		this.handleIpc()
	}

	handleIpc () {
		ipcRenderer.on('getSettings-reply', (event, values) => {
			this.setState({settings: values.board})
		})
	}

	render () {
		var values = []
		for (var value in this.state.settings) {
			values.push(<Checkbox value={value}/>)
		}
		return (
			<div>
				{values}
			</div>
		)
	}
}

class Checkbox extends React.Component {
	render () {
		return (
			<div>
				<input type='checkbox' checked={this.props.value}/> {this.props.value.constructor.name}
			</div>
		)
	}
}
