import HelperUI from './HelperUI'
const ReactDOM = require('react-dom')
const React = require('react')
const globalProperties = require('electron').remote.require('./globalProperties')
const {shell, ipcRenderer} = require('electron')
class CardDetail extends React.Component {
	render () {
		var cardData = this.props.cardData
		document.title = `${cardData.name} | To-Do app in Electron`
		var checklists = null
		if (cardData.checklistData !== undefined) {
			checklists = cardData.checklistData.map((data) => {
				return <Checklist checklistData={data}/>
			})
		}
		var comments = null
		if (cardData.comments !== undefined) {
			comments = cardData.comments.map(data => {
				return <Comment commentData={data}/>
			})
		}
		var labels = null
		if (cardData.labels !== undefined) {
			labels = cardData.labels.map(data => {
				return <Label labelData={data}/>
			})
		}
		return (
			<div className='detailsContainer'>
				<div id='headerBoard'>
					<button onClick={this.goBack}><i className='fa fa-arrow-left fa-2x'></i></button>
					<button onClick={this.update} style={{marginLeft: 'auto'}}><i id='updateIcon' className='fa fa-refresh fa-2x'></i></button>
				</div>
				<div className='data'>
					<div className='mainColumn'>
						<Name name={cardData.name}/>
						<Description desc={cardData.desc}/>
						<div>{labels}</div>
						<p>{cardData.due}</p>
						{checklists}
						{comments}
					</div>
					<Attachments attData={cardData.attachments}/>
				</div>
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
			? <i className="fa fa-check-square"></i>
			: <i className="fa fa-square"></i>
		return (
			<div>
				{icon}<span>{this.props.data.name}</span>
			</div>
		)
	}
}
class Comment extends React.Component {
	render () {
		var commentData = this.props.commentData
		return (
			<div>
				<span style={{fontSize: '150%'}}>{commentData.memberCreator.fullName}</span>
				<span>{commentData.data.text}</span>
			</div>
		)
	}
}
class ImageAttachment extends React.Component {
	openImage (path) {
		shell.openExternal(path)
	}
	render () {
		var filename = this.props.imageData.url.match(/\/([\S][^/]+[.][\w]+)$/)[1]
		var path = globalProperties.path.get() + filename
		return (
			<div className='att'>
				<div>{this.props.imageData.name}</div>
				<img onClick={(e) => this.openImage(path)} className='attThumb' src={path}/>
			</div>
		)
	}
}

class Attachments extends React.Component {
	render () {
		var attachments = null
		if (this.props.attData !== undefined) {
			attachments = this.props.attData.map(data => {
				return <ImageAttachment imageData={data}/>
			})
		}
		return (
			<div className='attContainer'>
				<h3>Attachments</h3>
				{attachments}
			</div>
		)
	}
}

class Label extends React.Component {
	render () {
		var label = this.props.labelData
		const labelStyle = {
			backgroundColor: HelperUI.returnColor(label.color)
		}
		return (
			<div className='cardLabel' style={labelStyle}>{label.name}</div>
		)
	}
}

class Description extends React.Component {
	render () {
		return (
			<div>{this.props.desc}</div>
		)
	}
}

class Name extends React.Component {
	render () {
		return (
			<h1>{this.props.name}</h1>
		)
	}
}

module.exports = CardDetail
