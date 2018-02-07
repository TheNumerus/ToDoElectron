import * as FontAwesomeIcon from '@fortawesome/react-fontawesome'
import * as autosize from 'autosize'
import {ipcRenderer} from 'electron'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { changePage } from './actions'
import * as trelloComponents from './components/trelloComponents'
import * as connCheck from './connectionChecker'
import * as HelperUI from './HelperUI'
import { CheckState } from './trelloApi'
import { TrelloTypes } from './trelloInterfaces'
import { TrelloInterfacesProps } from './trelloInterfacesProps'
let cardId

class CardDetail extends React.Component<any, any> {
	constructor (props) {
		super(props)
		cardId = this.props.idCard
		this.handleIpc()
		ipcRenderer.send('trelloGetCardData', cardId, false)
		if (connCheck.getState()) {
			/* I have to comment this shit because fucking JS somehow managed to merge two seperate function calls into one,
			 which returned comments and checklists twice.
			this.update() */
		}
		this.state = {cardData: {name: ''}, iconSpin: false}
	}

	public handleIpc () {
		ipcRenderer.on('trelloGetCardData-reply', (event, cardData) => {
			this.setState({cardData, iconSpin: false})
		})
	}

	public goBack = () => {
		this.props.dispatch(changePage('TRELLO_BOARD', this.state.cardData.idBoard))
	}

	public update = () => {
		this.setState({iconSpin: true})
		ipcRenderer.send('trelloGetCardData', cardId, true)
	}

