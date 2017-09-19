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
 * @param {function} callback
 */
function getAllUserInfo (callback) {
	trelloApiRequest('/1/member/me?&key=' + appKey + '&token=' + token, callback).then((result) => {
		callback(result)
	})
}

/**
 * Get all boards
 * @param {function} callback
 */
function getBoards (callback) {
	trelloApiRequest('/1/member/me/boards?&key=' + appKey + '&token=' + token + '&fields=name,id,background&filter=open', callback).then((result) => {
		callback(result)
	})
}

/**
 * Get board data
 * @param {string} idBoard
 * @param {function} callback
 */
function getBoardData (idBoard, callback) {
	trelloApiRequest('/1/boards/' + idBoard + '/?&key=' + appKey + '&token=' + token + '&fields=id,name,prefs&lists=open&list_fields=id,name&cards=open').then((result) => {
		callback(result)
	})
}

/**
 * 	Get background, save it and return its path
 * @param {string} urlToImage - url to download image from
 * @param {function} callback
 */
function getBackground (urlToImage, callback) {
	// seperate path into chunks and select last part
	var pathnames = new URL(urlToImage).pathname.split('/')
	var name = pathnames[pathnames.length - 1] + '.png'
	// check for existing file
	trelloIO.checkExistence(name).then((resolve) => {
		callback(resolve)
	}).catch((error) => {
		if (error !== 'ENOENT') throw error
		// download if needed
		downloadBackgroundImage(urlToImage).then((imageData) => {
			trelloIO.saveImage(name, imageData).then((value) => {
				callback(value)
			})
		})
	})
}

/**
 * Sends request to TrelloAPI
 * @param {string} path - path to send request to
 */
function trelloApiRequest (path) {
	return new Promise((resolve, reject) => {
		const request = net.request({ method: 'GET', hostname: 'trello.com', path: path })
		var json
		request.on('response', (response) => {
			var completeResponse = ''
			response.on('data', (chunk) => {
				handleResponseErrors(chunk, reject)
				completeResponse += chunk.toString()
			})
			// long responses usually take more than one buffer, so we wait for all data to arrive
			response.on('end', () => {
				handleResponseErrors(completeResponse, reject)
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
				handleResponseErrors(chunk, reject)
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

function handleResponseErrors (chunk, reject) {
	if (chunk.toString() === 'invalid token') {
		reject(new Error('Invalid token'))
	} else if (chunk.toString() === 'invalid id') {
		reject(new Error('Invalid id'))
	} else if (chunk === '') {
		reject(new Error('Empty response'))
	} else if (chunk === 'Request Timeout') {
		reject(new Error('Request Timeout'))
	}
}

function addCard (data, callback) {
	trelloApiPostRequest('/1/cards?name=' + data.name + '&idList=' + data.idList + '&key=' + appKey + '&token=' + token).then((result) => {
		callback(result)
	})
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
	getBoards: getBoards,
	getBoardData: getBoardData,
	getBackground: getBackground,
	addCard: addCard
}
