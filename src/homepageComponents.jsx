const React = require('react')
const ipcRenderer = require('electron').ipcRenderer
const globalProperties = require('./globalProperties')

class AppInfoBar extends React.Component {
	render () {
		return (
			<div className='bottomInfo'>
				Version {globalProperties.appVersion} | Node.js {process.versions.node} | Chromium {process.versions.chrome} | Electron {process.versions.electron}
			</div>
		)
	}
}

class TrelloModule extends React.Component {
	constructor (props) {
		super(props)
		this.authorize = this.authorize.bind(this)
		this.getUserInfo = this.getUserInfo.bind(this)
		this.getBoards = this.getBoards.bind(this)
		this.state = {data: ''}
	}

	authorize () {
		ipcRenderer.send('trelloAuthorize')
	}

	getUserInfo () {
		ipcRenderer.send('trelloGetAllUserInfo')
		ipcRenderer.on('trelloGetAllUserInfo-reply', (event, value) => {
			this.setState({data: JSON.stringify(value)})
		})
	}

	getBoards () {
		ipcRenderer.send('trelloGetBoards')
		ipcRenderer.on('trelloGetBoards-reply', (event, boards) => {
			var boardComponents = boards.map((board) => {
				return <BoardButton name={board.name} id={board.id}/>
			})
			this.setState({data: boardComponents})
		})
	}

	render () {
		return (
			<div className='homeModule'>
				<div className='moduleTitle'>
					<i className='fa fa-trello'></i> Trello
				</div>
				<button className='button' onClick={this.authorize}>Authorize Trello</button>
				<button className='button' onClick={this.getUserInfo}>Get all user info</button>
				<button className='button' onClick={this.getBoards}>Get boards</button>
				<div>{this.state.data}</div>
			</div>
		)
	}
}

class BoardButton extends React.Component {
	constructor (props) {
		super(props)
		this.openBoard = this.openBoard.bind(this)
	}

	openBoard () {
		ipcRenderer.send('trelloOpenBoard', this.props.id)
	}

	render () {
		return <button onClick={this.openBoard} className='button' id={this.props.id}>{this.props.name}</button>
	}
}

class GoogleModule extends React.Component {
	render () {
		return (
			<div className='homeModule'>
				<div className='moduleTitle'>
					<i className='fa fa-google'></i> Google Calendar - coming soon
				</div>
			</div>
		)
	}
}

class OfflineModule extends React.Component {
	render () {
		return (
			<div className='homeModule'>
				<div className='moduleTitle'>
					<i className='fa fa-sticky-note '></i> Offline notes - coming soon
				</div>
			</div>
		)
	}
}

class HelperModule extends React.Component {
	constructor (props) {
		super(props)
		this.clearCache = this.clearCache.bind(this)
	}

	clearCache () {
		ipcRenderer.send('clearCache')
	}

	render () {
		return (
			<div className='homeModule'>
				<div className='moduleTitle'>
					<i className='fa fa-info-circle'></i> Helper
				</div>
				<button className='button' onClick={this.clearCache}>Clear cache</button>
			</div>
		)
	}
}

class Homepage extends React.Component {
	render () {
		ipcRenderer.send('readyToShow')
		return (
			<div>
				<h1 className="title">ToDoElectron</h1>
				<TrelloModule/>
				<GoogleModule/>
				<OfflineModule/>
				<HelperModule/>
				<AppInfoBar/>
			</div>
		)
	}
}

module.exports = {
	Homepage: Homepage
}
