import {BrowserWindow, Event, ipcMain} from 'electron'
import {OAuth} from 'oauth'
import * as path from 'path'
import {URL} from 'url'
import * as cacheModule from './cache'
import GlobalProperties from './globalProperties'
import * as TrelloApiIO from './trelloApiIO'
import * as TrelloApiNet from './trelloApiNet'
import {TrelloTypes} from './trelloInterfaces'
import * as windowManager from './windowManager'

// constants and variables for connection to trello api
const requestURL = 'https://trello.com/1/OAuthGetRequestToken'
const accessURL = 'https://trello.com/1/OAuthGetAccessToken'
const authorizeURL = 'https://trello.com/1/OAuthAuthorizeToken'
const oauth = new OAuth(requestURL, accessURL, GlobalProperties.getTrelloAppKey(), GlobalProperties.getTrelloSecretKey(), '1.0A', 'todoapp://trelloauth', 'HMAC-SHA1')
let verificationToken = ''
let homepageTrelloAuthEvent: Event = null
// store authentification window variable here, so we can close it from another function
let authorizeWindow: BrowserWindow

/**
 * Handler for ipc calls from renderer process
 */
function handleIpcCalls () {
	// #region ipc
	ipcMain.on('trelloAuthorize', () => {
		authorize()
	})

	/**
	 * Ok, so I'm writing a little bullshit. Since I don't know any other way to to do it,
	 * I'm just gonna write something terrible. Homepage should check on construction if trello
	 * is authenticated, so we store the event which came for later use. Then, when the authorize
	 * window closes, we send the reply to the same event, but this time with a true value.
	 * The thing is, we need to store the event as a module global variable, so we can access
	 * it from anothen function. I'm sorry if someone sees this code.  - TheNumerus 2017-10-14
	 */
	ipcMain.on('trelloIsAuthorized', (event) => {
		homepageTrelloAuthEvent = event
		event.sender.send('trelloIsAuthorized-reply', cacheModule.calls.trello.getUsed())
	})

	ipcMain.on('trelloGetAllUserInfo', async (event) => {
		event.sender.send('trelloGetAllUserInfo-reply', await TrelloApiNet.getAllUserInfo())
	})

	ipcMain.on('trelloGetBoards', async (event) => {
		const boards = cacheModule.calls.trello.getBoards()
		// handle empty cache and old cache
		if (cacheModule.calls.helper.checkInvalidity(boards)) {
			const json = await TrelloApiNet.getBoards()
			// format data for internal use
			// clean up first
			boards.values = []
			json.forEach((board) => {
				if (!board.closed) {
					boards.values.push({id: board.id, name: board.name, prefs: board.prefs})
				}
			})
			boards.date = Date.now()
			cacheModule.calls.trello.setBoards(boards)
			cacheModule.saveCache()
			windowManager.sendMessage('trelloGetBoards-reply', boards)
			// now download images in background
			boards.values.forEach((board: TrelloTypes.BoardData) => {
				if (board.prefs.backgroundImageScaled !== null) {
					TrelloApiNet.getImage(board.prefs.backgroundImageScaled[0].url, ImageOptions.backgroundThumb)
				}
			})
		} else {
			boards.values.forEach((board: TrelloTypes.BoardData) => {
				if (board.prefs.backgroundImageScaled !== null) {
					TrelloApiNet.getImage(board.prefs.backgroundImageScaled[0].url, ImageOptions.backgroundThumb)
				}
			})
			windowManager.sendMessage('trelloGetBoards-reply', boards)
		}
	})

	ipcMain.on('trelloGetBoardData', (event, boardId, options) => boardUpdate(event, boardId, options))

	ipcMain.on('trelloOpenBoard', (event, arg) => {
		windowManager.openURL('board.html?id=' + arg)
	})

	ipcMain.on('trelloAddCard', async (event, data) => {
		// TODO add offline card adding
		cacheModule.calls.trello.addCard(data)
		if (data.name !== '') {
			await TrelloApiNet.addCard(data)
			boardUpdate(event, data.idBoard, {forceUpdate: true, refresh: true})
		}
	})

	ipcMain.on('trelloAddList', async (event, data) => {
		if (data.name !== '') {
			await TrelloApiNet.addList(data)
			boardUpdate(event, data.idBoard, {forceUpdate: true, refresh: true})
		}
	})

	ipcMain.on('trelloGetCardData', async (event: Event, idCard: string) => {
		// TODO add update function
		const cardData: TrelloTypes.CardData = cacheModule.calls.trello.getCard(idCard)
		if (cardData.idChecklists.length === 0) {
			event.sender.send('trelloGetCardData-reply', cardData)
		}
		cardData.checklistData = []
		for (const checklist of cardData.idChecklists) {
			const json = await TrelloApiNet.getChecklist(checklist)
			cardData.checklistData.push(json)
		}
		if (cardData.badges.comments > 0) {
			cardData.comments = []
			const actions = await TrelloApiNet.getActions(idCard)
			actions.forEach((action: TrelloTypes.Action) => {
				if (action.type === 'commentCard') { cardData.comments.push(action) }
			})
		}
		event.sender.send('trelloGetCardData-reply', cardData)
	})

	ipcMain.on('trelloUpdateCard', async (event, idCard: string, options: TrelloTypes.UpdateOptions) => {
		TrelloApiNet.updateCard(idCard, options)
	})

	ipcMain.on('trelloUpdateBoard', async (event, idBoard: string, options: TrelloTypes.UpdateOptions) => {
		TrelloApiNet.updateBoard(idBoard, options)
	})

	ipcMain.on('trelloUpdateList', async (event, idList: string, options: TrelloTypes.UpdateOptions) => {
		TrelloApiNet.updateList(idList, options)
	})

	ipcMain.on('trelloOpenCard', (event, arg: string) => {
		windowManager.openURL('/trelloDetails.html?id=' + arg)
	})
	// #endregion ipc

	/**
	 * Gets all board data and sends it to renderer process
	 */
	async function getBoardData (boardId: string, boardData: TrelloTypes.BoardData, event: Event, refresh: boolean) {
		const json = await TrelloApiNet.getBoardData(boardId)
		if (!refresh) {
			// send background color right away
			getBackground(json.prefs, event)
		}
		boardData.name = json.name
		boardData.prefs = json.prefs
		boardData.values = json.lists
		// sort cards
		for (let i = 0; i < json.lists.length; i++) {
			boardData.values[i].cards = []
			json.cards.forEach((card) => {
				if (card.idList === boardData.values[i].id) {
					boardData.values[i].cards.push(card)
				}
			})
		}
		for (const listIndex in boardData.values) {
			for (const cardIndex in boardData.values[listIndex].cards) {
				if (boardData.values[listIndex].cards[cardIndex].badges.attachments > 0) {
					const attData = await TrelloApiNet.getAttachments(boardData.values[listIndex].cards[cardIndex].id)
					downloadAttachments(attData)
					boardData.values[listIndex].cards[cardIndex].attachments = attData
				}
			}
		}
		boardData.date = Date.now()
		cacheModule.calls.trello.setBoardData(boardId, boardData)
		cacheModule.saveCache()
		event.sender.send('trelloGetBoardData-reply', boardData)
	}

	async function getBackground (prefs: TrelloTypes.BoardPrefs, event: Event) {
		// download background if necessary
		if (prefs.backgroundImage !== null) {
			// we send blurry version for faster loading, in background we download full resolution image and then we send it
			const filename = prefs.backgroundImageScaled[0].url.match(/.*\/(.*)/)[1]
			const pathName = path.join(GlobalProperties.getPath(), 'background', 'thumbs', filename)
			event.sender.send('trelloSetBackground', pathName, {preview: true})
			event.sender.send('trelloSetBackground', await TrelloApiNet.getImage(prefs.backgroundImage, ImageOptions.background), {preview: false})
		} else {
			event.sender.send('trelloSetBackground', prefs.backgroundColor, {preview: false})
		}
	}

	async function downloadAttachments (attachmentData: TrelloTypes.Attachment[]) {
		attachmentData.forEach((attachment) => {
			if (attachment.isUpload) {
				TrelloApiNet.getImage(attachment, ImageOptions.attachment)
			}
		})
	}

	function boardUpdate (event: Event, boardId: string, options: TrelloTypes.PageUpdateOptions) {
		const boardData = cacheModule.calls.trello.getBoardData(boardId)
		if (options.forceUpdate === true) {
			getBoardData(boardId, boardData, event, options.refresh)
		} else if (cacheModule.calls.helper.checkInvalidity(boardData)) {
			getBoardData(boardId, boardData, event, options.refresh)
		} else {
			getBackground(boardData.prefs, event)
			event.sender.send('trelloGetBoardData-reply', boardData)
		}
	}
}

