import globalProperties from './globalProperties'
import * as path from 'path'
const {net} = require('electron')
const trelloIO = require('./trelloApiIO')
const URL = require('url').URL
const appKey = globalProperties.getTrelloAppKey()
const cacheModule = require('./cache')
var token

/**
 * Initializes variables required for connection to Trello API
 */
export function initialize () {
	token = cacheModule.calls.trello.getToken()
}
// #region GETTERS
/**
 * Get all user info
 */
export async function getAllUserInfo () {
	return trelloApiRequest('/1/member/me?&key=' + appKey + '&token=' + token)
}

/**
 * Get all boards
 */
export async function getBoards () {
	return trelloApiRequest('/1/member/me/boards?&key=' + appKey + '&token=' + token + '&fields=name,id,prefs,closed')
}

/**
 * Get board data
 * @param {string} idBoard
 */
export async function getBoardData (idBoard) {
	return trelloApiRequest('/1/boards/' + idBoard + '/?&key=' + appKey + '&token=' + token + '&fields=id,name,prefs&lists=open&list_fields=id,name&cards=open')
}

/**
 * Get attachments
 * @param {string} idCard
 */
export async function getAttachments (idCard) {
	return trelloApiRequest('/1/cards/' + idCard + '/attachments/?&key=' + appKey + '&token=' + token + '&fields=all&filter=false')
}

/**
 * Get card actions
 * @param {string} idCard
 */
export async function getActions (idCard) {
	return trelloApiRequest('/1/cards/' + idCard + '/actions/?&key=' + appKey + '&token=' + token)
}

/**
 * 	Get image, save it and return its path
 * @param {string} imageData - url to download image from
 * @param {object} options
 * @param {number} options.type
 */
export async function getImage (imageData, options) {
	var name, urlToDownload, pathnames, decodedName
	switch (options.type) {
	case imageTypes.background:
		// seperate path into chunks and select last part
		pathnames = new URL(imageData).pathname.split('/')
		decodedName = decodeURIComponent(pathnames[pathnames.length - 1])
		if (imageData.match(/\/\S+([.]\w+)$/)) {
			// url does have file extension
			name = path.join('background', decodedName)
		} else {
			name = path.join('background', decodedName) + '.jpg'
		}
		urlToDownload = imageData
		break
	case imageTypes.backgroundThumb:
		// seperate path into chunks and select last part
		pathnames = new URL(imageData).pathname.split('/')
		decodedName = decodeURIComponent(pathnames[pathnames.length - 1])
		if (imageData.match(/\/\S+([.]\w+)$/)) {
			// url does have file extension
			name = path.join('background/thumbs', decodedName)
		} else {
			name = path.join('background/thumbs', decodedName) + '.jpg'
		}
		urlToDownload = imageData
		break
	case imageTypes.attachment:
		var extension = imageData.url.match(/.+([.].+)/)
		name = path.join('attachments', `${imageData.id}${extension[1]}`)
		urlToDownload = imageData.url
		break
	default:
		throw new Error(`Wrong option in getImage`)
	}
	try {
		return await trelloIO.checkExistence(name)
	} catch (e) {
		if (e.code !== 'ENOENT') { throw e }
		// download if needed
		trelloIO.saveImage(name, await downloadImage(urlToDownload))
		if (options.type === imageTypes.backgroundThumb) {
			return globalProperties.getPath() + name
		}
		return globalProperties.getPath() + name
	}
}

/**
 * Gets checklists
 * @param {string} idChecklist
 */
export async function getChecklist (idChecklist) {
	return trelloApiRequest('/1/checklists/' + idChecklist + '/?&key=' + appKey + '&token=' + token)
}
// #endregion
// #region UPDATERS
/**
 * Updates card
 * @param {string} idCard
 * @param {Array<Array<string>>} options
 */
export async function updateCard (idCard, options) {
	var path = `/1/cards/${idCard}?`
	options.forEach((option) => {
		path += `${option[0]}=${encodeURIComponent(option[1])}&`
	})
	path += `key=${appKey}&token=${token}`
	return trelloApiPutRequest(path)
}
/**
 * Updates list
 * @param {string} idList
 * @param {Array<Array<string>>} options
 */
