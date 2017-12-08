import * as FontAwesomeIcon from '@fortawesome/react-fontawesome'
import {ipcRenderer} from 'electron'
import * as React from 'react'
import {IChangeSettings, ISettings, setDefaultValues, Theme} from './settings'
import {TrelloInterfacesProps} from './trelloInterfacesProps'

export default class Settings extends React.Component<any, any> {
	public render () {
		return (
			<div>
				<Header changePage={this.props.changePage}/>
				<Checkboxes/>
			</div>
		)
	}
}
class Header extends React.Component<any, any> {

	public goBack = () => {
		this.props.changePage('home')
	}

	public render () {
		return (
			<div className='titleHeader'>
				<button className='buttonHeader' onClick={this.goBack}>
					<FontAwesomeIcon icon='chevron-left' size='2x'/>
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
				<h3>Trello board view</h3>
				<ThemeSelect currentTheme={this.state.settings.theme}/>
				<div className='lineDivider'></div>
				<h3>Trello board view</h3>
				<Checkbox property='useProgressBars' isChecked={this.state.settings.useProgressBars} name='Use progess bars' implemented={false}/>
				<Checkbox property='showCardCoverImages' isChecked={this.state.settings.showCardCoverImages} name='Show cover images on cards'/>
				<Checkbox property='animateGIFs' isChecked={this.state.settings.animateGIFs} name='Use animated images'/>
				<Checkbox property='labelNames' isChecked={this.state.settings.labelNames} name='Use named labels'/>
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
		let text = this.props.name
		if (this.props.implemented !== undefined && this.props.implemented === false) {
			text += ' - not yet implemented'
		}
		return (
			<div>
				<input type='checkbox' onChange={this.onChange} checked={this.state.isChecked}/> {text}
			</div>
		)
	}
}

class ThemeSelect extends React.Component<any, any> {
	constructor (props) {
		super(props)
		this.onChange = this.onChange.bind(this)
		this.state = {isChecked: this.props.currentTheme === Theme.dark}
	}

	public onChange (event: React.FormEvent<HTMLInputElement>) {
		let value = Theme.light
		if (event.currentTarget.checked) {
			value = Theme.dark
		}
		ipcRenderer.send('changeSettings', [['theme', value]])
		this.setState({isChecked: event.currentTarget.checked})
	}

	public componentWillReceiveProps (nextProps) {
		this.setState({isChecked: nextProps.currentTheme === Theme.dark})
	}

	public render () {
		return (
			<div>
				<input type='checkbox' onChange={this.onChange} checked={this.state.isChecked}/> Use dark theme - not yet implemented
			</div>
		)
	}
}
