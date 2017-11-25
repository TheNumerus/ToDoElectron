/// <reference path="settings.d.ts" />
import * as React from 'react'
import {ipcRenderer} from 'electron'

export default class Settings extends React.Component<any, any> {
	render () {
		return (
			<div>
				<Header/>
				<Checkboxes/>
			</div>
		)
	}
}

class Header extends React.Component<any, any> {
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

class Checkboxes extends React.Component<any, any> {
	constructor (props) {
		super(props)
		ipcRenderer.send('getSettings')
		this.state = {settings: {theme: null, board: { useProgressBars: null, animatedGIFs: null }}}
		this.handleIpc()
	}

	handleIpc () {
		ipcRenderer.on('getSettings-reply', (event, values) => {
			this.setState({settings: values})
		})
	}

	render () {
		var values = []
		for (var value in this.state.settings) {
			values.push(<Checkbox value={value}/>)
		}
		return (
			<div>
				<h2>Appearance</h2>
				<div className='lineDivider'></div>
				<h3>Trello board view</h3>
				<Checkbox isChecked={this.state.settings.board.useProgressBars} name='Use progess bars'/>
				<Checkbox isChecked={this.state.settings.board.animateGIFs} name='Use animated images'/>
			</div>
		)
	}
}

class Checkbox extends React.Component<any, any> {
	constructor (props) {
		super(props)
		this.onChange = this.onChange.bind(this)
		this.state = {checked: this.props.isChecked}
	}

	onChange (event) {
		this.setState({checked: event.target.isChecked})
	}

	componentWillReceiveProps (nextProps) {
		this.setState({checked: nextProps.isChecked})
	}

	render () {
		return (
			<div>
				<input type='checkbox' onChange={this.onChange} checked={this.state.isChecked}/> {this.props.name}
			</div>
		)
	}
}
