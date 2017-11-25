/// <reference path="trelloApi.d.ts" />

import {HelperUI, DueStates} from './HelperUI'
import * as React from 'react'
const autosize = require('autosize')
const globalProperties = require('electron').remote.require('./globalProperties').default
const {shell, ipcRenderer} = require('electron')
const URL = require('url').URL
const cardId = new URL(window.location.href).searchParams.get('id')
const connCheck = require('./connectionChecker')

export default class CardDetail extends React.Component<{}, CardDataProps> {
	componentDidMount () {
		this.handleIpc()
		ipcRenderer.send('trelloGetCardData', cardId, false)
		if (connCheck.state) {
			/* I have to comment this shit because fucking JS somehow managed to merge two seperate function calls into one,
			 which returned comments and checklists twice.
			this.update() */
		}
	}

	handleIpc () {
		ipcRenderer.on('trelloGetCardData-reply', (event, cardData) => {
			this.setState({cardData: cardData})
			// stop spinning refresh icon
			document.querySelector('#updateIcon').classList.remove('fa-spin')
		})
	}

	render () {
		var cardData = this.state.cardData
		// solve empty data
		if (cardData.url === undefined) { return null }
		if (cardData.name.length > 20) {
			document.title = `${cardData.name.substring(0, 20)}... | To-Do app in Electron`
		} else {
			document.title = `${cardData.name} | To-Do app in Electron`
		}
		var checklists = null
		if (cardData.checklistData !== undefined) {
			checklists = cardData.checklistData.map((data) => {
				return <Checklist checklistData={data} key={data.id}/>
			})
		}
		var comments = null
		if (cardData.comments !== undefined) {
			comments = cardData.comments.map(data => {
				return <Comment commentData={data} key={data.id}/>
			})
		}
		var labels = null
		if (cardData.labels !== undefined) {
			labels = cardData.labels.map(data => {
				return <Label labelData={data}/>
			})
		}
		return (
			<div className='detailsContainer'>
				<Header/>
				<div className='data'>
					<div className='mainColumn'>
						<Name cardData={cardData}/>
						<Description cardData={cardData}/>
						<div>{labels}</div>
						<DueDate cardData={cardData}/>
						{checklists}
						{comments}
					</div>
					<Attachments cardData={cardData}/>
				</div>
			</div>
		)
	}
}

class Header extends React.Component<{},{}> {
	constructor (props) {
		super(props)
		this.update = this.update.bind(this)
		this.goBack = this.goBack.bind(this)
	}

	goBack () {
		ipcRenderer.send('goBack')
	}

	update () {
		document.querySelector('#updateIcon').classList.add('fa-spin')
		ipcRenderer.send('trelloGetCardData', cardId, true)
	}

	render () {
		return (
			<div id='headerBoard'>
				<button onClick={this.goBack}><i className='fa fa-arrow-left fa-2x'></i></button>
				<button className='buttonHeader' onClick={this.update} style={{marginLeft: 'auto'}}><i id='updateIcon' className='fa fa-refresh fa-2x'></i></button>
			</div>
		)
	}
}
class Checklist extends React.Component<ChecklistProps, {}> {
	render () {
		var checklistData = this.props.checklistData
		// items store their order in a variable so we must sort them
		var sorted = checklistData.checkItems.sort((a, b) => {
			return a.pos - b.pos
		})
		var items = sorted.map((item) => {
			return <ChecklistItem check={item}/>
		})
		return (
			<div>
				<h5>{checklistData.name}</h5>
				{items}
			</div>
		)
	}
}

class ChecklistItem extends React.Component<CheckProps, {}> {
	render () {
		var icon = this.props.check.state === 'complete'
			? <i className="fa fa-check-square"></i>
			: <i className="fa fa-square"></i>
		return (
			<div>
				{icon}<span>{this.props.check.name}</span>
			</div>
		)
	}
}
class Comment extends React.Component<CommentProps, {}> {
	render () {
		var commentData = this.props.commentData
		return (
			<div>
				<span style={{fontSize: '150%'}}>{commentData.memberCreator.fullName}</span>
				<span>{commentData.data.text}</span>
			</div>
		)
	}
}
class ImageAttachment extends React.Component<AttachmentControlProps, {}> {
	constructor (props) {
		super(props)
		this.changeCover = this.changeCover.bind(this)
	}

	openImage (path: string) {
		shell.openExternal(path)
	}

	changeCover (idCover: string) {
		this.props.changeCover(idCover)
	}

	render () {
		var extension = this.props.attData.url.match(/.+([.].+)/)
		var filename = `${this.props.attData.id}${extension[1]}`
		var path = `${globalProperties.getPath()}attachments/${filename}`
		var date = new Date(this.props.attData.date)
		var dateString = `${date.getUTCDate()}.${date.getUTCMonth() + 1}.${date.getUTCFullYear()} - ${date.getUTCHours()}:${date.getUTCMinutes()}`
		return (
			<div className='att'>
				<div className='attControl'>
					<div className='attName'>{this.props.attData.name}</div>
					<div className='attDate'>{dateString}</div>
					<div className='attButtonBar'>
						<button>Comment</button>
						<button>Remove</button>
						<button onClick={(e) => this.changeCover(this.props.attData.id)}>{this.props.isCover ? 'Remove cover' : 'Set as cover'}</button>
					</div>
				</div>
				<img onClick={(e) => this.openImage(path)} className='attThumb' src={path}/>
			</div>
		)
	}
}

