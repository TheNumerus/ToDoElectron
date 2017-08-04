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
	trelloApiRequest('/1/boards/' + idBoard + '/?&key=' + appKey + '&token=' + token + '&fields=id,name,background&lists=open&list_fields=id,name').then((result) => {
		callback(result)
	})
}

/**
 * 	Get background, save it and return its path
 * @param {string} idBoard
 * @param {function} callback
 */
function getBackground (idBoard, callback) {
	trelloApiRequest('/1/boards/' + idBoard + '/prefs/' + '?&key=' + appKey + '&token=' + token).then((response) => {
		// handle solid color
		if (response.backgroundImage === null) {
			callback(response.backgroundColor)
		} else {
			// seperate path into chunks and select last part
			var pathnames = new URL(response.backgroundImage).pathname.split('/')
			var name = pathnames[pathnames.length - 1] + '.png'
			// check for existing file
			trelloIO.checkExistence(name).then((resolve) => {
				callback(resolve)
			}).catch((error) => {
				if (error !== 'ENOENT') throw error
				// download if needed
				downloadBackgroundImage(response.backgroundImage).then((imageData) => {
					trelloIO.saveImage(name, imageData).then((value) => {
						callback(value)
					})
				})
			})
		}
	})
}

/**
 * Get list data in batches
 * @param {Array} batches - list ids to call in batches of 10
 * @param {function} callback - callback
 */
function getBatchListData (batches, callback) {
	// @type {Object}
	var json = {'values': []}
	var batchesRecieved = []
	for (var i in batches) {
		var batchString = '/1/batch/?urls='
		batches[i].forEach((idList) => {
			batchString += '/lists/' + idList + '/cards,'
		}, this)
		// delete last comma
		batchString = batchString.slice(0, -1)
		batchString += '&key=' + appKey + '&token=' + token
		// merge all batches into one object
		trelloApiRequest(batchString).then((result) => {
			// parse only interestnig values
			result.forEach((idList) => {
				json.values.push(idList['200'])
			}, this)
			batchesRecieved.push(i)
			// check if all batches are fiinished
			if (batchesRecieved.length === batches.length) {
				callback(json)
			}
		})
	}
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
				if (chunk.toString() === 'invalid token') {
					reject(new Error('Invalid token'))
				}
				if (chunk.toString() === 'invalid id') {
					reject(new Error('Invalid id'))
				}
				completeResponse += chunk.toString()
			})
			// long responses usually take more than one buffer, so we wait for all data to arrive
			response.on('end', () => {
				if (completeResponse === '') {
					reject(new Error('Empty response'))
				}
				if (completeResponse === 'Request Timeout') {
					reject(new Error('Request Timeout'))
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
				if (chunk.toString() === 'invalid token') {
					reject(new Error('Invalid token'))
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

module.exports = {
	initialize: initialize,
	getAllUserInfo: getAllUserInfo,
	getBoards: getBoards,
	getBoardData: getBoardData,
	getBatchListData: getBatchListData,
	getBackground: getBackground
}
