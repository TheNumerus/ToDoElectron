const {net} = require('electron')
const trelloIO = require('./trelloApiIO')
const URL = require('url').URL
const appKey = require('./globalProperties').trelloAppKey
const cacheModule = require('./cache')
var token

/**
 * Initializes variables required for connection to Trello API
 * @param {token for acces} tokenNew
 */
function initialize () {
	token = cacheModule.calls.trello.getToken()
}

/**
 * Get all user info
 */
async function getAllUserInfo () {
	return trelloApiRequest('/1/member/me?&key=' + appKey + '&token=' + token)
}

/**
 * Get all boards
 */
async function getBoards () {
	return trelloApiRequest('/1/member/me/boards?&key=' + appKey + '&token=' + token + '&fields=name,id,background&filter=open')
}

/**
 * Get board data
 * @param {string} idBoard
 */
async function getBoardData (idBoard) {
	return trelloApiRequest('/1/boards/' + idBoard + '/?&key=' + appKey + '&token=' + token + '&fields=id,name,prefs&lists=open&list_fields=id,name&cards=open')
}

/**
 * Get attachments
 * @param {string} idCard
 */
async function getAttachments (idCard) {
	return trelloApiRequest('/1/cards/' + idCard + '/atatchments/?&key=' + appKey + '&token=' + token + '&fields=all&filter=none')
}

/**
 * Get card actions
 * @param {string} idCard
 */
async function getActions (idCard) {
	return trelloApiRequest('/1/cards/' + idCard + '/actions/?&key=' + appKey + '&token=' + token)
}

/**
 * 	Get background, save it and return its path
 * @param {string} urlToImage - url to download image from
 */
async function getBackground (urlToImage) {
	// seperate path into chunks and select last part
	var pathnames = new URL(urlToImage).pathname.split('/')
	var name = pathnames[pathnames.length - 1] + '.png'
	try {
		return await trelloIO.checkExistence(name)
	} catch (e) {
		if (e !== 'ENOENT') { throw e }
		// download if needed
		var imageData = await downloadBackgroundImage(urlToImage)
		return trelloIO.saveImage(name, imageData)
	}
}

/**
 * 
 * @param {string} idChecklist
 */
async function getChecklist (idChecklist) {
	return trelloApiRequest('/1/checklists/' + idChecklist + '/?&key=' + appKey + '&token=' + token)
}

/**
 * Sends request to TrelloAPI
 * @param {string} path - path to send request to
 * @returns {Promise<String>} - data from request
 */
function trelloApiRequest (path) {
	return new Promise((resolve, reject) => {
		const request = net.request({ method: 'GET', hostname: 'trello.com', path: path })
		var json
		request.on('response', (response) => {
			var completeResponse = ''
			response.on('data', (chunk) => {
				completeResponse += chunk.toString()
				var error = handleResponseErrors(completeResponse)
				if (error) {
					reject(error)
				}
			})
			// long responses usually take more than one buffer, so we wait for all data to arrive
			response.on('end', () => {
				var error = handleResponseErrors(completeResponse)
				if (error) {
					reject(error)
					return
				}
				// convert to JSON
				json = JSON.parse(completeResponse)
				resolve(json)
			})
		})
		request.end()
	})
}

/**
 *  Downloads image from provided url and returns buffer
 * @param {string} path - url to download image from
 */
function downloadBackgroundImage (path) {
	return new Promise((resolve, reject) => {
		var url = new URL(path)
		const request = net.request({method: 'GET', hostname: url.hostname, path: url.pathname})
		// create empty buffer for later use
		var data = Buffer.alloc(0)
		request.on('response', (response) => {
			response.on('data', (chunk) => {
				var error = handleResponseErrors(data)
				if (error) {
					reject(error)
					return
				}
				// merge data into one buffer
				data = Buffer.concat([data, chunk])
			})
			// long responses usually take more than one buffer, so we wait for all data to arrive
			response.on('end', () => {
				resolve(data)
			})
		})
		request.end()
	})
}

function handleResponseErrors (chunk) {
	if (chunk.toString() === 'invalid token') {
		return new Error('Invalid token')
	} else if (chunk.toString() === 'invalid id') {
		return new Error('Invalid id')
	} else if (chunk === '') {
		return new Error('Empty response')
	} else if (chunk === 'Request Timeout') {
		return new Error('Request Timeout')
	}
}

async function addCard (data) {
	return trelloApiPostRequest('/1/cards?name=' + data.name + '&idList=' + data.idList + '&key=' + appKey + '&token=' + token)
}

function trelloApiPostRequest (path) {
	return new Promise((resolve, reject) => {
		const request = net.request({ method: 'POST', protocol: 'https:', hostname: 'api.trello.com', path: path })
		request.on('response', (response) => {
			var completeResponse = ''
			response.on('data', (chunk) => {
				completeResponse += chunk.toString()
			})
			response.on('end', () => {
				handleResponseErrors(completeResponse, reject)
				resolve()
			})
		})
		request.write(JSON.stringify(false))
		request.end()
	})
}
module.exports = {
	initialize: initialize,
	getAllUserInfo: getAllUserInfo,
	getAttachments: getAttachments,
	getActions: getActions,
	getBoards: getBoards,
	getBoardData: getBoardData,
	getBackground: getBackground,
	getChecklist: getChecklist,
	addCard: addCard
}
