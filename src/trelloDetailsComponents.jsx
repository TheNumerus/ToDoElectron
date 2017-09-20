const ReactDOM = require('react-dom')
const React = require('react')
const ipcRenderer = require('electron').ipcRenderer

class CardDetail extends React.Component {
	render () {
		var cardData = this.props.cardData
		return (
			<div>
				<h3>{cardData.name}</h3>
				<p>{cardData.desc}</p>
				<p>{JSON.stringify(cardData)}</p>
			</div>
		)
	}
}

module.exports = CardDetail
