const React = require('react')
class BoardButton extends React.Component {
	render () {
		return <button className={this.props.class} id={this.props.id}>{this.props.name}</button>
	}
}

class ListComponent extends React.Component {
	render () {
		return (
			<div className='listComponent'>
				<h3 className='listTitle'>{this.props.name}</h3>
				<div className='cardContainer' id={this.props.id}></div>
			</div>
		)
	}
}

class CardComponent extends React.Component {
	render () {
		return (
			<div className='cardComponent' id={this.props.id}>
				<div className='cardTitle'>{this.props.name}</div>
			</div>
		)
	}
}

module.exports = {
	BoardButton: BoardButton,
	ListComponent: ListComponent,
	CardComponent: CardComponent
}
