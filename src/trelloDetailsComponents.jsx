import HelperUI from './HelperUI'
const React = require('react')
const globalProperties = require('electron').remote.require('./globalProperties')
const {shell, ipcRenderer} = require('electron')
const URL = require('url').URL
const cardId = new URL(window.location.href).searchParams.get('id')
const connCheck = require('./connectionChecker')
class CardDetail extends React.Component {
	constructor (props) {
		super(props)
		this.state = {cardData: {name: ''}}
	}

	componentDidMount () {
		this.handleIpc()
		ipcRenderer.send('trelloGetCardData', cardId, false)
		if (connCheck.state) {
			/* I have to comment this shit because fucking JS somehow managed to merge two seperate function calls into one,
			 which returned comments and checklists twice. 
			this.update() */
		}
	}

	handleIpc () {
		ipcRenderer.on('trelloGetCardData-reply', (event, cardData) => {
			this.setState({cardData: cardData})
			// stop spinning refresh icon
			document.querySelector('#updateIcon').classList.remove('fa-spin')
		})
	}

	render () {
		var cardData = this.state.cardData
		document.title = `${cardData.name} | To-Do app in Electron`
		var checklists = null
		if (cardData.checklistData !== undefined) {
			checklists = cardData.checklistData.map((data) => {
				return <Checklist checklistData={data} key={data.id}/>
			})
		}
		var comments = null
		if (cardData.comments !== undefined) {
			comments = cardData.comments.map(data => {
				return <Comment commentData={data} key={data.id}/>
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
				<Header/>
				<div className='data'>
					<div className='mainColumn'>
						<Name cardData={cardData}/>
						<Description desc={cardData.desc}/>
						<div>{labels}</div>
						<DueDate due={cardData.due}/>
						{checklists}
						{comments}
					</div>
					<Attachments cardData={cardData}/>
				</div>
			</div>
		)
	}
}

class Header extends React.Component {
	constructor (props) {
		super(props)
		this.update = this.update.bind(this)
		this.goBack = this.goBack.bind(this)
	}

	goBack () {
		ipcRenderer.send('goBack')
	}

	update () {
		document.querySelector('#updateIcon').classList.add('fa-spin')
		ipcRenderer.send('trelloGetCardData', cardId, true)
	}

	render () {
		return (
			<div id='headerBoard'>
				<button onClick={this.goBack}><i className='fa fa-arrow-left fa-2x'></i></button>
				<button onClick={this.update} style={{marginLeft: 'auto'}}><i id='updateIcon' className='fa fa-refresh fa-2x'></i></button>
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
	constructor (props) {
		super(props)
		this.changeCover = this.changeCover.bind(this)
	}

	openImage (path) {
		shell.openExternal(path)
	}

	changeCover (idCover) {
		this.props.changeCover(idCover)
	}

	render () {
		var extension = this.props.attData.url.match(/.+([.].+)/)
		var filename = `${this.props.attData.id}${extension[1]}`
		var path = globalProperties.path.get() + filename
		var date = new Date(this.props.attData.date)
		var dateString = `${date.getUTCDate()}.${date.getUTCMonth() + 1}.${date.getUTCFullYear()} - ${date.getUTCHours()}:${date.getUTCMinutes()}`
		return (
			<div className='att'>
				<div className='attControl'>
					<div className='attName'>{this.props.attData.name}</div>
					<div className='attDate'>{dateString}</div>
					<div className='attButtonBar'>
						<button>Comment</button>
						<button>Remove</button>
						<button onClick={(e) => this.changeCover(this.props.attData.id)}>{this.props.isCover ? 'Remove cover' : 'Set as cover'}</button>
					</div>
				</div>
				<img onClick={(e) => this.openImage(path)} className='attThumb' src={path}/>
			</div>
		)
	}
}

class Attachments extends React.Component {
	constructor (props) {
		super(props)
		this.changeCover = this.changeCover.bind(this)
		this.state = {currentCover: this.props.cardData.idAttachmentCover}
	}

	changeCover (idCover) {
		var changedCover
		if (idCover === this.state.currentCover) {
			changedCover = ''
		} else {
			changedCover = idCover
		}
		this.setState({currentCover: changedCover})
		ipcRenderer.send('trelloUpdateCard', this.props.cardData.id, [
			['idAttachmentCover', changedCover]
		])
	}

	componentWillReceiveProps (nextProps) {
		if (nextProps.cardData.idAttachmentCover !== this.state.currentCover) {
			this.setState({currentCover: nextProps.cardData.idAttachmentCover})
		}
	}

	render () {
		var attachments = null
		if (this.props.cardData.attachments !== undefined) {
			attachments = this.props.cardData.attachments.map(data => {
				var isCover = data.id === this.state.currentCover
				return <ImageAttachment attData={data} key={data.id} isCover={isCover} changeCover={this.changeCover}/>
			})
		} else {
			return null
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
	constructor (props) {
		super(props)
		this.startEdit = this.startEdit.bind(this)
		this.finishEdit = this.finishEdit.bind(this)
		this.handleChange = this.handleChange.bind(this)
		this.state = {editing: false, name: this.props.cardData.name}
	}

	startEdit () {
		this.setState({editing: true})
	}

	finishEdit (event) {
		this.setState({editing: false, name: event.target.value})
		ipcRenderer.send('trelloUpdateCard', this.props.cardData.id, [
			['name', this.state.name]
		])
	}

	componentDidUpdate () {
		if (this.state.editing) {
			this.nameInput.focus()
		}
	}

	handleChange (event) {
		this.setState({name: event.target.value})
	}

	componentWillReceiveProps () {
		this.setState({name: this.props.cardData.name})
	}

	render () {
		if (this.state.editing) {
			return <input className='cardNameInput' type='text' value={this.state.name} onBlur={(e) => this.finishEdit(e)} ref={(input) => { this.nameInput = input }} onChange={(e) => this.handleChange(e)}/>
		} else {
			return <div className='cardName' onClick={(e) => this.startEdit()}>{this.state.name}</div>
		}
	}
}

class DueDate extends React.Component {
	render () {
		if (this.props.due === null) { return null }
		var today = new Date()
		var date = new Date(this.props.due)
		var dateString = ` ${date.getDate()}.${date.getMonth() + 1}.`
		return (
			<div className={today > date ? 'dueLabel' : ''}><i className='fa fa-calendar-o'></i>{dateString}</div>
		)
	}
}

module.exports = CardDetail
