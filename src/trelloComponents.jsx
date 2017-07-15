const React = require('react')
class BoardButton extends React.Component {
	render () {
		return <button className={`${this.props.class} button`} id={this.props.id}>{this.props.name}</button>
	}
}

class ListComponent extends React.Component {
	render () {
		return (
			<div className='listComponent'>
				<h3 className='listTitle'>{this.props.name}</h3>
				<div className='cardContainer' id={this.props.id}></div>
				<button className={`button`}>+</button>
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
			<div className='cardComponent' id={card.id}>
				<div className='cardLabel' style={labelStyle}>{name}</div>
				<div className='cardTitle'>{card.name}</div>
			</div>
		)
	}
}

module.exports = {
	BoardButton: BoardButton,
	ListComponent: ListComponent,
	CardComponent: CardComponent
}
