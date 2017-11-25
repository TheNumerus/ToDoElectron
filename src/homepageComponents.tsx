import {ipcRenderer, remote} from 'electron'
import * as path from 'path'
import * as React from 'React'
import {HelperUI} from './HelperUI'
import {TrelloInterfacesProps} from './trelloInterfacesProps'
const globalProperties = remote.require('./globalProperties').default

class AppInfoBar extends React.Component<any, any> {
	public render () {
		return (
			<div className='bottomInfo'>
				Version {globalProperties.getAppVersion()} | Node.js {process.versions.node} | Chromium {process.versions.chrome} | Electron {process.versions.electron}
			</div>
		)
	}
}

class TrelloModule extends React.Component<any, any> {
	constructor (props) {
		super(props)
		this.authorize = this.authorize.bind(this)
		this.getUserInfo = this.getUserInfo.bind(this)
		this.getBoards = this.getBoards.bind(this)
		this.handleIpc()
		this.state = {data: '', updating: false}
	}

	public authorize () {
		ipcRenderer.send('trelloAuthorize')
	}
	public handleIpc () {
		ipcRenderer.on('trelloGetAllUserInfo-reply', (event, value) => {
			this.setState({data: JSON.stringify(value)})
		})
		ipcRenderer.on('trelloGetBoards-reply', (event, boards) => {
			const boardComponents = boards.values.map((board) => {
				return <BoardButton boardData={board} key={board.id}/>
			})
			this.setState({data: boardComponents, updating: false})
		})
	}
	public getUserInfo () {
		ipcRenderer.send('trelloGetAllUserInfo')
	}

	public componentWillReceiveProps (nextprops) {
		if (nextprops.authorized && !this.state.updating) {
			ipcRenderer.send('trelloGetBoards')
			this.setState({updating: true})
		}
	}

	public getBoards () {
		if (!this.state.updating) {
			ipcRenderer.send('trelloGetBoards')
			this.setState({updating: true})
		}
	}

	public render () {
		const showAuthBtns = this.props.authorized
		const authorizedEelements = showAuthBtns ? [<button className='button' onClick={this.getUserInfo}>Get all user info</button>,
			<button className='button' onClick={this.getBoards}>Get boards</button>]
			: null
		const authorizeButton = showAuthBtns ? null
			: <button className='button' onClick={this.authorize}>Authorize Trello</button>
		const authorized = showAuthBtns ? <span style={{fontSize: '50%'}}>- authorized</span>
			: null
		return (
			<div className='homeModule'>
				<div className='moduleTitle'>
					<i className='fa fa-trello'></i> Trello {authorized}
				</div>
				{authorizeButton}
				{authorizedEelements}
				<div className='dataContainer'>{this.state.data}</div>
			</div>
		)
	}
}

class BoardButton extends React.Component<TrelloInterfacesProps.IBoardProps, any> {
	constructor (props) {
		super(props)
		this.openBoard = this.openBoard.bind(this)
	}

	public openBoard () {
		ipcRenderer.send('trelloOpenBoard', this.props.boardData.id)
	}

	public render () {
		let element = null
		if (this.props.boardData.prefs.backgroundImage === null) {
			element = <div className='boardBtnCover' style={{backgroundColor: this.props.boardData.prefs.backgroundColor}}></div>
		} else {
			const bgrImgUrl = this.props.boardData.prefs.backgroundImageScaled[0].url
			const bgrImg = bgrImgUrl.match(/.*\/(.*[.].*)/)[1]
			element = <img className='boardBtnCover' src={path.join(globalProperties.getPath(), 'background', 'thumbs', bgrImg)}/>
		}
		return (
			<div className='boardBtn' onClick={this.openBoard}>
				{element}
				<div className='boardBtnCaption'><span>{this.props.boardData.name}</span></div>
			</div>
		)
	}
}

class GoogleModule extends React.Component<any, any> {
	public render () {
		return (
			<div className='homeModule'>
				<div className='moduleTitle'>
					<i className='fa fa-google'></i> Google Calendar - coming soon
				</div>
			</div>
		)
	}
}

class OfflineModule extends React.Component<any, any> {
	public render () {
		return (
			<div className='homeModule'>
				<div className='moduleTitle'>
					<i className='fa fa-sticky-note '></i> Offline notes - coming soon
				</div>
			</div>
		)
	}
}

class HelperModule extends React.Component<any, any> {
	constructor (props) {
		super(props)
		this.clearCache = this.clearCache.bind(this)
		this.clearImageCache = this.clearImageCache.bind(this)
	}

	public clearCache () {
		ipcRenderer.send('clearCache')
	}

	public clearImageCache () {
		ipcRenderer.send('clearImageCache')
	}

	public render () {
		return (
			<div className='homeModule'>
				<div className='moduleTitle'>
					<i className='fa fa-info-circle'></i> Helper
				</div>
				<button className='button' onClick={this.clearCache}>Clear cache</button>
				<button className='button' onClick={this.clearImageCache}>Clear image cache</button>
			</div>
		)
	}
}

export default class Homepage extends React.Component<any, any> {
	constructor (props) {
		super(props)
		this.clearCache = this.clearCache.bind(this)
		this.state = {trelloAuthorized: false}
		this.getAuthorization()
		ipcRenderer.send('readyToShow')
	}

	public getAuthorization () {
		ipcRenderer.send('trelloIsAuthorized')
		ipcRenderer.on('trelloIsAuthorized-reply', (event, data) => {
			if (data) {
				ipcRenderer.send('trelloGetBoards')
			}
			this.setState({trelloAuthorized: data})
		})
	}

	public clearCache () {
		ipcRenderer.send('clearCache')
	}

	public render () {
		return (
			<div>
				<Header/>
				<TrelloModule authorized={this.state.trelloAuthorized}/>
				<GoogleModule/>
				<OfflineModule/>
				<HelperModule/>
				<AppInfoBar/>
			</div>
		)
	}
}

class Header extends React.Component<any, any> {
	constructor (props) {
		super(props)
		this.goToSettings = this.goToSettings.bind(this)
	}

	public goToSettings () {
		ipcRenderer.send('goToSettings')
	}

	public render () {
		return (
			<div className='titleHeader'>
				<h1>ToDoElectron</h1>
				<button className='buttonHeader' onClick={this.goToSettings} style={{marginLeft: 'auto'}}>
					<i className='fa fa-wrench fa-3x'></i>
				</button>
			</div>
		)
	}
}