/**
 * Function for authorizing Trello API
 */
export function authorize () {
	oauth.getOAuthRequestToken((error: Error, token: string, tokenSecret: string, results) => {
		if (error) {throw error}
		verificationToken = tokenSecret
		authorizeWindow = new BrowserWindow({
			parent: windowManager.getMainWindow(),
			modal: true,
			width: 640,
			height: 768,
			webPreferences: {
				nodeIntegration: false,
				webSecurity: false,
				allowRunningInsecureContent: true
			}})
		authorizeWindow.setMenuBarVisibility(false)
		authorizeWindow.loadURL(`${authorizeURL}?oauth_token=${token}&name=${GlobalProperties.getAppName()}&expires=never&scope=read,write,account`)
	})
}
/**
 * Callback function for authorizing Trello API
 */
export function authorizeCallback (url: string) {
	// close authentification window, because we don't need it at this point
	authorizeWindow.close()
	// parse oauth values
	const query = new URL(url)
	const oauthToken = query.searchParams.get('oauth_token')
	const oauthVerifier = query.searchParams.get('oauth_verifier')
	oauth.getOAuthAccessToken(oauthToken, verificationToken, oauthVerifier, (error: Error, accessToken: string, accessTokenSecret: string, results) => {
		if (error) {throw error}
		// regenerate trello api access with new access tokens
		cacheModule.calls.trello.setToken(accessToken)
		cacheModule.calls.trello.setUsed(true)
		callHomepageTrelloModule()
		TrelloApiNet.initialize()
		cacheModule.saveCache()
	})
}

function callHomepageTrelloModule () {
	homepageTrelloAuthEvent.sender.send('trelloIsAuthorized-reply', cacheModule.calls.trello.getUsed())
}

export function initialize () {
	handleIpcCalls()
	TrelloApiIO.initialize()
	TrelloApiNet.initialize()
}

export enum ImageOptions {
	background,
	attachment,
	backgroundThumb
}