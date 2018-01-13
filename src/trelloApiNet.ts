import {net} from 'electron'
import * as path from 'path'
import * as sharp from 'sharp'
import {URL} from 'url'
import * as cacheModule from './cache'
import globalProperties from './globalProperties'
import * as settings from './settings'
import {ImageOptions} from './trelloApi'
import * as trelloIO from './trelloApiIO'
import {TrelloTypes} from './trelloInterfaces'
let appKey: string
let token
let queue: IQueueItem[]
/**
 * Initializes variables required for connection to Trello API
 */
export function initialize () {
	token = cacheModule.calls.trello.getToken()
	appKey = process.env.trelloApi
	queue = []
	setInterval(handleQueueRequests, 110)
}

async function handleQueueRequests () {
	if (queue.length > 0) {
		let result
		// copy and delete queue item here, because it could be run multiple times
		const type = queue[0].type
		const url = queue[0].url
		const callback = queue[0].callback
		queue.splice(0, 1)
		switch (type) {
			case RequestType.GET:
				result = await trelloApiRequest(url)
				break
			case RequestType.POST:
				result = await trelloApiPostRequest(url)
				break
			case RequestType.PUT:
				result = await trelloApiPutRequest(url)
				break
			case RequestType.GETimage:
				result = await downloadImage(url)
				break
			default:
				throw new Error('Wrong type in calls queue')
		}
		callback(result)
	}
}

function queueRequest (call: IQueueItem) {
	return new Promise<any>((resolve, reject) => {
		queue.push({ url: call.url, type: call.type, callback: (result) => {
			resolve(result)
		}})
	})
}

// #region GETTERS
/**
 * Get all user info
 */
export async function getAllUserInfo () {
	return queueRequest({url: `/1/member/me?&key=${appKey}&token=${token}`, type: RequestType.GET})
}

/**
 * Get all boards
 */
export async function getBoards (): Promise<TrelloTypes.BoardData[]> {
	return queueRequest({url: `/1/member/me/boards?&key=${appKey}&token=${token}&fields=all`, type: RequestType.GET})
}

/**
 * Get board data
 */
export async function getBoardData (idBoard: string) {
	return queueRequest({url: `/1/boards/${idBoard}/?&key=${appKey}&token=${token}&fields=id,name,prefs&lists=open&list_fields=id,name&cards=open`,
		type: RequestType.GET})
}

/**
 * Get attachments
 */
export async function getAttachments (idCard: string): Promise<TrelloTypes.Attachment[]> {
	return queueRequest({url: `/1/cards/${idCard}/attachments/?&key=${appKey}&token=${token}&fields=all&filter=false`, type: RequestType.GET})
}

/**
 * Get card actions
 */
export async function getActions (idCard: string): Promise<TrelloTypes.Action[]> {
	return queueRequest({url: `/1/cards/${idCard}/actions/?&key=${appKey}&token=${token}`, type: RequestType.GET})
}

/**
 * 	Get image, save it and return its path
 */
export async function getImage (imageData: TrelloTypes.Attachment, options: ImageOptions) {
	const extension = imageData.url.match(/.+([.].+)/)
	let name = path.join('attachments', `${imageData.id}${extension[1]}`)
	const animate = settings.get().animateGIFs
	try {
		if (!animate) {
			name = path.join('attachments', `${imageData.id}.png`)
		}
		return await trelloIO.checkExistence(name)
	} catch (e) {
		if (e.code !== 'ENOENT') { throw e }
		// download if needed
		const imageBuffer = await queueRequest({url: imageData.url, type: RequestType.GETimage})
		if (!animate && extension[1].toLowerCase() === '.gif') {
			name = path.join('attachments', `${imageData.id}.png`)
			trelloIO.saveImage(name, await sharp(imageBuffer).png().toBuffer())
		} else {
			name = path.join('attachments', `${imageData.id}${extension[1]}`)
			trelloIO.saveImage(name, imageBuffer)
		}
		return globalProperties.getPath() + name
	}
}

/**
 * Get background and save it
 */
