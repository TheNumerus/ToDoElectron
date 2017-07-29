const fs = require('fs')
const globalProperties = require('./globalProperties')

var cache = {
	sources: {
		trello: {
			used: undefined,
			token: undefined,
			boards: {
				date: undefined,
				values: undefined
			}
		},
		googlecal: {
			used: undefined,
			values: {}
		},
		nologin: {
			used: true,
			values: {}
		}
	}
}

function saveCache () {
	fs.writeFile(globalProperties.path + 'cache', JSON.stringify(cache), (error) => {
		if (error) throw error
	})
}

function loadCache () {
	return new Promise(function (resolve, reject) {
		fs.readFile(globalProperties.path + 'cache', (error, data) => {
			if (error) {
				// handle non-existing file
				if (error.code === 'ENOENT') {
					saveCache()
					return
				}
				reject(error)
			} else {
				if (data.length === 0) {
					reject(Error('Empty file'))
				}
				cache = JSON.parse(data.toString())
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
const calls = {
	trello: {
		getBoards: () => {
			return cache.sources.trello.boards
		},
		setBoards: (data) => {
			cache.sources.trello.boards = data
		}
	},
	helper: {
		isOld: isOld
	}
}
module.exports = {
	cache: cache,
	loadCache: loadCache,
	saveCache: saveCache,
	calls: calls
}
