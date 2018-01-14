import * as FontAwesomeIcon from '@fortawesome/react-fontawesome'
import * as autosize from 'autosize'
import {Event, ipcRenderer, remote} from 'electron'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import Sortable = require('sortablejs')
import {URL} from 'url'
import * as connCheck from './connectionChecker'
import * as HelperUI from './HelperUI'
import { ISettings } from './settings'
import {ImageOptions} from './trelloApi'
import { TrelloTypes } from './trelloInterfaces'
import {TrelloInterfacesProps} from './trelloInterfacesProps'
const globalProperties = remote.require('./globalProperties').default
let boardId

class ListComponent extends React.Component<TrelloInterfacesProps.IListProps, any> {
	public cardContainer
	constructor (props) {
		super(props)
		this.handleSort = this.handleSort.bind(this)
	}
	public componentDidMount () {
		if (this.cardContainer !== null) {
			Sortable.create(this.cardContainer, {animation: 150, draggable: '.cardComponent', filter: '.addCardInputContainer',
				ghostClass: 'cardGhost', group: 'cards', onSort: this.handleSort})
		}
	}
	public handleSort (event) {
		// this event fires twice when moving card between lists, so we filter that event out
		if (event.to.id === this.props.listData.id) {
			const card: HTMLElement = event.item
			const ids = {
				idBoard: boardId,
				idList: event.target.id,
				idCard: card.id
			}
			ipcRenderer.send('trelloSortCard', {ids, newIndex: event.newIndex, oldIndex: event.oldIndex})
		}
	}

	public render () {
		const elements = this.props.listData.cards.map((card) =>
			<CardComponent key={card.id} cardData={card} settings={this.props.settings} changePage={this.props.changePage}/>
		)
		return (
			<div className='listComponent' id={this.props.listData.id}>
				<ListName listData={this.props.listData}/>
				<div className='cardContainer' ref={(input) => {this.cardContainer = input}} id={this.props.listData.id}>
					{elements}
					<AddCardButton listId={this.props.listData.id}/>
				</div>
			</div>
		)
	}
}

class AddableList extends React.Component<any, any> {
	public nameInput: HTMLElement
	constructor (props) {
		super(props)
		this.state = {clicked: false, name: ''}
		this.clicked = this.clicked.bind(this)
		this.finishEdit = this.finishEdit.bind(this)
		this.handleChange = this.handleChange.bind(this)
	}

	public clicked () {
		this.setState({clicked: true})
		autosize(this.nameInput)
	}

	public finishEdit (event) {
		if (event.target.value === '') {
			this.setState({clicked: false})
		} else {
			this.setState({name: '', clicked: false})
			ipcRenderer.send('trelloAddList', {name: event.target.value, idBoard: boardId})
		}
	}

	public handleChange (event) {
		this.setState({name: event.target.value})
	}

	public render () {
		if (this.state.clicked) {
			return (
				<div className='listComponent'>
					<textarea rows={1}
						className='addableInput list'
						onChange={this.handleChange}
						value={this.state.name}
						onBlur={this.finishEdit}
						ref={(input) => {
							this.nameInput = input
						}}/>
				</div>
			)
		} else {
			return (
				<div className='listComponent'>
					<button className='addListButton' onClick={this.clicked}>Click to add new list</button>
				</div>
			)
		}
	}
}

class ListName extends React.Component<TrelloInterfacesProps.IListProps, any> {
	public nameInput: HTMLElement
	constructor (props) {
		super(props)
		this.finishEdit = this.finishEdit.bind(this)
		this.handleChange = this.handleChange.bind(this)
		this.updateSize = this.updateSize.bind(this)
		this.state = {autosize: false, name: this.props.listData.name}
	}

	public finishEdit (event) {
		this.setState({name: event.target.value})
		if (this.props.listData.name !== event.target.value) {
			ipcRenderer.send('trelloUpdateList', {idBoard: boardId, idList: this.props.listData.id}, [
				['name', event.target.value]
			])
		}
	}

