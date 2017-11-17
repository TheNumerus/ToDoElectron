import HelperUI from './HelperUI'
import autosize from 'autosize'
const React = require('react')
const Sortable = require('sortablejs')
const ipcRenderer = require('electron').ipcRenderer
const URL = require('url').URL
const boardId = new URL(window.location.href).searchParams.get('id')
const globalProperties = require('electron').remote.require('./globalProperties').default
const connCheck = require('./connectionChecker')

class ListComponent extends React.Component {
	constructor (props) {
		super(props)
		this.handleAddCard = this.handleAddCard.bind(this)
		this.addSortable = this.addSortable.bind(this)
	}

	handleAddCard () {
		this.props.onAddCard(this.props.listData.id)
	}
	addSortable (input) {
		if (input !== null) {
			Sortable.create(input, {group: 'cards', animation: 150, ghostClass: 'cardGhost'})
		}
	}

	render () {
		var elements = this.props.listData.cards.map((card) =>
			<CardComponent key={card.id} card={card}/>
		)
		return (
			<div className='listComponent'>
				<ListName listData={this.props.listData}/>
				<div className='cardContainer' ref={(input) => { this.addSortable(input) }} id={this.props.listData.id}>
					{elements}
					<AddCardButton handleClick={this.handleAddCard} listId={this.props.listData.id}/>
				</div>
			</div>
		)
	}
}

class AddableList extends React.Component {
	constructor (props) {
		super(props)
		this.state = {clicked: false, name: ''}
		this.clicked = this.clicked.bind(this)
		this.finishEdit = this.finishEdit.bind(this)
		this.handleChange = this.handleChange.bind(this)
	}

	clicked () {
		this.setState({clicked: true})
	}

	finishEdit (event) {
		this.setState({name: event.target.value})
		ipcRenderer.send('trelloAddList', {name: event.target.value, idBoard: boardId})
	}

	componentDidUpdate () {
		autosize.update(this.nameInput)
	}

	handleChange (event) {
		this.setState({name: event.target.value})
	}

	render () {
		var element = this.state.clicked
			? <textarea rows='1'
				onChange={this.handleChange}
				value={this.state.name}
				onBlur={this.finishEdit}
				ref={(input) => {
					this.nameInput = input
					autosize(input)
				}}/>
			: <button onClick={this.clicked}>Click to add card</button>
		return (
			<div className='listComponent'>
				{element}
			</div>
		)
	}
}

class ListName extends React.Component {
	constructor (props) {
		super(props)
		this.finishEdit = this.finishEdit.bind(this)
		this.handleChange = this.handleChange.bind(this)
		this.state = {name: this.props.listData.name}
	}

	finishEdit (event) {
		this.setState({name: event.target.value})
		ipcRenderer.send('trelloUpdateList', this.props.listData.id, [
			['name', this.state.name]
		])
	}

	componentDidUpdate () {
		autosize.update(this.nameInput)
	}

	handleChange (event) {
		this.setState({name: event.target.value})
	}

	componentWillReceiveProps () {
		this.setState({name: this.props.listData.name})
	}

	render () {
		return <textarea className='listTitle'
			rows='1'
			onChange={this.handleChange}
			value={this.state.name}
			onBlur={this.finishEdit}
			ref={(input) => {
				this.nameInput = input
				autosize(input)
			}}/>
	}
}

class CardComponent extends React.Component {
	constructor (props) {
		super(props)
		this.openCard = this.openCard.bind(this)
	}