export async function getBackground (imageUrl: string, options: ImageOptions) {
	let pathnames: string[]
	let decodedName: string
	// seperate path into chunks and select last part
	pathnames = new URL(imageUrl).pathname.split('/')
	decodedName = decodeURIComponent(pathnames[pathnames.length - 1])
	const pathToAdd = options === ImageOptions.backgroundThumb ? 'background/thumbs' : 'background'
	let name: string = path.join(pathToAdd, decodedName)
	// check for extension
	if (!imageUrl.match(/[.][\w]+$/)) {
		name += '.jpg'
	}
	try {
		return await trelloIO.checkExistence(name)
	} catch (e) {
		if (e.code !== 'ENOENT') { throw e }
		// download if needed
		trelloIO.saveImage(name, await queueRequest({url: imageUrl, type: RequestType.GETimage}))
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
	return await queueRequest({url: `/1/checklists/${idChecklist}/?&key=${appKey}&token=${token}`, type: RequestType.GET})
}
// #endregion
// #region UPDATERS
/**
 * Updates card
 */
export async function updateCard (idCard: string, options: TrelloTypes.UpdateOptions) {
	let url = `/1/cards/${idCard}?`
	options.forEach((option) => {
		url += `${option[0]}=${encodeURIComponent(option[1])}&`
	})
	url += `key=${appKey}&token=${token}`
	return queueRequest({url, type: RequestType.PUT})
}

/**
 * Updates list
 */
export async function updateList (idList: string, options: TrelloTypes.UpdateOptions) {
	let url = `/1/lists/${idList}?`
	options.forEach((option) => {
		url += `${option[0]}=${encodeURIComponent(option[1])}&`
	})
	url += `key=${appKey}&token=${token}`
	return queueRequest({url, type: RequestType.PUT})
}

/**
 * Updates board
 */
export async function updateBoard (idBoard: string, options: TrelloTypes.UpdateOptions) {
	let url = `/1/boards/${idBoard}?`
	options.forEach((option) => {
		url += `${option[0]}=${encodeURIComponent(option[1])}&`
	})
	url += `key=${appKey}&token=${token}`
	return queueRequest({url, type: RequestType.PUT})
}

/**
 * Updates board
 */
export async function updateCheckList (ids: TrelloTypes.CheckListUpdateIds, options: TrelloTypes.UpdateOptions) {
	let url = `/1/cards/${ids.cardId}/checkItem/${ids.idCheckItem}?`
	options.forEach((option) => {
		url += `${option[0]}=${encodeURIComponent(option[1])}&`
	})
	url += `key=${appKey}&token=${token}`
	return queueRequest({url, type: RequestType.PUT})
}
// #endregion
// #region ADDERS
/**
 * Adds card
 */
export async function addCard (data: TrelloTypes.AddRequest) {
	return queueRequest({url: `/1/cards?name=${encodeURIComponent(data.name)}&idList=${data.id}&key=${appKey}&token=${token}`, type: RequestType.PUT})
}

/**
 * Adds list
 */
export async function addList (data: TrelloTypes.AddRequest) {
	return queueRequest({url: `/1/lists?name=${encodeURIComponent(data.name)}&idBoard=${data.id}&pos=bottom&key=${appKey}&token=${token}`, type: RequestType.PUT})
}
// #endregion
// #region REQUESTS
/**
 * Sends request to TrelloAPI
 */
function trelloApiRequest (url: string) {
	return new Promise<any>((resolve, reject) => {
		const request = net.request({ method: 'GET', hostname: 'trello.com', path: url })
		let json
		request.on('response', (response) => {
			let completeResponse = ''
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
function downloadImage (urlToImage: string) {
	return new Promise<Buffer>((resolve, reject) => {
		const url = new URL(urlToImage)
		const request = net.request({protocol: 'https:', method: 'GET', hostname: url.hostname, path: url.pathname})
		// create empty buffer for later use
		let data = Buffer.alloc(0)
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
		for (const error of possibleErrors) {
			if (error === chunk) {
				return new Error(chunk)
			}
		}
	}
}

/**
 * Sends POST request to Trello API
 */
function trelloApiPostRequest (url: string) {
	return new Promise((resolve, reject) => {
		const request = net.request({ method: 'POST', protocol: 'https:', hostname: 'api.trello.com', path: url })
		request.on('response', (response) => {
			let completeResponse = ''
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
function trelloApiPutRequest (url: string) {
	return new Promise((resolve, reject) => {
		const request = net.request({ method: 'PUT', protocol: 'https:', hostname: 'api.trello.com', path: url })
		request.on('response', (response) => {
			let completeResponse = ''
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
// #region TYPES
enum RequestType {
	GET,
	POST,
	PUT,
	GETimage
}

interface IQueueItem {
	url: string,
	type: RequestType,
	callback?: any
}
// #endregion
