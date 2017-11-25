/// <reference path="trelloApi.d.ts" />

import globalProperties from './globalProperties'
import * as path from 'path'
import {ImageOptions} from './trelloApi'
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
export async function getBoards (): Promise<Array<BoardData>> {
	return trelloApiRequest('/1/member/me/boards?&key=' + appKey + '&token=' + token + '&fields=name,id,prefs,closed')
}

/**
 * Get board data
 */
export async function getBoardData (idBoard: string) {
	return trelloApiRequest('/1/boards/' + idBoard + '/?&key=' + appKey + '&token=' + token + '&fields=id,name,prefs&lists=open&list_fields=id,name&cards=open')
}

/**
 * Get attachments
 */
export async function getAttachments (idCard: string): Promise<Attachment[]> {
	return trelloApiRequest('/1/cards/' + idCard + '/attachments/?&key=' + appKey + '&token=' + token + '&fields=all&filter=false')
}

/**
 * Get card actions
 */
export async function getActions (idCard: string) {
	return trelloApiRequest('/1/cards/' + idCard + '/actions/?&key=' + appKey + '&token=' + token)
}

/**
 * 	Get image, save it and return its path
 */
export async function getImage (imageData: any, options: ImageOptions) {
	var name, urlToDownload, pathnames, decodedName
	switch (options) {
	case ImageOptions.background:
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
	case ImageOptions.backgroundThumb:
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
	case ImageOptions.attachment:
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
		if (options === ImageOptions.backgroundThumb) {
			return globalProperties.getPath() + name
		}
		return globalProperties.getPath() + name
	}
}

/**
 * Gets checklists
 */
export async function getChecklist (idChecklist: string) {
	return trelloApiRequest('/1/checklists/' + idChecklist + '/?&key=' + appKey + '&token=' + token)
}
// #endregion
// #region UPDATERS
/**
 * Updates card
 */
export async function updateCard (idCard: string, options: UpdateOptions) {
	var path = `/1/cards/${idCard}?`
	options.forEach((option) => {
		path += `${option.key}=${encodeURIComponent(option.value)}&`
	})
	path += `key=${appKey}&token=${token}`
	return trelloApiPutRequest(path)
}
/**
 * Updates list
 */
export async function updateList (idList: string, options: UpdateOptions) {
	var path = `/1/lists/${idList}?`
	options.forEach((option) => {
		path += `${option.key}=${encodeURIComponent(option.value)}&`
	})
	path += `key=${appKey}&token=${token}`
	return trelloApiPutRequest(path)
}
/**
 * Updates board
 */
export async function updateBoard (idBoard: string, options: UpdateOptions) {
	var path = `/1/boards/${idBoard}?`
	options.forEach((option) => {
		path += `${option.key}=${encodeURIComponent(option.value)}&`
	})
	path += `key=${appKey}&token=${token}`
	return trelloApiPutRequest(path)
}
// #endregion
// #region ADDERS
/**
 * Adds card
 */
export async function addCard (data: AddRequest) {
	return trelloApiPostRequest('/1/cards?name=' + encodeURIComponent(data.name) + '&idList=' + data.id + '&key=' + appKey + '&token=' + token)
}

/**
 * Adds list
 */
export async function addList (data: AddRequest) {
	return trelloApiPostRequest('/1/lists?name=' + encodeURIComponent(data.name) + '&idBoard=' + data.id + '&pos=bottom&key=' + appKey + '&token=' + token)
}
// #endregion
// #region REQUESTS
/**
 * Sends request to TrelloAPI
 */
function trelloApiRequest (path: string) {
	return new Promise<any>((resolve, reject) => {
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
 */
function downloadImage (path: string) {
	return new Promise<Buffer>((resolve, reject) => {
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
 */
function handleResponseErrors (chunk: string): Error {
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
 */
function trelloApiPostRequest (path: string) {
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
 */
function trelloApiPutRequest (path: string) {
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