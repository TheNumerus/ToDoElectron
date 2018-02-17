import {BrowserWindow, Event, ipcMain} from 'electron'
import {OAuth} from 'oauth'
import * as path from 'path'
import {URL} from 'url'
import * as cacheModule from './cache'
import * as GlobalProperties from './globalProperties'
import * as TrelloApiIO from './trelloApiIO'
import * as TrelloApiNet from './trelloApiNet'
import {TrelloTypes} from './trelloInterfaces'
import * as windowManager from './windowManager'

// constants and variables for connection to trello api
const requestURL = 'https://trello.com/1/OAuthGetRequestToken'
const accessURL = 'https://trello.com/1/OAuthGetAccessToken'
const authorizeURL = 'https://trello.com/1/OAuthAuthorizeToken'
let oauth
let verificationToken = ''
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

	ipcMain.on('trelloIsAuthorized', () => {
		windowManager.sendMessage('trelloIsAuthorized-reply', cacheModule.getTrelloAuthorized())
	})

	ipcMain.on('trelloGetAllUserInfo', async (event) => {
		event.sender.send('trelloGetAllUserInfo-reply', await TrelloApiNet.getAllUserInfo())
	})

	ipcMain.on('trelloGetBoards', async (event, options) => {
		let boards = cacheModule.getTrelloBoards()
		// handle empty cache and old cache
		if (cacheModule.checkInvalidity('boards') || (options !== undefined && options.forceUpdate)) {
			const json = await TrelloApiNet.getBoards()
			// format data for internal use
			// clean up first
			boards = []
			json.forEach((board) => {
				if (!board.closed) {
					boards.push(board)
				}
			})
			cacheModule.setTrelloBoards(boards)
			cacheModule.saveCache()
			windowManager.sendMessage('trelloGetBoards-reply', boards)
			// now download images in background
			getBoardThumbs(boards)
		} else {
			windowManager.sendMessage('trelloGetBoards-reply', boards)
			getBoardThumbs(boards)
		}
	})
	const getBoardThumbs = async (boards: TrelloTypes.BoardData[]) => {
		for (const board of boards) {
			if (board.prefs.backgroundImageScaled !== null) {
				await TrelloApiNet.getBackground(board.prefs.backgroundImageScaled[1].url, ImageOptions.backgroundThumb)
			}
		}
		windowManager.sendMessage('home-refresh-boardthumbs')
	}

	ipcMain.on('trelloGetBoardData', (event, boardId, options) => boardUpdate(event, boardId, options))

	ipcMain.on('trelloOpenBoard', (event, arg) => {
		windowManager.openURL('board.html?id=' + arg)
	})

	ipcMain.on('trelloAddCard', async (event, data) => {
		// TODO add offline card adding
		// cacheModule.calls.trello.addCard(data)
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
		const cardData: TrelloTypes.CardData = cacheModule.getTrelloCardById(idCard)
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
		// get all images
		downloadAttachments(cardData.attachments)
		event.sender.send('trelloGetCardData-reply', cardData)
	})

	ipcMain.on('trelloUpdateCard', async (event, idCard: string, options: TrelloTypes.UpdateOptions) => {
		TrelloApiNet.updateCard(idCard, options)
	})

	ipcMain.on('trelloUpdateBoard', async (event, idBoard: string, options: TrelloTypes.UpdateOptions) => {
		TrelloApiNet.updateBoard(idBoard, options)
	})

	ipcMain.on('trelloUpdateList', async (event, data, options: TrelloTypes.UpdateOptions) => {
		await TrelloApiNet.updateList(data.idList, options)
		boardUpdate(event, data.idBoard, {forceUpdate: true, refresh: true})
	})

	ipcMain.on('trelloUpdateChecklist', async (event, ids: TrelloTypes.CheckListUpdateIds, options: TrelloTypes.UpdateOptions) => {
		TrelloApiNet.updateCheckList(ids, options)
	})

	ipcMain.on('trelloOpenCard', (event, arg: string) => {
		windowManager.openURL('/trelloDetails.html?id=' + arg)
	})

	ipcMain.on('trelloSortCard', (event, arg: TrelloTypes.SortCard) => {
		const boardData = cacheModule.getTrelloBoardDataById(arg.ids.idBoard)
		// sort to top
		if (arg.newIndex === 0) {
			TrelloApiNet.updateCard(arg.ids.idCard, [['pos', 'top'], ['idList', arg.ids.idList]])
			return
		}
		let listData: TrelloTypes.ListData
		for (const list of boardData.values) {
			if (list.id === arg.ids.idList) {
				listData = list
			}
		}
		// sort to bottom
		if (arg.newIndex >= listData.cards.length - 1) {
			TrelloApiNet.updateCard(arg.ids.idCard, [['pos', 'bottom'], ['idList', arg.ids.idList]])
			return
		}

		if (arg.newIndex < arg.oldIndex) {
			// sort up
			const upperIndex = listData.cards[arg.newIndex - 1]
			const lowerIndex = listData.cards[arg.newIndex]
			const pos = (upperIndex.pos + lowerIndex.pos) / 2
			TrelloApiNet.updateCard(arg.ids.idCard, [['pos', pos], ['idList', arg.ids.idList]])
		} else {
			// sort down
			const upperIndex = listData.cards[arg.newIndex]
			const lowerIndex = listData.cards[arg.newIndex + 1]
			const pos = (upperIndex.pos + lowerIndex.pos) / 2
			TrelloApiNet.updateCard(arg.ids.idCard, [['pos', pos], ['idList', arg.ids.idList]])
		}
		// now modify cache
		updateBoardData(arg.ids.idBoard)
	})

	ipcMain.on('trelloSortList', (event, arg: TrelloTypes.SortList) => {
		const boardData = cacheModule.getTrelloBoardDataById(arg.ids.idBoard)
		// sort to top
		if (arg.newIndex === 0) {
			TrelloApiNet.updateList(arg.ids.idList, [['pos', 'top']])
			return
		}
		// sort to bottom
		if (arg.newIndex >= boardData.values.length - 1) {
			TrelloApiNet.updateList(arg.ids.idList, [['pos', 'bottom']])
			return
		}
		if (arg.newIndex < arg.oldIndex) {
			// sort up
			const upperIndex = boardData.values[arg.newIndex - 1]
			const lowerIndex = boardData.values[arg.newIndex]
			const pos = (upperIndex.pos + lowerIndex.pos) / 2
			TrelloApiNet.updateList(arg.ids.idList, [['pos', pos]])
		} else {
			// sort down
			const upperIndex = boardData.values[arg.newIndex]
			const lowerIndex = boardData.values[arg.newIndex + 1]
			const pos = (upperIndex.pos + lowerIndex.pos) / 2
			TrelloApiNet.updateList(arg.ids.idList, [['pos', pos]])
		}
		// now modify cache
		updateBoardData(arg.ids.idBoard)
	})
	// #endregion ipc

	/**
	 * Updates cachced version of board data
	 */
	async function updateBoardData (boardId: string) {
		const boardData = cacheModule.getTrelloBoardDataById(boardId)
		const json = await TrelloApiNet.getBoardData(boardId)
		boardData.name = json.name
		boardData.prefs = json.prefs
		boardData.values = json.lists
		// sort cards
		for (let i = 0; i < json.lists.length; i++) {
			boardData.values[i].cards = []
			json.cards.forEach((card: TrelloTypes.CardData) => {
				if (card.idList === boardData.values[i].id) {
					boardData.values[i].cards.push(card)
				}
				boardData.values[i].cards.sort((a, b) => {
					return a.pos - b.pos
				})
				// download cover image while were at it
				for (const attachment of card.attachments) {
					if (card.idAttachmentCover === attachment.id) {
						TrelloApiNet.getImage(attachment, ImageOptions.attachment)
					}
				}
			})
		}
		boardData.date = Date.now()
		cacheModule.setTrelloBoardDataById(boardId, boardData)
		await cacheModule.saveCache()
	}

	async function getBackground (prefs: TrelloTypes.BoardPrefs, event: Event) {
		// download background if necessary
		if (prefs.backgroundImage !== null) {
			// in background we download full resolution image and then we send it
			await TrelloApiNet.getBackground(prefs.backgroundImage, ImageOptions.background)
			event.sender.send('trelloSetBackground', prefs.backgroundImage)
		} else {
			event.sender.send('trelloSetBackground', prefs.backgroundColor)
		}
	}

	async function downloadAttachments (attachmentData: TrelloTypes.Attachment[]) {
		attachmentData.forEach((attachment) => {
			if (attachment.isUpload) {
				TrelloApiNet.getImage(attachment, ImageOptions.attachment)
			}
		})
	}

	async function boardUpdate (event: Event, boardId: string, options: TrelloTypes.PageUpdateOptions) {
		let boardData = cacheModule.getTrelloBoardDataById(boardId)
		if (options.forceUpdate === true || cacheModule.checkInvalidity(boardData)) {
			await updateBoardData(boardId)
			boardData = cacheModule.getTrelloBoardDataById(boardId)
			getBackground(boardData.prefs, event)
			event.sender.send('trelloGetBoardData-reply', boardData)
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
		cacheModule.setTrelloToken(accessToken)
		cacheModule.setTrelloAuthorized(true)
		windowManager.sendMessage('trelloIsAuthorized-reply', true)
		TrelloApiNet.initialize()
		cacheModule.saveCache()
	})
}

export function initialize () {
	oauth = new OAuth(requestURL, accessURL, process.env.trelloApi, process.env.trelloSecret, '1.0A', 'todoapp://trelloauth', 'HMAC-SHA1')
	handleIpcCalls()
	TrelloApiIO.initialize()
	TrelloApiNet.initialize()
}

export enum ImageOptions {
	background,
	attachment,
	backgroundThumb
}

export enum CheckState {
	complete = 'complete',
	incomplete = 'incomplete'
}
