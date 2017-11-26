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
const appKey = globalProperties.getTrelloAppKey()
let token
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
export async function getBoards (): Promise<TrelloTypes.BoardData[]> {
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
export async function getAttachments (idCard: string): Promise<TrelloTypes.Attachment[]> {
	return trelloApiRequest('/1/cards/' + idCard + '/attachments/?&key=' + appKey + '&token=' + token + '&fields=all&filter=false')
}

/**
 * Get card actions
 */
export async function getActions (idCard: string): Promise<TrelloTypes.Action[]> {
	return trelloApiRequest('/1/cards/' + idCard + '/actions/?&key=' + appKey + '&token=' + token)
}

/**
 * 	Get image, save it and return its path
 */
export async function getImage (imageData: TrelloTypes.Attachment, options: ImageOptions) {
	const extension = imageData.url.match(/.+([.].+)/)
	let name = path.join('attachments', `${imageData.id}${extension[1]}`)
	const animate = settings.functions.board.get().animateGIFs
	try {
		return await trelloIO.checkExistence(name)
	} catch (e) {
		if (e.code !== 'ENOENT') { throw e }
		// download if needed
		const imageBuffer = await downloadImage(imageData.url)
		trelloIO.saveImage(name, imageBuffer)
		if (!animate && extension[1].toLowerCase() === '.gif') {
			name = path.join('attachments', `${imageData.id}.png`)
			trelloIO.saveImage(name, await sharp(imageBuffer).png().toBuffer())
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
		trelloIO.saveImage(name, await downloadImage(imageUrl))
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
export async function updateCard (idCard: string, options: TrelloTypes.UpdateOptions) {
	let url = `/1/cards/${idCard}?`
	options.forEach((option) => {
		url += `${option.key}=${encodeURIComponent(option.value)}&`
	})
	url += `key=${appKey}&token=${token}`
	return trelloApiPutRequest(url)
}

/**
 * Updates list
 */
export async function updateList (idList: string, options: TrelloTypes.UpdateOptions) {
	let url = `/1/lists/${idList}?`
	options.forEach((option) => {
		url += `${option.key}=${encodeURIComponent(option.value)}&`
	})
	url += `key=${appKey}&token=${token}`
	return trelloApiPutRequest(url)
}
/**
 * Updates board
 */
export async function updateBoard (idBoard: string, options: TrelloTypes.UpdateOptions) {
	let url = `/1/boards/${idBoard}?`
	options.forEach((option) => {
		url += `${option.key}=${encodeURIComponent(option.value)}&`
	})
	url += `key=${appKey}&token=${token}`
	return trelloApiPutRequest(url)
}
// #endregion
// #region ADDERS
/**
 * Adds card
 */
export async function addCard (data: TrelloTypes.AddRequest) {
	return trelloApiPostRequest('/1/cards?name=' + encodeURIComponent(data.name) + '&idList=' + data.id + '&key=' + appKey + '&token=' + token)
}

/**
 * Adds list
 */
export async function addList (data: TrelloTypes.AddRequest) {
	return trelloApiPostRequest('/1/lists?name=' + encodeURIComponent(data.name) + '&idBoard=' + data.id + '&pos=bottom&key=' + appKey + '&token=' + token)
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