	openCard () {
		ipcRenderer.send('trelloOpenCard', this.props.card.id)
	}
	render () {
		var card = this.props.card
		// setting these variables to null, so React won't create any DOM element
		var labels = null
		var checks = null
		var desc = null
		var due = null
		var comments = null
		var attachments = null
		var imageCover = null
		if (card.placeholder === undefined) {
			labels = card.labels.map((label) => {
				return <Label key={label.id} labelData={label}/>
			})

			if (card.badges.checkItems !== 0) {
				checks = <div><i className="fa fa-check-square-o"></i>{` ${card.badges.checkItemsChecked}/${card.badges.checkItems}`}</div>
			}

			if (card.desc !== '') {
				desc = <div><i className="fa fa-align-left cardInfoDescIcon"></i></div>
			}

			if (card.badges.comments > 0) {
				comments = <div><i className="fa fa-comment-o"></i>{card.badges.comments}</div>
			}

			if (card.badges.attachments > 0) {
				attachments = <div><i className="fa fa-paperclip"></i>{card.badges.attachments}</div>
			}

			if (card.idAttachmentCover && card.attachments) {
				var attachment
				card.attachments.forEach((element) => {
					if (element.id === card.idAttachmentCover) {
						attachment = element
					}
				})
				imageCover = <ImageCover attData={attachment}/>
			}
		}
		return (
			<div className='cardComponent' onClick={this.openCard} id={card.id} draggable='true'>
				{imageCover}
				{labels}
				<div className='cardTitle'>{card.name}</div>
				<div className='cardInfo'>{due}
					<DueDate cardData={card}/>
					{desc}{checks}{comments}{attachments}
				</div>
			</div>
		)
	}
}
class DueDate extends React.Component {
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
			case HelperUI.dueStates.overdueNear:
				classes.push('dueOverdueNear')
				dateString += clock
				break
			case HelperUI.dueStates.overdue:
				classes.push('dueOverdue')
				break
			case HelperUI.dueStates.near:
				classes.push('dueNear')
				dateString += clock
				break
			case HelperUI.dueStates.later:
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

class ImageCover extends React.Component {
	render () {
		var extension = this.props.attData.url.match(/.+([.].+)/)
		var filename = `${this.props.attData.id}${extension[1]}`
		var pathToImage = globalProperties.getPath() + filename
		return (
			<div style={{backgroundColor: this.props.attData.edgeColor}}>
				<img className='imgCover' src={pathToImage}/>
			</div>
		)
	}
}

class Label extends React.Component {
	render () {
		var label = this.props.labelData
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

export default class Board extends React.Component {
	constructor (props) {
		super(props)
		this.addCardToList = this.addCardToList.bind(this)
		this.update = this.update.bind(this)
		this.goBack = this.goBack.bind(this)
		// add empty list to speed up the process later
		this.state = { boardData: { name: '', values: [{cards: [], name: '', id: ''}] } }
	}

	handleIpc () {
		ipcRenderer.on('trelloGetBoardData-reply', (event, boardData, imagePath) => {
			this.setState({boardData: boardData})
			// stop spinning refresh icon
			document.querySelector('#updateIcon').classList.remove('fa-spin')
		})

		ipcRenderer.on('trelloSetBackground', (event, imagePath) => {
		// handle solid color background
			if (imagePath[0] === '#') {
				document.querySelector('body').style.backgroundColor = imagePath
			} else {
				document.querySelector('body').background = imagePath
			}
		})
	}

	async componentDidMount () {
		this.handleBackgroundScroll()
		this.handleIpc()
		ipcRenderer.send('trelloGetBoardData', boardId, false)
		if (connCheck.state) {
			this.update()
		}
	}

	handleBackgroundScroll () {
		var target = document.querySelector('.boardRoot')
		target.addEventListener('wheel', (e) => {
			console.log(e)
			if (target === e.target) {
				e.preventDefault()
				window.scrollBy({behavior: 'smooth', left: e.deltaY * 5, top: 0})
			}
		})
	}

	addCardToList (id) {
		this.setState((prevState) => {
			for (var i = 0; i < prevState.boardData.values.length; i++) {
				if (prevState.boardData.values[i].id === id) {
					prevState.boardData.values[i].cards.push({name: 'new card', placeholder: true})
				}
			}
			return {
				cards: prevState
			}
		})
		ipcRenderer.send('trelloAddCard', id)
	}

	update () {
		document.querySelector('#updateIcon').classList.add('fa-spin')
		ipcRenderer.send('trelloGetBoardData', boardId, true)
	}

	goBack () {
		ipcRenderer.send('goBack')
	}

	render () {
		var components = this.state.boardData.values.map((list) => {
			return <ListComponent onAddCard={this.addCardToList} listData={list} key={list.id}/>
		})
		document.title = `${this.state.boardData.name} | To-Do app in Electron`
		return (
			<div id='lists'>
				<div id='headerBoard'>
					<button onClick={this.goBack} className='button back header'><i className='fa fa-arrow-left fa-2x'></i></button>
					<BoardName boardData={this.state.boardData}/>
					<button onClick={this.update} className='button header' style={{marginLeft: 'auto'}}><i id='updateIcon' className='fa fa-refresh fa-2x'></i></button>
				</div>
				<div className='boardRoot'>
					{components}
					<AddableList/>
				</div>
			</div>
		)
	}
}

class BoardName extends React.Component {
	constructor (props) {
		super(props)
		this.finishEdit = this.finishEdit.bind(this)
		this.handleChange = this.handleChange.bind(this)
		this.state = {name: ''}
	}

	finishEdit (event) {
		this.setState({name: event.target.value})
		ipcRenderer.send('trelloUpdateBoard', this.props.boardData.id, [
			['name', this.state.name]
		])
	}

	handleChange (event) {
		this.setState({name: event.target.value})
	}

	componentWillReceiveProps (nextProps) {
		if (nextProps.boardData) {
			this.setState({name: nextProps.boardData.name})
		}
	}

	render () {
		return <input id='boardName'
			type='text'
			onChange={this.handleChange}
			value={this.state.name}
			onBlur={this.finishEdit}/>
	}
}

class AddCardButton extends React.Component {
	constructor (props) {
		super(props)
		this.handleClick = this.handleClick.bind(this)
	}
	handleClick () {
		this.props.handleClick()
		ipcRenderer.send('trelloAddCart', this.props.listId)
	}

	render () {
		return (
			<button className='addCardButton' onClick={this.handleClick}><i className="fa fa-plus" aria-hidden="true"></i></button>
		)
	}
}
