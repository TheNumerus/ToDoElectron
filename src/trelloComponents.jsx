import HelperUI from './HelperUI'
const React = require('react')
const Sortable = require('sortablejs')
const ipcRenderer = require('electron').ipcRenderer
const URL = require('url').URL
const boardId = new URL(window.location.href).searchParams.get('id')
const globalProperties = require('electron').remote.require('./globalProperties')
const connCheck = require('./connectionChecker')

class ListComponent extends React.Component {
	constructor (props) {
		super(props)
		this.handleAddCard = this.handleAddCard.bind(this)
		this.addSortable = this.addSortable.bind(this)
	}

	handleAddCard () {
		this.props.onAddCard(this.props.id)
	}
	addSortable (input) {
		if (input !== null) {
			Sortable.create(input, {group: 'cards', animation: 150, ghostClass: 'cardGhost'})
		}
	}

	render () {
		var elements = this.props.cards.map((card) =>
			<CardComponent key={card.id} card={card}/>
		)
		return (
			<div className='listComponent'>
				<h3 className='listTitle'>{this.props.name}</h3>
				<div className='cardContainer' ref={(input) => { this.addSortable(input) }} id={this.props.id}>{elements}</div>
				<AddCardButton handleClick={this.handleAddCard} listId={this.props.id}/>
			</div>
		)
	}
}

class CardComponent extends React.Component {
	constructor (props) {
		super(props)
		this.openCard = this.openCard.bind(this)
		this.addHoverAnim = this.addHoverAnim.bind(this)
		this.delHoverAnim = this.delHoverAnim.bind(this)
	}

	addHoverAnim (card) {
		if (card.target.classList.contains('cardComponent')) {
			card.target.classList.remove('animCardOut')
			card.target.classList.add('animCardIn')
		}
	}

	delHoverAnim (card) {
		if (card.target.classList.contains('cardComponent')) {
			card.target.classList.remove('animCardIn')
			card.target.classList.add('animCardOut')
		}
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

			if (card.due !== null) {
				var date = new Date(card.due)
				var dateString = ` ${date.getDate()}.${date.getMonth() + 1}.`
				due = <div><i className="fa fa-calendar-o"></i>{dateString}</div>
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
			<div className='cardComponent' onClick={this.openCard} onMouseEnter={(e) => this.addHoverAnim(e)} onMouseLeave={(e) => this.delHoverAnim(e)} id={card.id} draggable='true'>
				{imageCover}
				{labels}
				<div className='cardTitle'>{card.name}</div>
				<div className='cardInfo'>{due}{desc}{checks}{comments}{attachments}</div>
			</div>
		)
	}
}

class ImageCover extends React.Component {
	render () {
		var filename = this.props.attData.url.match(/\/([\S][^/]+[.][\w]+)$/)[1]
		var pathToImage = globalProperties.path.get() + filename
		return (
			<div>
				<img width='310' src={pathToImage}/>
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

class Board extends React.Component {
	constructor (props) {
		super(props)
		this.addCardToList = this.addCardToList.bind(this)
		this.update = this.update.bind(this)
		this.goBack = this.goBack.bind(this)
		this.handleIpc()
		this.state = { boardData: { values: [] } }
		ipcRenderer.send('trelloGetBoardData', boardId, false)
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

	/**
	 * force update when opening board, if connection is available
	 */
	componentDidMount () {
		connCheck.checkConnection().then((result) => {
			if (result === true) {
				this.update()
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
			return <ListComponent onAddCard={this.addCardToList} cards={list.cards} name={list.name} id={list.id} key={list.id}/>
		})
		return (
			<div id='lists'>
				<div id='headerBoard'>
					<button onClick={this.goBack} className='button back header'><i className='fa fa-arrow-left fa-2x'></i></button>
					<h1 id='boardName' style={{marginLeft: '10px'}}>{this.state.boardData.name}</h1>
					<button onClick={this.update} className='button header' style={{marginLeft: 'auto'}}><i id='updateIcon' className='fa fa-refresh fa-2x'></i></button>
				</div>
				<div className='boardRoot'>{components}</div>
			</div>
		)
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

module.exports = {
	ListComponent: ListComponent,
	CardComponent: CardComponent,
	Board: Board
}
