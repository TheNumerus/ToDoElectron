import * as autosize from 'autosize'
import {Event, ipcRenderer, remote} from 'electron'
import * as React from 'react'
import * as Sortable from 'sortablejs'
import {URL} from 'url'
import * as connCheck from './connectionChecker'
import {DueStates, HelperUI} from './HelperUI'
import {ImageOptions} from './trelloApi'
import {TrelloInterfacesProps} from './trelloInterfacesProps'
const boardId = new URL(window.location.href).searchParams.get('id')
const globalProperties = remote.require('./globalProperties').default

class ListComponent extends React.Component<any, TrelloInterfacesProps.IListProps> {
	constructor (props) {
		super(props)
		this.addSortable = this.addSortable.bind(this)
	}

	public addSortable (input) {
		if (input !== null) {
			Sortable.create(input, {group: 'cards', animation: 150, ghostClass: 'cardGhost'})
		}
	}

	public render () {
		const elements = this.props.listData.cards.map((card) =>
			<CardComponent key={card.id} cardData={card}/>
		)
		return (
			<div className='listComponent'>
				<ListName listData={this.props.listData}/>
				<div className='cardContainer' ref={(input) => { this.addSortable(input) }} id={this.props.listData.id}>
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
	}

	public finishEdit (event) {
		if (event.target.value === '') {
			this.setState({clicked: false})
		} else {
			this.setState({name: '', clicked: false})
			ipcRenderer.send('trelloAddList', {name: event.target.value, idBoard: boardId})
		}
	}

	public componentDidUpdate () {
		autosize.update(this.nameInput)
		if (this.state.clicked) {
			this.nameInput.focus()
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
							autosize(input)
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
		this.state = {name: this.props.listData.name}
	}

	public finishEdit (event) {
		this.setState({name: event.target.value})
		ipcRenderer.send('trelloUpdateList', this.props.listData.id, [
			['name', this.state.name]
		])
	}

	public componentDidUpdate () {
		autosize.update(this.nameInput)
	}

	public handleChange (event) {
		this.setState({name: event.target.value})
	}

	public componentWillReceiveProps () {
		this.setState({name: this.props.listData.name})
	}

	public render () {
		return <textarea className='listTitle'
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

class CardComponent extends React.Component<TrelloInterfacesProps.ICardDataProps, any> {
	constructor (props) {
		super(props)
		this.openCard = this.openCard.bind(this)
	}

	public openCard () {
		ipcRenderer.send('trelloOpenCard', this.props.cardData.id)
	}
	public render () {
		const card = this.props.cardData
		// setting these variables to null, so React won't create any DOM element
		let labels = null
		let desc = null
		let comments = null
		let attachments = null
		let imageCover = null
		if (card.placeholder === undefined) {
			labels = card.labels.map((label) => {
				return <Label key={label.id} labelData={label}/>
			})

			if (card.desc !== '') {
				desc = <div><i className='fa fa-align-left cardInfoDescIcon'></i></div>
			}

			if (card.badges.comments > 0) {
				comments = <div><i className='fa fa-comment-o'></i>{card.badges.comments}</div>
			}

			if (card.badges.attachments > 0) {
				attachments = <div><i className='fa fa-paperclip'></i>{card.badges.attachments}</div>
			}

			if (card.idAttachmentCover && card.attachments) {
				let attachment
				card.attachments.forEach((element) => {
					if (element.id === card.idAttachmentCover) {
						attachment = element
					}
				})
				imageCover = <ImageCover attData={attachment}/>
			}
		}
		return (
			<div className='cardComponent' onClick={this.openCard} id={card.id} draggable={true}>
				{imageCover}
				{labels}
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

class DueDate extends React.Component<TrelloInterfacesProps.ICardDataProps, {}> {
	public render () {
		const classes = ['dueLabel']
		const due = this.props.cardData.due
		// handle non set due date
		if (due === null) { return null }
		const date = new Date(due)
		const today = new Date()
		let dateString = ` ${date.getDate()}. ${date.getMonth() + 1}. ${today.getFullYear() === date.getFullYear() ? '' : date.getFullYear()}`
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
			<div className={classes.join(' ')}><i className='fa fa-calendar-o'></i>{dateString}</div>
		)
	}
}

class CheckListBadge extends React.Component<TrelloInterfacesProps.IBadgesProps, any> {
	public render () {
		if (this.props.badges.checkItems === 0) {
			return null
		}
		return (
			<div className={this.props.badges.checkItemsChecked === this.props.badges.checkItems ? 'checkFull' : ''}>
				<i className='fa fa-check-square-o'></i>
				{` ${this.props.badges.checkItemsChecked}/${this.props.badges.checkItems}`}
			</div>
		)
	}
}

class ImageCover extends React.Component<TrelloInterfacesProps.IAttachmentProps, any> {
	public render () {
		const extension = this.props.attData.url.match(/.+([.].+)/)
		const filename = `${this.props.attData.id}${extension[1]}`
		const pathToImage = `${globalProperties.getPath()}attachments/${filename}`
		return (
			<div style={{backgroundColor: this.props.attData.edgeColor}}>
				<img className='imgCover' src={pathToImage}/>
			</div>
		)
	}
}

class Label extends React.Component<TrelloInterfacesProps.ILabelProps, any> {
	public render () {
		const label = this.props.labelData
		// if the color is set to null, the label will not show on board view
		if (label.color === null) { return null }
		const labelStyle = {
			backgroundColor: HelperUI.returnColor(label.color)
		}
		return (
			<div className='cardLabel' style={labelStyle}>{label.name}</div>
		)
	}
}

export default class Board extends React.Component<{}, any> {
	constructor (props) {
		super(props)
		this.update = this.update.bind(this)
		this.goBack = this.goBack.bind(this)
		// add empty list to speed up the process later
		this.state = { boardData: { name: '', values: [{cards: [], name: '', id: ''}] } }
	}

	public handleIpc () {
		ipcRenderer.on('trelloGetBoardData-reply', (event: Event, boardData) => {
			this.setState({boardData})
			// stop spinning refresh icon
			document.querySelector('#updateIcon').classList.remove('fa-spin')
		})

		ipcRenderer.on('trelloSetBackground', (event: Event, imagePath: string, options) => {
			// handle solid color background
			if (imagePath[0] === '#') {
				document.querySelector('body').style.backgroundColor = imagePath
			} else {
				switch (options.preview) {
				case true:
					document.querySelector('body').background = imagePath
					break
				case false:
					document.querySelector('body').background = imagePath
					break
				default:
					throw new Error('wrong option type in trelloSetBackground')
				}
			}
		})
	}

	public async componentDidMount () {
		this.handleBackgroundScroll()
		this.handleIpc()
		ipcRenderer.send('trelloGetBoardData', boardId, {forceUpdate: false, refresh: false})
		if (connCheck.getState()) {
			this.update()
		}
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
		document.querySelector('#updateIcon').classList.add('fa-spin')
		ipcRenderer.send('trelloGetBoardData', boardId, {forceUpdate: true, refresh: true})
	}

	public goBack () {
		ipcRenderer.send('goBack')
	}

	public render () {
		const components = this.state.boardData.values.map((list) => {
			return <ListComponent listData={list} key={list.id}/>
		})
		document.title = `${this.state.boardData.name} | To-Do app in Electron`
		return (
			<div id='lists'>
				<div id='headerBoard'>
					<button onClick={this.goBack} className='buttonHeader'><i className='fa fa-arrow-left fa-2x'></i></button>
					<BoardName boardData={this.state.boardData}/>
					<button onClick={this.update} className='buttonHeader' style={{marginLeft: 'auto'}}><i id='updateIcon' className='fa fa-refresh fa-2x'></i></button>
				</div>
				<div className='boardRoot'>
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
		const updater = [
			{key: 'name', value: this.state.name}
		]
		ipcRenderer.send('trelloUpdateBoard', this.props.boardData.id, updater)
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
	}

	public finishEdit (event) {
		if (event.target.value === '') {
			this.setState({clicked: false})
		} else {
			this.setState({name: '', clicked: false})
			ipcRenderer.send('trelloAddCard', {name: event.target.value, idList: this.props.listId, idBoard: boardId})
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
							autosize(input)
						}}/>
				</div>
			)
		} else {
			return <button className='addCardButton' onClick={this.clicked}>Click to add new card</button>
		}
	}
}