	public componentDidMount () {
		if (this.props.listData.name.length > 30) {
			autosize(this.nameInput)
			this.setState({autosize: true})
		}
	}

	public updateSize () {
		if (!this.state.autosize) {
			autosize(this.nameInput)
		}
	}

	public componentDidUpdate () {
		autosize.update(this.nameInput)
	}

	public handleChange (event) {
		this.setState({name: event.target.value})
	}

	public componentWillReceiveProps (nextProps) {
		this.setState({name: nextProps.listData.name})
	}

	public render () {
		return <textarea className='listTitle'
			rows={1}
			onChange={this.handleChange}
			value={this.state.name}
			onBlur={this.finishEdit}
			onFocus={this.updateSize}
			ref={(input) => {
				this.nameInput = input
			}}/>
	}
}

class CardComponent extends React.Component<TrelloInterfacesProps.ICardDataProps, any> {
	constructor (props) {
		super(props)
		this.openCard = this.openCard.bind(this)
	}

	public openCard () {
		this.props.changePage('trelloCard', this.props.cardData.id)
	}
	public render () {
		const card = this.props.cardData
		// setting these variables to null, so React won't create any DOM element
		let desc = null
		let comments = null
		let attachments = null
		let imageCover = null
		if (card.placeholder === undefined) {
			if (card.desc !== '') {
				desc = <div><FontAwesomeIcon icon='align-left'/></div>
			}

			if (card.badges.comments > 0) {
				comments = <div><FontAwesomeIcon icon={['far', 'comment']}/>{card.badges.comments}</div>
			}

			if (card.badges.attachments > 0) {
				attachments = <div><FontAwesomeIcon icon='paperclip'/>{card.badges.attachments}</div>
			}

			if (card.idAttachmentCover && card.attachments) {
				let attachment
				card.attachments.forEach((element) => {
					if (element.id === card.idAttachmentCover) {
						attachment = element
					}
				})
				imageCover = <ImageCover attData={attachment} settings={this.props.settings}/>
			}
		}
		return (
			<div className='cardComponent' onClick={this.openCard} id={card.id} draggable={true}>
				{imageCover}
				<LabelContainer labels={card.labels} settings={this.props.settings}/>
				<div className='cardTitle'>{card.name}</div>
				<div className='cardInfo'>
					<DueDate cardData={card}/>
					{desc}
					<CheckListBadge badges={card.badges}/>
					{comments}
					{attachments}
				</div>
			</div>
		)
	}
}

const DueDate: React.SFC<TrelloInterfacesProps.ICardDataProps> = (props) => {
	const classes = ['dueLabel']
	const due = props.cardData.due
	// handle non set due date
	if (due === null) { return null }
	const date = new Date(due)
	const today = new Date()
	let dateString = ` ${date.getDate()}. ${date.getMonth() + 1}. ${today.getFullYear() === date.getFullYear() ? '' : date.getFullYear()}`
	const clock = ` - ${date.getHours()}:${date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes()}`
	if (props.cardData.dueComplete) {
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
			throw new Error(`Wrong date on card with id ${props.cardData.id}`)
		}
	}
	return (
		<div className={classes.join(' ')}><FontAwesomeIcon icon={['far', 'calendar']}/>{dateString}</div>
	)
}

const CheckListBadge: React.SFC<TrelloInterfacesProps.IBadgesProps> = (props) => {
	if (props.badges.checkItems === 0) {
		return null
	}
	return (
		<div className={props.badges.checkItemsChecked === props.badges.checkItems ? 'checkFull' : ''}>
			<FontAwesomeIcon icon={['far', 'check-square']}/>
			{` ${props.badges.checkItemsChecked}/${props.badges.checkItems}`}
		</div>
	)
}

