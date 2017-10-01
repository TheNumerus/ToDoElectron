const React = require('react')
const Sortable = require('sortablejs')
const ipcRenderer = require('electron').ipcRenderer

class ListComponent extends React.Component {
	constructor (props) {
		super(props)
		this.handleAddCard = this.handleAddCard.bind(this)
		this.addSortable = this.addSortable.bind(this)
		this.state = {cards: this.props.cards}
	}

	handleAddCard () {
		this.state.cards.push({name: 'new card'})
		ipcRenderer.send('trelloAddCard', this.props.id)
	}
	addSortable (input) {
		if (input !== null) {
			Sortable.create(input, {group: 'cards', animation: 150, ghostClass: 'cardGhost'})
		}
	}

	render () {
		// TODO set state only in board, so the board would rerender automaticly without calling the reactDOM. render multiple times
		// this.setState({cards: this.props.cards})
		var elements = this.state.cards.map((card) =>
			<CardComponent card={card}/>
		)
		// TODO fix bug with sortable and refreshing
		// update 25.9 - now refreshing, but it doesn't rerender
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
	}

	openCard () {
		ipcRenderer.send('trelloOpenCard', this.props.card.id)
	}
	render () {
		var card = this.props.card
		var labels = card.labels.map((label) => {
			return <Label labelData={label}/>
		})
		var checks = <div style={{display: 'none'}}></div>
		if (card.badges.checkItems !== 0) {
			checks = <div><i className="fa fa-check-square-o"></i>{` ${card.badges.checkItemsChecked}/${card.badges.checkItems}`}</div>
		}

		var desc = <div style={{display: 'none'}}></div>
		if (card.desc !== '') {
			desc = <div><i className="fa fa-align-left cardInfoDescIcon"></i></div>
		}

		var due = <div style={{display: 'none'}}></div>
		if (card.due !== null) {
			var date = new Date(card.due)
			var dateString = ` ${date.getDate()}.${date.getMonth() + 1}.`
			due = <div><i className="fa fa-calendar-o"></i>{dateString}</div>
		}

		var commnents = <div style={{display: 'none'}}></div>
		if (card.badges.comments > 0) {
			commnents = <div><i className="fa fa-comment-o"></i>{card.badges.comments}</div>
		}

		var attachments = <div style={{display: 'none'}}></div>
		if (card.badges.attachments > 0) {
			commnents = <div><i className="fa fa-paperclip"></i>{card.badges.attachments}</div>
		}
		return (
			<div className='cardComponent' onClick={this.openCard} id={card.id} draggable='true'>
				{labels}
				<div className='cardTitle'>{card.name}</div>
				<div className='cardInfo'>{due}{desc}{checks}{commnents}{attachments}</div>
			</div>
		)
	}
}

class Label extends React.Component {
	returnColor (color) {
		switch (color) {
		case 'red':
			return '#eb5a46'
		case 'yellow':
			return '#f2d600'
		case 'purple':
			return '#c377e0'
		case 'green':
			return '#61bd4f'
		case 'blue':
			return '#0079bf'
		case 'sky':
			return '#00c2e0'
		case 'orange':
			return '#ffab4a'
		case 'pink':
			return '#ff80ce'
		case 'lime':
			return '#51e898'
		case 'black':
			return '#4d4d4d'
		default:
			return 'rgba(0,0,0,0)'
		}
	}
	render () {
		var label = this.props.labelData
		// if the color is set to null, the label will not show on board view
		if (label.color === null) { return (<div style={{visibility: 'hidden'}}></div>) }
		const labelStyle = {
			backgroundColor: this.returnColor(label.color)
		}
		return (
			<div className='cardLabel' style={labelStyle}>{label.name}</div>
		)
	}
}

class Board extends React.Component {
	render () {
		var components = this.props.boardData.values.map((list) => {
			return <ListComponent cards={list.cards} name={list.name} id={list.id} key={list.id}/>
		})
		return (
			<div className='boardRoot'>{components}</div>
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
