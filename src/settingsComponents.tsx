import {ipcRenderer} from 'electron'
import * as React from 'react'
import {IChangeSettings, ISettings, setDefaultValues} from './settings'

export default class Settings extends React.Component<any, any> {
	public render () {
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

	public goBack () {
		ipcRenderer.send('goBack')
	}

	public render () {
		return (
			<div className='titleHeader'>
				<button className='buttonHeader' onClick={this.goBack}>
					<i className='fa fa-arrow-left fa-2x'></i>
				</button>
				<h1>Settings</h1>
			</div>
		)
	}
}

class Checkboxes extends React.Component<any, {settings: ISettings}> {
	constructor (props) {
		super(props)
		ipcRenderer.send('getSettings')
		this.state = {settings: setDefaultValues()}
		this.handleIpc()
	}

	public handleIpc () {
		ipcRenderer.on('getSettings-reply', (event, values) => {
			this.setState({settings: values})
		})
	}

	public render () {
		return (
			<div>
				<h2>Appearance</h2>
				<div className='lineDivider'></div>
				<h3>Trello board view</h3>
				<Checkbox property='useProgressBars' isChecked={this.state.settings.useProgressBars} name='Use progess bars'/>
				<Checkbox property='animateGIFs' isChecked={this.state.settings.animateGIFs} name='Use animated images'/>
			</div>
		)
	}
}

class Checkbox extends React.Component<any, any> {
	constructor (props) {
		super(props)
		this.onChange = this.onChange.bind(this)
		this.state = {isChecked: this.props.isChecked}
	}

	public onChange (event: React.FormEvent<HTMLInputElement>) {
		ipcRenderer.send('changeSettings', [[this.props.property, event.currentTarget.checked]])
		this.setState({isChecked: event.currentTarget.checked})
	}

	public componentWillReceiveProps (nextProps) {
		this.setState({isChecked: nextProps.isChecked})
	}

	public render () {
		return (
			<div>
				<input type='checkbox' onChange={this.onChange} checked={this.state.isChecked}/> {this.props.name}
			</div>
		)
	}
}
