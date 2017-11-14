import globalProperties from './globalProperties'
const fs = require('fs')
const cacheModule = require('./cache')
const settings = require('./settings')
var path

async function initialize () {
	path = globalProperties.getPath()
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