const ImageCover: React.SFC<TrelloInterfacesProps.IAttachmentProps> = (props) => {
	if (!props.settings.showCardCoverImages) {
		return null
	}
	let extension: string = props.attData.url.match(/.+([.].+)/)[1]
	if (props.settings !== undefined && !props.settings.animateGIFs && extension === '.gif') {
		extension = '.png'
	}
	const filename = `${props.attData.id}${extension}`
	const pathToImage = `${globalProperties.getPath()}attachments/${filename}`
	return (
		<div style={{backgroundColor: props.attData.edgeColor}}>
			<img className='imgCover' src={pathToImage}/>
		</div>
	)
}

const LabelContainer: React.SFC<TrelloInterfacesProps.ILabelContainerProps> = (props) => {
	// sort labels by color
	props.labels.sort((a, b) => {
		// discard uncolored labels
		if (a.color === null || b.color === null) { return 0 }
		return HelperUI.returnLabelIndex(a.color) - HelperUI.returnLabelIndex(b.color)
	})
	// create labels
	const labels = props.labels.map((label) => {
		return <Label labelData={label} settings={props.settings} key={label.id}/>
	})
	return (
		<div className='labelContainer'>
			{labels}
		</div>
	)
}

const Label: React.SFC<TrelloInterfacesProps.ILabelProps> = (props) => {
	if (props.labelData.color === null) {
		return null
	}
	const style = { backgroundColor: HelperUI.returnColor(props.labelData.color) }
	let name = ''
	if (props.settings.labelNames) {
		name = props.labelData.name
	}
	return (
		<div className='cardLabel' style={style}>{name}</div>
	)
}

export default class Board extends React.Component<any, any> {
	public boardRoot
	public backgroundSet: boolean = false
	constructor (props) {
		super(props)
		this.backgroundSet = false
		this.update = this.update.bind(this)
		this.goBack = this.goBack.bind(this)
		this.addSortable = this.addSortable.bind(this)
		this.handleSort = this.handleSort.bind(this)
		boardId = this.props.idBoard
		// add empty list to speed up the process later
		this.handleIpc()
		this.state = { boardData: { name: '', values: [{cards: [], name: '', id: ''}] } , settings: {}, iconSpin: false}
	}

	public handleIpc () {
		ipcRenderer.on('trelloGetBoardData-reply', (event: Event, boardData) => {
			this.setState({boardData, iconSpin: false})
		})

		ipcRenderer.on('trelloSetBackground', (event: Event, imagePath: string, options) => {
			if (this.backgroundSet) { return }
			// handle solid color background
			if (imagePath[0] === '#') {
				document.body.style.background = imagePath
				this.backgroundSet =  true
			} else {
				imagePath = `url('${imagePath}')`.replace(/\\/g, '/')
				// background is broken for now
				document.body.style.backgroundRepeat = 'no-repeat'
				document.body.style.backgroundSize = 'cover'
				document.body.style.backgroundAttachment = 'fixed'
				switch (options.preview) {
				case true:
					document.body.style.backgroundImage = imagePath
					break
				case false:
					document.body.style.backgroundImage = imagePath
					this.backgroundSet = true
					break
				default:
					throw new Error('wrong option type in trelloSetBackground')
				}
			}
		})

		ipcRenderer.on('getSettings-reply', (event: Event, options: ISettings) => {
			this.setState({settings: options})
		})
	}

	public componentDidMount () {
		this.handleBackgroundScroll()
		ipcRenderer.send('trelloGetBoardData', boardId, {forceUpdate: false, refresh: false})
		ipcRenderer.send('getSettings')
		if (connCheck.getState()) {
			this.update()
		}
		if (this.boardRoot !== null) {
			Sortable.create(this.boardRoot, {animation: 150, onSort: this.handleSort})
		}
	}

	public componentWillUnmount () {
		document.body.style.background = '#FFFFFF'
	}

	public handleBackgroundScroll () {
		const target = document.querySelector('.boardRoot')
		target.addEventListener('wheel', (e) => {
			if (target === e.target) {
				e.preventDefault()
				window.scrollBy({behavior: 'smooth', left: e.deltaY * 5, top: 0})
			}
		})
	}

