import * as FontAwesomeIcon from '@fortawesome/react-fontawesome'
import {ipcRenderer, remote} from 'electron'
import * as path from 'path'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as HomeComponents from './components/homeComponents'
import * as connCheck from './connectionChecker'
import * as HelperUI from './HelperUI'
import {TrelloTypes} from './trelloInterfaces'
import {TrelloInterfacesProps} from './trelloInterfacesProps'
const globalProperties = remote.require('./globalProperties')

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
		this.getBoards = this.getBoards.bind(this)
		this.state = {boards: [], updating: false, thumbsLoaded: false}
	}

	public authorize () {
		ipcRenderer.send('trelloAuthorize')
	}
	public componentDidMount () {
		ipcRenderer.on('trelloGetBoards-reply', (event, boards) => {
			this.setState({boards, updating: false})
		})
		ipcRenderer.on('home-refresh-boardthumbs', () => {
			this.setState({thumbsLoaded: true})
		})
		// update if connection found
		if (connCheck.getState() && !this.state.updating && this.props.authorized) {
			ipcRenderer.send('trelloGetBoards', {forceUpdate: true})
			this.setState({updating: true})
		}
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
		let button
		let boards
		let authorizedText
		if (this.props.authorized && this.state.boards !== undefined) {
			button = <button className='button' onClick={this.getBoards}>Get boards</button>
			boards = this.state.boards.map((board: TrelloTypes.BoardData) => {
				if (board.prefs.backgroundImage === null) {
					return <HomeComponents.BoardButton boardData={board} key={board.id}/>
				} else {
					return <HomeComponents.BoardButtonImage boardData={board} key={board.id} imgDownloaded={this.state.thumbsLoaded}/>
				}
			})
			boards.push(<AddBoardButton key='add'/>)
			authorizedText = <span style={{fontSize: '50%'}}>- authorized</span>
		} else if (this.props.authorized && this.state.boards.length === 0) {
			boards = [<AddBoardButton key='add'/>]
		} else {
			button = <button className='button' onClick={this.authorize}>Authorize Trello</button>
			boards = null
			authorizedText = null
		}
		return (
			<div className='homeModule'>
				<div className='moduleTitle'>
					<FontAwesomeIcon icon={['fab', 'trello']}/> Trello {authorizedText}
				</div>
				{button}
				<div className='dataContainer'>{boards}</div>
			</div>
		)
	}
}

class AddBoardButton extends React.Component<any, any> {
	constructor (props) {
		super(props)
		this.createBoard = this.createBoard.bind(this)
	}

	public createBoard () {
		alert('Does nothing yet')
	}

	public render () {
		return (
			<div className='boardBtn' onClick={this.createBoard}>
				<div className='boardBtnCover' style={{backgroundColor: '#888'}}><FontAwesomeIcon icon='plus' size='4x' className='addBoardPlus'/></div>
				<div className='boardBtnCaption'><span>Create board</span></div>
			</div>
		)
	}
}

class GoogleModule extends React.Component<any, any> {
	public render () {
		return (
			<div className='homeModule'>
				<div className='moduleTitle'>
				<FontAwesomeIcon icon={['fab', 'google']}/> Google Calendar - coming soon
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
				<FontAwesomeIcon icon='sticky-note'/> Offline notes - coming soon
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
				<FontAwesomeIcon icon='info-circle'/> Helper
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
	}

	public componentDidMount () {
		ipcRenderer.send('readyToShow')
		ipcRenderer.send('trelloIsAuthorized')
		ipcRenderer.on('trelloIsAuthorized-reply', (event, isAuthorized) => {
			if (isAuthorized) {
				ipcRenderer.send('trelloGetBoards')
			}
			this.setState({trelloAuthorized: isAuthorized})
		})
	}

	public clearCache () {
		ipcRenderer.send('clearCache')
	}

	public render () {
		return (
			<div>
				<HomeComponents.Header/>
				<TrelloModule authorized={this.state.trelloAuthorized}/>
				<GoogleModule/>
				<OfflineModule/>
				<HelperModule/>
				<AppInfoBar/>
			</div>
		)
	}
}