class Attachments extends React.Component<CardDataProps, any> {
	constructor (props) {
		super(props)
		this.changeCover = this.changeCover.bind(this)
		this.state = {currentCover: this.props.cardData.idAttachmentCover}
	}

	changeCover (idCover: string) {
		var changedCover: string
		if (idCover === this.state.currentCover) {
			changedCover = ''
		} else {
			changedCover = idCover
		}
		this.setState({currentCover: changedCover})
		ipcRenderer.send('trelloUpdateCard', this.props.cardData.id, [
			{key: 'idAttachmentCover', value: changedCover}
		])
	}

	componentWillReceiveProps (nextProps: CardDataProps) {
		if (nextProps.cardData.idAttachmentCover !== this.state.currentCover) {
			this.setState({currentCover: nextProps.cardData.idAttachmentCover})
		}
	}

	render () {
		var attachments = null
		if (this.props.cardData.attachments !== undefined) {
			attachments = this.props.cardData.attachments.map(data => {
				var isCover = data.id === this.state.currentCover
				return <ImageAttachment attData={data} key={data.id} isCover={isCover} changeCover={this.changeCover}/>
			})
		} else {
			return null
		}
		return (
			<div className='attContainer'>
				<h3>Attachments</h3>
				{attachments}
			</div>
		)
	}
}

class Label extends React.Component<LabelProps, {}> {
	render () {
		var label = this.props.labelData
		const labelStyle = {
			backgroundColor: HelperUI.returnColor(label.color)
		}
		return (
			<div className='cardLabel' style={labelStyle}>{label.name}</div>
		)
	}
}

class Description extends React.Component<CardDataProps, any> {
	nameInput: HTMLElement
	constructor (props) {
		super(props)
		this.finishEdit = this.finishEdit.bind(this)
		this.handleChange = this.handleChange.bind(this)
		this.state = {desc: this.props.cardData.desc}
	}

	finishEdit (event) {
		this.setState({desc: event.target.value})
		ipcRenderer.send('trelloUpdateCard', this.props.cardData.id, [
			['desc', this.state.desc]
		])
	}

	componentDidUpdate () {
		autosize.update(this.nameInput)
	}

	handleChange (event) {
		this.setState({desc: event.target.value})
	}

	componentWillReceiveProps () {
		this.setState({desc: this.props.cardData.desc})
	}

	render () {
		return <textarea className='desc'
			rows={1}
			placeholder='Add description'
			onChange={this.handleChange}
			value={this.state.desc}
			onBlur={this.finishEdit}
			ref={(input) => {
				this.nameInput = input
				autosize(input)
			}}/>
	}
}

class Name extends React.Component<CardDataProps, any> {
	nameInput: HTMLElement
	constructor (props) {
		super(props)
		this.finishEdit = this.finishEdit.bind(this)
		this.handleChange = this.handleChange.bind(this)
		this.state = {name: this.props.cardData.name}
	}

	finishEdit (event) {
		this.setState({name: event.target.value})
		if (this.state.name.length > 1) {
			ipcRenderer.send('trelloUpdateCard', this.props.cardData.id, [
				['name', this.state.name]
			])
		}
	}

	componentDidUpdate () {
		autosize.update(this.nameInput)
	}

	handleChange (event) {
		this.setState({name: event.target.value})
	}

	componentWillReceiveProps () {
		this.setState({name: this.props.cardData.name})
	}

	render () {
		return <textarea className='cardName'
			rows={1}
			onChange={this.handleChange}
			value={this.state.name}
			onBlur={this.finishEdit}
			ref={(input) => {
				this.nameInput = input
				autosize(input)
			}}/>
	}
}

class DueDate extends React.Component<CardDataProps, {}> {
	render () {
		var classes = ['dueLabel']
		var due = this.props.cardData.due
		// handle non set due date
		if (due === null) { return null }
		var date = new Date(due)
		var today = new Date()
		var dateString = ` ${date.getDate()}. ${date.getMonth() + 1}. ${today.getFullYear() === date.getFullYear() ? '' : date.getFullYear()}`
		const clock = ` - ${date.getHours()}:${date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes()}`
		if (this.props.cardData.dueComplete) {
			classes.push('dueComplete')
		} else {
			switch (HelperUI.returnDueState(date.getTime())) {
			case DueStates.overdueNear:
				classes.push('dueOverdueNear')
				dateString += clock
				break
			case DueStates.overdue:
				classes.push('dueOverdue')
				break
			case DueStates.near:
				classes.push('dueNear')
				dateString += clock
				break
			case DueStates.later:
				break
			default:
				throw new Error(`Wrong date on card with id ${this.props.cardData.id}`)
			}
		}
		return (
			<div className={classes.join(' ')}>
				<i className='fa fa-calendar-o'></i>
				{dateString}
				<input type='checkbox'/>
			</div>
		)
	}
}