export async function updateList (idList, options) {
	var path = `/1/lists/${idList}?`
	options.forEach((option) => {
		path += `${option[0]}=${encodeURIComponent(option[1])}&`
	})
	path += `key=${appKey}&token=${token}`
	return trelloApiPutRequest(path)
}
/**
 * Updates board
 * @param {string} idBoard
 * @param {Array<Array<string>>} options
 */
export async function updateBoard (idBoard, options) {
	var path = `/1/boards/${idBoard}?`
	options.forEach((option) => {
		path += `${option[0]}=${encodeURIComponent(option[1])}&`
	})
	path += `key=${appKey}&token=${token}`
	return trelloApiPutRequest(path)
}
// #endregion
// #region ADDERS
/**
 * Adds card
 * @param {Object} data
 * @param {string} data.name
 * @param {string} data.idList
 */
export async function addCard (data) {
	return trelloApiPostRequest('/1/cards?name=' + encodeURIComponent(data.name) + '&idList=' + data.idList + '&key=' + appKey + '&token=' + token)
}

/**
 * Adds list
 * @param {Object} data
 * @param {string} data.name
 * @param {string} data.idBoard
 */
export async function addList (data) {
	return trelloApiPostRequest('/1/lists?name=' + encodeURIComponent(data.name) + '&idBoard=' + data.idBoard + '&pos=bottom&key=' + appKey + '&token=' + token)
}
// #endregion
// #region REQUESTS
/**
 * Sends request to TrelloAPI
 * @param {string} path - path to send request to
 * @returns {Promise<object>} - data from request
 */
function trelloApiRequest (path) {
	return new Promise((resolve, reject) => {
		const request = net.request({ method: 'GET', hostname: 'trello.com', path: path })
		var json
		request.on('response', (response) => {
			var completeResponse = ''
			response.on('data', (chunk) => {
				completeResponse += chunk.toString()
				if (response.statusCode !== 200) {
					throw handleResponseErrors(completeResponse)
				}
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

/**
 *  Downloads image from provided url and returns buffer
 * @param {string} path - url to download image from
 */
function downloadImage (path) {
	return new Promise((resolve, reject) => {
		var url = new URL(path)
		const request = net.request({protocol: 'https:', method: 'GET', hostname: url.hostname, path: url.pathname})
		// create empty buffer for later use
		var data = Buffer.alloc(0)
		request.on('response', (response) => {
			response.on('data', (chunk) => {
				if (response.statusCode !== 200) {
					throw handleResponseErrors(chunk.toString())
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
/**
 * Cheks for invalid responses
 * @param {string} chunk
 * @returns {Error}
 */
function handleResponseErrors (chunk) {
	if (chunk === '') {
		return new Error('Empty response')
	} else {
		const possibleErrors = ['invalid token', 'invalid id', 'Request Timeout']
		for (let error of possibleErrors) {
			if (error === chunk) {
				return new Error(chunk)
			}
		}
	}
}

/**
 * Sends POST request to Trello API
 * @param {string} path
 */
function trelloApiPostRequest (path) {
	return new Promise((resolve, reject) => {
		const request = net.request({ method: 'POST', protocol: 'https:', hostname: 'api.trello.com', path: path })
		request.on('response', (response) => {
			var completeResponse = ''
			response.on('data', (chunk) => {
				completeResponse += chunk.toString()
				if (response.statusCode !== 200) {
					throw handleResponseErrors(completeResponse)
				}
			})
			response.on('end', () => {
				resolve()
			})
		})
		request.write(JSON.stringify(false))
		request.end()
	})
}

/**
 * Sends PUT request to Trello API
 * @param {string} path
 */
function trelloApiPutRequest (path) {
	return new Promise((resolve, reject) => {
		const request = net.request({ method: 'PUT', protocol: 'https:', hostname: 'api.trello.com', path: path })
		request.on('response', (response) => {
			var completeResponse = ''
			response.on('data', (chunk) => {
				completeResponse += chunk.toString()
				if (response.statusCode !== 200) {
					throw handleResponseErrors(completeResponse)
				}
			})
			response.on('end', () => {
				resolve()
			})
		})
		request.write(JSON.stringify(false))
		request.end()
	})
}
// #endregion
export const imageTypes = Object.freeze({
	background: 0,
	attachment: 1,
	backgroundThumb: 2
})
