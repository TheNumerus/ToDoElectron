const fs = require('fs')
const globalProperties = require('./globalProperties')
const cacheModule = require('./cache')
var path

function initialize () {
	return new Promise((resolve, reject) => {
		createPathString()
		checkForFolder().then(() => {
			cacheModule.loadCache().then(() => {
				resolve()
			})
		}).catch((error) => {
			if (error.code === 'ENOENT') {
				createFolder()
			}
		})
	})
}

/**
 * creates string with path to folder, depending on OS
 * @todo add other OSs
 */
function createPathString () {
	switch (process.platform) {
	case 'win32': {
		path = 'C:\\Users\\' + require('os').userInfo().username + '\\AppData\\Roaming\\ToDoElectron\\'
		break
	}
	case 'darwin': {
		break
	}
	case 'linux': {
		break
	}
	}
	// save it, so we can use it anywhere
	globalProperties.path = path
}

/**
 * asynchronusly checks for existence of  main folder
 * @param {path} path to check
 * @return {Promise} Promise
 */
function checkForFolder () {
	return new Promise((resolve, reject) => {
		fs.access(path, fs.constants.F_OK, (error) => {
			if (error !== null) {
				reject(error.code)
			} else {
				resolve()
			}
		})
	})
}

/**
 * Creates folder for data
 */
function createFolder () {
	return new Promise((resolve, reject) => {
		fs.mkdir(path, (error) => {
			if (error) throw error
			resolve()
		})
	})
}

module.exports = {
	initialize: initialize
}
