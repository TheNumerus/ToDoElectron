const React = require('react')
const Sortable = require('sortablejs')
const ipcRenderer = require('electron').ipcRenderer
class BoardButton extends React.Component {
	constructor (props) {
		super(props)
		this.openBoard = this.openBoard.bind(this)
	}

	openBoard () {
		ipcRenderer.send('trelloOpenBoard', this.props.id)
	}

	render () {
		return <button onClick={this.openBoard} className={`${this.props.class} button`} id={this.props.id}>{this.props.name}</button>
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
		var labels = card.labels.map((label) => {
			return <Label labelData={label}/>
		})
		return (
			<div className='cardComponent' onClick={this.openCard} id={card.id} draggable='true'>
				{labels}
				<div className='cardTitle'>{card.name}</div>
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
