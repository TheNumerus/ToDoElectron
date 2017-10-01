const ReactDOM = require('react-dom')
const React = require('react')
const ipcRenderer = require('electron').ipcRenderer

class CardDetail extends React.Component {
	render () {
		var cardData = this.props.cardData
		var checklists = ''
		if (cardData.checklistData !== undefined) {
			checklists = cardData.checklistData.map((data) => {
				return <Checklist checklistData={data}/>
			})
		}
		return (
			<div>
				<h3>{cardData.name}</h3>
				<p>{cardData.desc}</p>
				<p>{JSON.stringify(cardData.labels)}</p>
				<p>{cardData.due}</p>
				<p>{cardData.idChecklist}</p>
				<p>{JSON.stringify(cardData)}</p>
				{checklists}
			</div>
		)
	}
}

class Checklist extends React.Component {
	render () {
		var checklistData = this.props.checklistData
		// items store their order in a variable so we must sort them
		var sorted = checklistData.checkItems.sort((a, b) => {
			return a.pos - b.pos
		})
		var items = sorted.map((item) => {
			return <ChecklistItem data={item}/>
		})
		return (
			<div>
				<h5>{checklistData.name}</h5>
				{items}
			</div>
		)
	}
}

class ChecklistItem extends React.Component {
	render () {
		var icon = this.props.data.state === 'complete'
			? <i class="fa fa-check-square" aria-hidden="true"></i>
			: <i class="fa fa-square" aria-hidden="true"></i>
		return (
			<div>
				{icon}<span>{this.props.data.name}</span>
			</div>
		)
	}
}

module.exports = CardDetail