	public render () {
		const cardData: TrelloTypes.CardData = this.state.cardData
		// solve empty data
		if (cardData.url === undefined) { return null }
		if (cardData.name.length > 20) {
			document.title = `${cardData.name.substring(0, 20)}... | To-Do app in Electron`
		} else {
			document.title = `${cardData.name} | To-Do app in Electron`
		}
		let checklists = null
		if (cardData.checklistData !== undefined) {
			checklists = cardData.checklistData.map((data) => {
				return <Checklist checklistData={data} key={data.id}/>
			})
		}
		let comments = null
		if (cardData.comments !== undefined) {
			comments = cardData.comments.map((data) => {
				return <Comment commentData={data} key={data.id}/>
			})
		}
		let labels = null
		if (cardData.labels !== undefined) {
			labels = cardData.labels.map((data) => {
				return <Label labelData={data}/>
			})
		}
		return (
			<div className='detailsContainer'>
				<Header goBack={this.goBack} update={this.update} iconSpin={this.state.iconSpin}/>
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

export default connect()(CardDetail)

class Header extends React.Component<any, any> {
	public render () {
		return (
			<div id='headerBoard'>
				<button className='buttonHeader' onClick={() => {this.props.goBack()}}><FontAwesomeIcon icon='chevron-left' size='2x'/></button>
				<button className='buttonHeader' onClick={() => {this.props.update()}} style={{marginLeft: 'auto'}}>
				<FontAwesomeIcon icon='sync' size='2x' spin={this.props.iconSpin}/>
				</button>
			</div>
		)
	}
}
class Checklist extends React.Component<TrelloInterfacesProps.IChecklistProps, {}> {
	public render () {
		const checklistData = this.props.checklistData
		// items store their order in a variable so we must sort them
		const sorted = checklistData.checkItems.sort((a, b) => {
			return a.pos - b.pos
		})
		const items = sorted.map((item) => {
			return <ChecklistItem check={item}/>
		})
		return (
			<div>
				<h5>{checklistData.name}</h5>
				<ProgressBar checklistData={this.props.checklistData}/>
				{items}
			</div>
		)
	}
}

class ChecklistItem extends React.Component<TrelloInterfacesProps.ICheckProps, any> {
	public nameInput: HTMLTextAreaElement
	constructor (props) {
		super(props)
		this.onChangeValue = this.onChangeValue.bind(this)
		this.onChangeText = this.onChangeText.bind(this)
		this.finishEdit = this.finishEdit.bind(this)
		this.state = {isChecked: this.checkToBool(props.check.state), name: props.check.name}
	}

	public checkToBool (input: CheckState) {
		if (input === CheckState.complete) {
			return true
		}
		return false
	}

	public boolToCheck (input: boolean): CheckState {
		if (input) {
			return CheckState.complete
		}
		return CheckState.incomplete
	}

	public onChangeValue (event: React.FormEvent<HTMLInputElement>) {
		ipcRenderer.send('trelloUpdateChecklist', {cardId, idCheckItem: this.props.check.id}, [['state', this.boolToCheck(event.currentTarget.checked)]])
		this.setState({isChecked: event.currentTarget.checked})
	}

	public onChangeText (event: React.FormEvent<HTMLTextAreaElement>) {
		this.setState({name: event.currentTarget.value})
	}

	public finishEdit (event: React.FormEvent<HTMLTextAreaElement>) {
		ipcRenderer.send('trelloUpdateChecklist', {cardId, idCheckItem: this.props.check.id}, [['name', event.currentTarget.value]])
		this.setState({name: event.currentTarget.value})
	}

	public render () {
		return (
			<div>
				<input type='checkbox' onChange={this.onChangeValue} checked={this.state.isChecked}/>
				<textarea className='checkListItem'
					rows={1}
					onChange={this.onChangeText}
					value={this.state.name}
					onBlur={this.finishEdit}
					ref={(input) => {
						this.nameInput = input
						autosize(input)
					}}/>
			</div>
		)
	}
}

class ProgressBar extends React.Component<TrelloInterfacesProps.IChecklistProps, {}> {
	public render () {
		const divisor = this.props.checklistData.checkItems.length
		let divident = 0
		this.props.checklistData.checkItems.forEach((checkItem) => {
			if (checkItem.state === 'complete') {
				divident++
			}
		})
		const width = divident / divisor * 100
		return (
			<div className='barContainer'>
				<div className='bar' style={{width: `${width}%`}}></div>
			</div>
		)
	}
}

class Comment extends React.Component<TrelloInterfacesProps.ICommentProps, {}> {
	public render () {
		const commentData = this.props.commentData
		return (
			<div>
				<span style={{fontSize: '150%'}}>{commentData.memberCreator.fullName}</span>
				<span>{commentData.data.text}</span>
			</div>
		)
	}
}

class Attachments extends React.Component<TrelloInterfacesProps.ICardDataProps, any> {
	constructor (props) {
		super(props)
		this.changeCover = this.changeCover.bind(this)
		this.state = {currentCover: this.props.cardData.idAttachmentCover}
	}

	public changeCover (idCover: string) {
		let changedCover: string
		if (idCover === this.state.currentCover) {
			changedCover = ''
		} else {
			changedCover = idCover
		}
		this.setState({currentCover: changedCover})
		ipcRenderer.send('trelloUpdateCard', this.props.cardData.id, [
			['idAttachmentCover', changedCover]
		])
	}

	public componentWillReceiveProps (nextProps: TrelloInterfacesProps.ICardDataProps) {
		if (nextProps.cardData.idAttachmentCover !== this.state.currentCover) {
			this.setState({currentCover: nextProps.cardData.idAttachmentCover})
		}
	}

	public render () {
		let attachments = null
		if (this.props.cardData.attachments !== undefined) {
			attachments = this.props.cardData.attachments.map((data) => {
				const isCover = data.id === this.state.currentCover
				return <trelloComponents.ImageAttachment attData={data} key={data.id} isCover={isCover} changeCover={this.changeCover}/>
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

class Label extends React.Component<TrelloInterfacesProps.ILabelProps, {}> {
	public render () {
		const label = this.props.labelData
		const labelStyle = {
			backgroundColor: HelperUI.returnColor(label.color)
		}
		const name = label.name === '' ? '\u2002' : label.name
		return (
			<div className='cardLabel' style={labelStyle}>{name}</div>
		)
	}
}

class Description extends React.Component<TrelloInterfacesProps.ICardDataProps, any> {
	public nameInput: HTMLElement
	constructor (props) {
		super(props)
		this.finishEdit = this.finishEdit.bind(this)
		this.handleChange = this.handleChange.bind(this)
		this.state = {desc: this.props.cardData.desc}
	}

	public finishEdit (event) {
		this.setState({desc: event.target.value})
		ipcRenderer.send('trelloUpdateCard', this.props.cardData.id, [
			['desc', this.state.desc]
		])
	}

	public componentDidUpdate () {
		autosize.update(this.nameInput)
	}

	public handleChange (event) {
		this.setState({desc: event.target.value})
	}

	public componentWillReceiveProps () {
		this.setState({desc: this.props.cardData.desc})
	}

	public render () {
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

class Name extends React.Component<TrelloInterfacesProps.ICardDataProps, any> {
	public nameInput: HTMLElement
	constructor (props) {
		super(props)
		this.finishEdit = this.finishEdit.bind(this)
		this.handleChange = this.handleChange.bind(this)
		this.state = {name: this.props.cardData.name}
	}

	public finishEdit (event) {
		this.setState({name: event.target.value})
		if (this.state.name.length > 1) {
			ipcRenderer.send('trelloUpdateCard', this.props.cardData.id, [
				['name', this.state.name]
			])
		}
	}

	public componentDidUpdate () {
		autosize.update(this.nameInput)
	}

	public handleChange (event) {
		this.setState({name: event.target.value})
	}

	public componentWillReceiveProps () {
		this.setState({name: this.props.cardData.name})
	}

	public render () {
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

class DueDate extends React.Component<TrelloInterfacesProps.ICardDataProps, any> {
	constructor (props) {
		super(props)
		this.onChange = this.onChange.bind(this)
		this.state = {isChecked: false}
	}

	public onChange (event: React.FormEvent<HTMLInputElement>) {
		ipcRenderer.send('trelloUpdateCard', cardId, [['dueComplete', event.currentTarget.checked]])
		this.setState({isChecked: event.currentTarget.checked})
	}

	public componentWillReceiveProps (nextProps) {
		this.setState({isChecked: nextProps.cardData.dueComplete})
	}

	public render () {
		const classes = ['dueLabel']
		const due = this.props.cardData.due
		// handle non set due date
		if (due === null) { return null }
		const date = new Date(due)
		const today = new Date()
		let dateString = ` ${date.getDate()}. ${date.getMonth() + 1}. ${today.getFullYear() === date.getFullYear() ? '' : date.getFullYear()}`
		const clock = ` - ${date.getHours()}:${date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes()}`
		if (this.state.isChecked) {
			classes.push('dueComplete')
		} else {
			switch (HelperUI.returnDueState(date.getTime())) {
			case HelperUI.DueStates.overdueNear:
				classes.push('dueOverdueNear')
				dateString += clock
				break
			case HelperUI.DueStates.overdue:
				classes.push('dueOverdue')
				break
			case HelperUI.DueStates.near:
				classes.push('dueNear')
				dateString += clock
				break
			case HelperUI.DueStates.later:
				break
			default:
				throw new Error(`Wrong date on card with id ${this.props.cardData.id}`)
			}
		}
		return (
			<div className={classes.join(' ')}>
				<FontAwesomeIcon icon={['far', 'calendar']}/>
				{dateString}
				<input type='checkbox' onChange={this.onChange} checked={this.state.isChecked}/>
			</div>
		)
	}
}
