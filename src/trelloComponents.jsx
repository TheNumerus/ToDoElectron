const React = require('react')
class BoardButton extends React.Component {
	render () {
		return <button className={`${this.props.class} button`} id={this.props.id}>{this.props.name}</button>
	}
}

class ListComponent extends React.Component {
	render () {
		var elements = this.props.cards.map((card) =>
			<CardComponent card={card}/>
		)
		return (
			<div className='listComponent'>
				<h3 className='listTitle'>{this.props.name}</h3>
				<div className='cardContainer' id={this.props.id}>{elements}</div>
				<button className={`button`}><i className="fa fa-plus-square-o" aria-hidden="true"></i></button>
			</div>
		)
	}
}

class CardComponent extends React.Component {
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
			<div className='cardComponent' id={card.id} draggable='true'>
				<div className='cardLabel' style={labelStyle}>{name}</div>
				<div className='cardTitle'>{card.name}</div>
			</div>
		)
	}
}

class Board extends React.Component {
	render () {
		// render empty lists
		var lists = {ids: [], components: []}
		this.props.boardData.values.forEach((list) => {
			var element = <ListComponent cards={list.cards} name={list.name} id={list.id} key={list.id}/>
			lists.components.push(element)
			// get ids for later use
			lists.ids.push(list.id)
		}, this)
		return (
			<div className='boardRoot'>{lists.components}</div>
		)
	}
}

module.exports = {
	BoardButton: BoardButton,
	ListComponent: ListComponent,
	CardComponent: CardComponent,
	Board: Board
}
