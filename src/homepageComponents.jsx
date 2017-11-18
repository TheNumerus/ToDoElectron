const React = require('react')
const ipcRenderer = require('electron').ipcRenderer
const globalProperties = require('electron').remote.require('./globalProperties').default

class AppInfoBar extends React.Component {
	render () {
		return (
			<div className='bottomInfo'>
				Version {globalProperties.getAppVersion()} | Node.js {process.versions.node} | Chromium {process.versions.chrome} | Electron {process.versions.electron}
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
				return <BoardButton boardData={board} id={board.id} key={board.id}/>
			})
			this.setState({data: boardComponents})
		})
	}

	render () {
		var showAuthBtns = this.props.authorized
		var authorizedEelements = showAuthBtns ? [<button className='button' onClick={this.getUserInfo}>Get all user info</button>,
			<button className='button' onClick={this.getBoards}>Get boards</button>]
			: null
		var authorizeButton = showAuthBtns ? null
			: <button className='button' onClick={this.authorize}>Authorize Trello</button>
		var authorized = showAuthBtns ? <span style={{fontSize: '50%'}}>- authorized</span>
			: null
		return (
			<div className='homeModule'>
				<div className='moduleTitle'>
					<i className='fa fa-trello'></i> Trello {authorized}
				</div>
				{authorizeButton}
				{authorizedEelements}
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
		ipcRenderer.send('trelloOpenBoard', this.props.boardData.id)
	}

	render () {
		return <button onClick={this.openBoard} className='button' id={this.props.boardData.id}>{this.props.boardData.name}</button>
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
		this.props.clearCache()
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

export default class Homepage extends React.Component {
	constructor (props) {
		super(props)
		this.clearCache = this.clearCache.bind(this)
		this.state = {trelloAuthorized: false}
		this.getAuthorization()
		ipcRenderer.send('readyToShow')
	}

	getAuthorization () {
		ipcRenderer.send('trelloIsAuthorized')
		ipcRenderer.on('trelloIsAuthorized-reply', (event, data) => {
			this.setState({trelloAuthorized: data})
		})
	}

	clearCache () {
		ipcRenderer.send('clearCache')
		this.getAuthorization()
	}

	render () {
		return (
			<div>
				<h1 className="title">ToDoElectron</h1>
				<TrelloModule authorized={this.state.trelloAuthorized}/>
				<GoogleModule/>
				<OfflineModule/>
				<HelperModule clearCache={this.clearCache}/>
				<AppInfoBar/>
			</div>
		)
	}
}
