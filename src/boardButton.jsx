import React from 'react'
class BoardButton extends React.Component {
	render () {
		return <button id={this.props.id}>{this.props.name}</button>
	}
}
module.exports = {
	BoardButton: BoardButton
}
