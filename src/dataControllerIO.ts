import globalProperties from './globalProperties'
import * as path from 'path'
import * as fs from 'fs'
import * as cacheModule from './cache'
import * as settings from './settings'
const paths = ['', 'background/', 'background/thumbs/', 'attachments/']
var pathToFolder

export async function initialize () {
	pathToFolder = globalProperties.getPath()
	try {
		await checkForFolders()
	} catch (e) {
		await createFolders()
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

async function checkForFolders () {
	var checks = paths.map((folder) => {
		return checkForFolder(path.join(pathToFolder, folder))
	})
	return Promise.all(checks)
}

async function createFolders () {
	var checks = paths.map((folder) => {
		return createFolder(path.join(pathToFolder, folder))
	})
	return Promise.all(checks)
}
/**
 * asynchronusly checks for existence of folder
 */
function checkForFolder (pathToCheck = '') {
	return new Promise((resolve, reject) => {
		fs.access(pathToCheck, fs.constants.F_OK, (error) => {
			if (error && error.code !== 'EEXIST') {
				reject(error)
			}
			resolve(true)
		})
	})
}

/**
 * Creates folder
 */
function createFolder (pathToCheck = '') {
	return new Promise((resolve, reject) => {
		fs.mkdir(pathToCheck, (error) => {
			if (error && error.code !== 'EEXIST') {
				reject(error)
			}
			resolve(true)
		})
	})
}