	public update () {
		this.setState({iconSpin: true})
		ipcRenderer.send('trelloGetBoardData', boardId, {forceUpdate: true, refresh: true})
	}

	public goBack () {
		this.props.changePage('home')
	}

	public addSortable (input) {
		if (input !== null) {
			Sortable.create(input, {animation: 150, onSort: this.handleSort})
		}
	}

	public handleSort (event) {
		const ids = {
			idBoard: boardId,
			idList: event.item.id
		}
		ipcRenderer.send('trelloSortList', {ids, newIndex: event.newIndex, oldIndex: event.oldIndex})
	}

	public render () {
		const components = this.state.boardData.values.map((list) => {
			return <ListComponent listData={list} key={list.id} settings={this.state.settings} changePage={this.props.changePage}/>
		})
		document.title = `${this.state.boardData.name} | To-Do app in Electron`
		return (
			<div id='lists'>
				<div id='headerBoard'>
					<button onClick={this.goBack} className='buttonHeader'><FontAwesomeIcon icon='chevron-left' size='2x'/></button>
					<BoardName boardData={this.state.boardData}/>
					<button onClick={this.update} className='buttonHeader' style={{marginLeft: 'auto'}}>
						<FontAwesomeIcon icon='sync' size='2x' spin={this.state.iconSpin}/>
					</button>
				</div>
				<div className='boardRoot' ref={(root) => {this.boardRoot = root}}>
					{components}
					<AddableList/>
				</div>
			</div>
		)
	}
}

class BoardName extends React.Component<any, any> {
	constructor (props) {
		super(props)
		this.finishEdit = this.finishEdit.bind(this)
		this.handleChange = this.handleChange.bind(this)
		this.state = {name: ''}
	}

	public finishEdit (event) {
		this.setState({name: event.target.value})
		ipcRenderer.send('trelloUpdateBoard', this.props.boardData.id, [
			['name', this.state.name]
		])
	}

	public handleChange (event) {
		this.setState({name: event.target.value})
	}

	public componentWillReceiveProps (nextProps) {
		if (nextProps.boardData) {
			this.setState({name: nextProps.boardData.name})
		}
	}

	public render () {
		return <input id='boardName'
			type='text'
			onChange={this.handleChange}
			value={this.state.name}
			onBlur={this.finishEdit}/>
	}
}

class AddCardButton extends React.Component<any, any> {
	public nameInput: HTMLElement
	constructor (props: any) {
		super(props)
		this.state = {clicked: false, name: ''}
		this.clicked = this.clicked.bind(this)
		this.finishEdit = this.finishEdit.bind(this)
		this.handleChange = this.handleChange.bind(this)
	}

	public clicked () {
		this.setState({clicked: true})
		autosize(this.nameInput)
	}

	public finishEdit (event) {
		if (event.target.value === '') {
			this.setState({clicked: false})
		} else {
			this.setState({name: '', clicked: false})
			ipcRenderer.send('trelloAddCard', {name: event.target.value, id: this.props.listId, idBoard: boardId})
		}
	}
	public componentDidUpdate () {
		if (this.state.clicked) {
			this.nameInput.focus()
		}
		autosize.update(this.nameInput)
	}

	public handleChange (event) {
		this.setState({name: event.target.value})
	}

	public componentWillUnmount () {
		autosize.destroy(this.nameInput)
	}

	public render () {
		if (this.state.clicked) {
			return (
				<div className='addCardInputContainer'>
					<textarea rows={1}
						className='addableInput card'
						onChange={this.handleChange}
						value={this.state.name}
						onBlur={this.finishEdit}
						ref={(input) => {
							this.nameInput = input
						}}/>
				</div>
			)
		} else {
			return <button className='addCardButton' onClick={this.clicked}>Click to add new card</button>
		}
	}
}
