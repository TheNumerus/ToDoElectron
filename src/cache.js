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
	fs.readFile(globalProperties.path + 'cache', (error, data) => {
		if (error) {
			// handle non-existing file
			if (error.code === 'ENOENT') {
				saveCache()
				return
			}
			throw error
		} else {
			if (data.length === 0) {
				throw new Error('Empty file')
			}
			cache = JSON.parse(data.toString())
		}
	})
}
module.exports = {
	cache: cache,
	loadCache: loadCache,
	saveCache: saveCache
}
