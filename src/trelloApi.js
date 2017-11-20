import GlobalProperties from './globalProperties'
import * as path from 'path'
const {BrowserWindow, ipcMain} = require('electron')
const URL = require('url').URL
const OAuth = require('oauth').OAuth
const TrelloApiNet = require('./trelloApiNet')
const TrelloApiIO = require('./trelloApiIO')
const windowManager = require('./windowManager')
const cacheModule = require('./cache')

// constants and variables for connection to trello api
const requestURL = 'https://trello.com/1/OAuthGetRequestToken'
const accessURL = 'https://trello.com/1/OAuthGetAccessToken'
const authorizeURL = 'https://trello.com/1/OAuthAuthorizeToken'
const oauth = new OAuth(requestURL, accessURL, GlobalProperties.getTrelloAppKey(), GlobalProperties.getTrelloSecretKey(), '1.0A', 'todoapp://trelloauth', 'HMAC-SHA1')
var verificationToken = ''
var homepageTrelloAuthEvent = null
// store authentification window variable here, so we can close it from another function
var authorizeWindow

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
		var boards = cacheModule.calls.trello.getBoards()
		// handle empty cache and old cache
		if (cacheModule.calls.helper.checkInvalidity(boards)) {
			var json = await TrelloApiNet.getBoards()
			// format data for internal use
			boards.values = json.map((board) => {
				return {id: board.id, name: board.name, prefs: board.prefs}
			})
			boards.date = Date.now()
			cacheModule.calls.trello.setBoards(boards)
			cacheModule.saveCache()
			windowManager.sendMessage('trelloGetBoards-reply', json)
			// now download images in background
			boards.values.forEach(board => {
				if (board.prefs.backgroundImageScaled !== null) {
					TrelloApiNet.getImage(board.prefs.backgroundImageScaled[0].url, {type: TrelloApiNet.imageTypes.backgroundThumb})
				}
			})
		} else {
			boards.values.forEach(board => {
				if (board.prefs.backgroundImageScaled !== null) {
					TrelloApiNet.getImage(board.prefs.backgroundImageScaled[0].url, {type: TrelloApiNet.imageTypes.backgroundThumb})
				}
			})
			windowManager.sendMessage('trelloGetBoards-reply', boards.values)
		}
	})

	ipcMain.on('trelloGetBoardData', (event, boardId, forceUpdate) => boardUpdate(event, boardId, forceUpdate))

	ipcMain.on('trelloOpenBoard', (event, arg) => {
		windowManager.openURL(new URL('file://' + __dirname + '/board.html?id=' + arg).toString())
	})

	ipcMain.on('trelloAddCard', (event, data) => {
		// TODO add offline card adding
		cacheModule.calls.trello.addCard(data)
		if (data.name !== '') {
			TrelloApiNet.addCard(data)
		}
		boardUpdate(event, data.idBoard, true)
	})

	ipcMain.on('trelloAddList', (event, data) => {
		if (data.name !== '') {
			TrelloApiNet.addList(data)
		}
	})

	ipcMain.on('trelloGetCardData', async (event, idCard) => {
		// TODO add update function
		var cardData = cacheModule.calls.trello.getCard(idCard)
		if (cardData.idChecklists.length === 0) {
			event.sender.send('trelloGetCardData-reply', cardData)
		}
		cardData['checklistData'] = []
		for (var i = 0; i < cardData.idChecklists.length; i++) {
			var json = await TrelloApiNet.getChecklist(cardData.idChecklists[i])
			cardData.checklistData.push(json)
		}
		if (cardData.badges.comments > 0) {
			cardData['comments'] = []
			var actions = await TrelloApiNet.getActions(idCard)
			actions.forEach(action => {
				if (action.type === 'commentCard') { cardData.comments.push(action) }
			})
		}
		event.sender.send('trelloGetCardData-reply', cardData)
	})

	ipcMain.on('trelloUpdateCard', async (event, idCard, options) => {
		TrelloApiNet.updateCard(idCard, options)
	})

	ipcMain.on('trelloUpdateBoard', async (event, idBoard, options) => {
		TrelloApiNet.updateBoard(idBoard, options)
	})

	ipcMain.on('trelloUpdateList', async (event, idList, options) => {
		TrelloApiNet.updateList(idList, options)
	})

	ipcMain.on('trelloOpenCard', (event, arg) => {
		windowManager.openURL(new URL('file://' + __dirname + '/trelloDetails.html?id=' + arg).toString())
	})
	// #endregion ipc

	/**
	 * Gets all board data and sends it to renderer process
	 * @param {string} boardId 
	 * @param {object} boardData
	 * @param {string} boardData.name
	 * @param {object} boardData.prefs
	 * @param {Array<object>} boardData.values
	 * @param {event} event 
	 */
	async function getBoardData (boardId, boardData, event) {
		var json = await TrelloApiNet.getBoardData(boardId)
		// send background color right away
		getBackground(json.prefs, event)
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
		for (var listIndex in boardData.values) {
			for (var cardIndex in boardData.values[listIndex].cards) {
				if (boardData.values[listIndex].cards[cardIndex].badges.attachments > 0) {
					var attData = await TrelloApiNet.getAttachments(boardData.values[listIndex].cards[cardIndex].id)
					downloadAttachments(attData)
					boardData.values[listIndex].cards[cardIndex]['attachments'] = attData
				}
			}
		}
		boardData.date = Date.now()
		cacheModule.calls.trello.setBoardData(boardId, boardData)
		cacheModule.saveCache()
		event.sender.send('trelloGetBoardData-reply', boardData)
	}

	async function getBackground (prefs, event) {
		// download background if necessary
		if (prefs.backgroundImage !== null) {
			// we send blurry version for faster loading, in background we download full resolution image and then we send it
			var filename = prefs.backgroundImageScaled[0].url.match(/.*\/(.*)/)[1]
			var pathName = path.join(GlobalProperties.getPath(), 'background', 'thumbs', filename)
			event.sender.send('trelloSetBackground', pathName, {preview: true})
			event.sender.send('trelloSetBackground', await TrelloApiNet.getImage(prefs.backgroundImage, {type: TrelloApiNet.imageTypes.background}), {preview: false})
		} else {
			event.sender.send('trelloSetBackground', prefs.backgroundColor, {preview: false})
		}
	}

	async function downloadAttachments (attachmentData) {
		attachmentData.forEach((attachment) => {
			if (attachment.isUpload) {
				TrelloApiNet.getImage(attachment, {type: TrelloApiNet.imageTypes.attachment})
			}
		})
	}
	function boardUpdate (event, boardId, forceUpdate) {
		var boardData = cacheModule.calls.trello.getBoardData(boardId)
		if (forceUpdate === true) {
			getBoardData(boardId, boardData, event)
		} else if (cacheModule.calls.helper.checkInvalidity(boardData)) {
			getBoardData(boardId, boardData, event)
		} else {
			getBackground(boardData.prefs, event)
			event.sender.send('trelloGetBoardData-reply', boardData)
		}
	}
}

/**
 * Function for authorizing Trello API
 */
function authorize () {
	oauth.getOAuthRequestToken(function (error, token, tokenSecret, results) {
		if (error) throw error
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
 * @param {} url - custom adress to parse data from
 */
function authorizeCallback (url) {
	// close authentification window, because we don't need it at this point
	authorizeWindow.close()
	// parse oauth values
	var query = new URL(url)
	const oauthToken = query.searchParams.get('oauth_token')
	const oauthVerifier = query.searchParams.get('oauth_verifier')
	oauth.getOAuthAccessToken(oauthToken, verificationToken, oauthVerifier, (error, accessToken, accessTokenSecret, results) => {
		if (error) throw error
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

function initialize () {
	handleIpcCalls()
	TrelloApiIO.initialize()
	TrelloApiNet.initialize()
}
module.exports = {
	authorize: authorize,
	authorizeCallback: authorizeCallback,
	initialize: initialize
}
