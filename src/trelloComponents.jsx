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
		const labelStyle = {
			backgroundColor: this.props.label.color
		}
		return (
			<div className='cardComponent' id={this.props.id}>
				<div className='cardLabel' style={labelStyle}>{this.props.label.name}</div>
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
