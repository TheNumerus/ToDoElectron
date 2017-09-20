const React = require('react')
const Sortable = require('sortablejs')
const ipcRenderer = require('electron').ipcRenderer
class BoardButton extends React.Component {
	render () {
		return <button className={`${this.props.class} button`} id={this.props.id}>{this.props.name}</button>
	}
}

class ListComponent extends React.Component {
	constructor (props) {
		super(props)
		this.handleAddCard = this.handleAddCard.bind(this)
		this.state = {cards: this.props.cards}
	}

	handleAddCard () {
		this.state.cards.push({name: 'new card'})
		ipcRenderer.send('trelloAddCard', this.props.id)
	}

	render () {
		var elements = this.state.cards.map((card) =>
			<CardComponent card={card}/>
		)
		// TODO fix bug with sortable and refreshing
		return (
			<div className='listComponent'>
				<h3 className='listTitle'>{this.props.name}</h3>
				<div className='cardContainer' ref={(input) => { Sortable.create(input, {group: 'cards', animation: 150, ghostClass: 'card-ghost'}) }} id={this.props.id}>{elements}</div>
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
		var hasLabel = card.labels.length > 0
		const labelStyle = hasLabel
		? {
			backgroundColor: card.labels[0].color
		}
		: {
			display: 'none'
		}
		var name = hasLabel ? card.labels[0].name : ''
		return (
			<div className='cardComponent' onClick={this.openCard} id={card.id} draggable='true'>
				<div className='cardLabel' style={labelStyle}>{name}</div>
				<div className='cardTitle'>{card.name}</div>
			</div>
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
			<button className='button' onClick={this.handleClick}><i className="fa fa-plus" aria-hidden="true"></i></button>
		)
	}
}

module.exports = {
	BoardButton: BoardButton,
	ListComponent: ListComponent,
	CardComponent: CardComponent,
	Board: Board
}
