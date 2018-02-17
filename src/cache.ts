import * as fs from 'fs'
import * as globalProperties from './globalProperties'
import {TrelloTypes} from './trelloInterfaces'
const filename = 'userCache'

export let cache = {
	sources: {
		trello: {
			used: false,
			token: null as string,
			boards: {
				date: null,
				values: [] as TrelloTypes.BoardData[]
			}
		}
	}
}

export const saveCache = () => {
	return new Promise((resolve, reject) => {
		fs.writeFile(globalProperties.getPath() + filename, JSON.stringify(cache), (error) => {
			if (error) {reject(error)}
			resolve()
		})
	})
}

export const loadCache = () => {
	return new Promise((resolve, reject) => {
		fs.readFile(globalProperties.getPath() + filename, (error, data) => {
			if (error) {
				reject(error)
			} else {
				if (data.length === 0) {
					reject(Error('Empty file'))
				}
				try {
					cache = JSON.parse(data.toString())
				} catch (e) {
					reject(e)
				}
				resolve()
			}
		})
	})
}

export const isOld = (object) => {
	if (object === undefined) {
		return true
	}
	const then = new Date(object.date).valueOf()
	return (Date.now() - then) > 86400000
}

export const checkInvalidity = (object) => {
	if (object === undefined || object.values === undefined || object.values === null || object.values.length === 0 || isOld(object)) {
		return true
	}
	return false
}

export const clearCache = () => {
	cache.sources.trello.boards = {date: null, values: []}
	saveCache()
}

// #region exported trello functions

export const getTrelloToken = () => {
	return cache.sources.trello.token
}

export const setTrelloToken = (token: string) => {
	cache.sources.trello.token = token
}

export const getTrelloBoards = () => {
	return cache.sources.trello.boards.values
}

export const setTrelloBoards = (boards: TrelloTypes.BoardData[]) => {
	cache.sources.trello.boards.values = boards
	cache.sources.trello.boards.date = Date.now()
}

export const getTrelloAuthorized = () => {
	return cache.sources.trello.used
}

export const setTrelloAuthorized = (isAuthorized: boolean) => {
	cache.sources.trello.used = isAuthorized
}

export const getTrelloBoardDataById = (id: string) => {
	for (const board of cache.sources.trello.boards.values) {
		if (board.id === id) {
			return board
		}
	}
}

export const setTrelloBoardDataById = (id: string, data: TrelloTypes.BoardData) => {
	for (const board in cache.sources.trello.boards.values) {
		if (cache.sources.trello.boards.values[board].id === id) {
			cache.sources.trello.boards.values[board] = data
			return
		}
	}
}

export const getTrelloCardById = (id: string) => {
	for (const board of cache.sources.trello.boards.values) {
		for (const list of board.values) {
			for (const card of list.cards) {
				if (card.id === id) {
					return card
				}
			}
		}
	}
}
// #endregion
