const {net} = require('electron')
const trelloIO = require('./trelloApiInputOutput')
var appKey = ''
var token = ''

/**
 * Initializes variables required for connection to Trello API
 * @param {applicaion key for connection} appKeyNew
 * @param {token for acces} tokenNew
 */
function intialize (appKeyNew, tokenNew) {
	appKey = appKeyNew
	token = tokenNew
	saveToken()
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
	trelloApiRequest('/1/member/me/boards?&key=' + appKey + '&token=' + token + '&fields=name,id&filter=open', callback).then((result) => {
		callback(result)
	})
}

/**
 * Get board data
 * @param {string} idBoard
 * @param {function} callback
 */
function getBoardData (idBoard, callback) {
	trelloApiRequest('/1/boards/' + idBoard + '/?&key=' + appKey + '&token=' + token + '&fields=id,name&lists=open&list_fields=id,name').then((result) => {
		callback(result)
	})
}

/**
 * Get list data in batches
 * @param {Array} batches - list ids to call in batches of 10
 * @param {function} callback - callback
 * @todo remove buffeNumber from {@link trelloApiRequest} by calling event when all batches are finished
 */
function getBatchListData (batches, callback) {
	// @type {Object}
	var json = {'values': []}
	var batchesRecieved = []
	for (var i = 0; i < batches.length; ++i) {
		var batchString = '/1/batch/?urls='
		batches[i].forEach((idList) => {
			batchString += '/lists/' + idList + '/cards,'
		}, this)
		// delete last comma
		batchString = batchString.slice(0, -1)
		batchString += '&key=' + appKey + '&token=' + token
		// merge all batches into one object
		trelloApiRequest(batchString, i).then((result) => {
			// parse only interestnig values
			result.forEach((idList) => {
				json.values.push(idList['200'])
			}, this)
			batchesRecieved.push(i)
			// check if all batches aare fiinished
			if (batchesRecieved.length === batches.length) {
				callback(json)
			}
		})
	}
}
/**
 * Sends request to TrelloAPI
 * @param {string} path - path to send request to
 * @param {integer} batchNumber - used for batches, default is 0
 */
function trelloApiRequest (path) {
	return new Promise((resolve, reject) => {
		const request = net.request({ method: 'GET', hostname: 'trello.com', path: path })
		var json = ''
		request.on('response', (response) => {
			var completeResponse = ''
			response.on('data', (chunk) => {
				if (chunk.toString() === 'invalid token') {
					console.log(token + ' - invalid token ')
					return
				}
				completeResponse += chunk.toString()
			})
			// long responses usually take more than one buffer, so we wait for all data to arrive
			response.on('end', () => {
				// convert to JSON
				json = JSON.parse(completeResponse)
				resolve(json)
			})
		})
		request.end()
	})
}

function saveToken () {
	trelloIO.writeToken(token)
}

function loadToken () {
	trelloIO.openToken((value) => { token = value })
}

module.exports = {
	intialize: intialize,
	getAllUserInfo: getAllUserInfo,
	getBoards: getBoards,
	loadToken: loadToken,
	getBoardData: getBoardData,
	getBatchListData: getBatchListData
}
