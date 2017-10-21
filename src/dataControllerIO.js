const fs = require('fs')
const globalProperties = require('./globalProperties')
const cacheModule = require('./cache')
const settings = require('./settings')
var path

async function initialize () {
	createPathString()
	try {
		await checkForFolder()
	} catch (e) {
		await createFolder()
		await cacheModule.saveCache()
		return
	}
	try {
		await cacheModule.loadCache()
	} catch (e) {
		await cacheModule.saveCache()
	}
	try {
		await settings.initialize()
	} catch (e) {
		await settings.save()
	}
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
		path = '/home/' + require('os').userInfo().username + '/.todoelectron/'
		break
	}
	}
	// save it, so we can use it anywhere
	globalProperties.path.set(path)
}

/**
 * asynchronusly checks for existence of  main folder
 * @param {path} path to check
 * @return {Promise} Promise
 */
function checkForFolder () {
	return new Promise((resolve, reject) => {
		fs.access(path, fs.constants.F_OK, (error) => {
			if (error) { reject(error) }
			resolve(true)
		})
	})
}

/**
 * Creates folder for data
 */
function createFolder () {
	return new Promise((resolve, reject) => {
		fs.mkdir(path, (error) => {
			if (error) { reject(error) }
			resolve(true)
		})
	})
}

module.exports = {
	initialize: initialize
}
