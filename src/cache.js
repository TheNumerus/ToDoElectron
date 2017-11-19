import globalProperties from './globalProperties'
const fs = require('fs')
const filename = 'userCache'

var cache = {
	sources: {
		trello: {
			used: false,
			token: null,
			boards: {
				date: null,
				values: []
			}
		},
		googlecal: {
			used: false,
			values: {}
		},
		nologin: {
			used: true,
			values: {}
		}
	}
}

function saveCache () {
	return new Promise(function (resolve, reject) {
		fs.writeFile(globalProperties.getPath() + filename, JSON.stringify(cache), (error) => {
			if (error) reject(error)
			resolve()
		})
	})
}

function loadCache () {
	return new Promise(function (resolve, reject) {
		fs.readFile(globalProperties.getPath() + filename, (error, data) => {
			if (error) {
				// handle non-existing file
				if (error.code === 'ENOENT') {
					saveCache()
				} else {
					reject(error)
				}
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

function isOld (object) {
	if (object === undefined) return
	var now = Date.now()
	var then = new Date(object.date).valueOf()
	return now - then > 86400000
}

function checkInvalidity (object) {
	if (object === undefined || object.values === undefined || object.values === null || object.values.length === 0 || isOld(object)) {
		return true
	}
	return false
}

function clearCache () {
	cache.sources.trello.boards = {date: null, values: []}
	saveCache()
}

const calls = {
	trello: {
		getBoards: () => {
			return cache.sources.trello.boards
		},
		setBoards: (data) => {
			cache.sources.trello.boards = data
		},
		getToken: () => {
			return cache.sources.trello.token
		},
		setToken: (data) => {
			cache.sources.trello.token = data
		},
		getUsed: () => {
			return cache.sources.trello.used
		},
		setUsed: (value) => {
			cache.sources.trello.used = value
		},
		getBoardData: (id) => {
			var found = false
			var value = null
			cache.sources.trello.boards.values.forEach((element) => {
				if (!found || element.id === id) {
					found = true
					value = element
				}
			})
			return value
		},
		setBoardData: (id, data) => {
			cache.sources.trello.boards.values.forEach((element) => {
				if (element.id === id) {
					element = data
				}
			})
		},
		addCard: (data) => {
			var found = false
			cache.sources.trello.boards.values.forEach((board) => {
				if (board.id === data.idBoard) {
					board.values.forEach((list) => {
						if (!found && list.id === data.idList) {
							found = true
							list.cards.push({name: data.name})
							saveCache()
						}
					})
				}
			})
		},
		getCard: (cardId) => {
			var found = false
			var value = null
			cache.sources.trello.boards.values.forEach((board) => {
				if (found || (!found && board.values === undefined)) { return } // handle non-cached boards
				board.values.forEach((list) => {
					if (!found) {
						list.cards.forEach((card) => {
							if (card.id === cardId) {
								found = true
								value = card
							}
						})
					}
				})
			})
			return value
		}
	},
	helper: {
		isOld: isOld,
		checkInvalidity: checkInvalidity
	}
}
module.exports = {
	cache: cache,
	loadCache: loadCache,
	saveCache: saveCache,
	calls: calls,
	clearCache: clearCache
}
