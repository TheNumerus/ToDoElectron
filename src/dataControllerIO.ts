import * as fs from 'fs'
import * as path from 'path'
import * as cacheModule from './cache'
import globalProperties from './globalProperties'
import * as settings from './settings'
const paths = ['', 'background/', 'background/thumbs/', 'attachments/']
let pathToFolder

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
	for (const folder of paths) {
		await checkForFolder(folder)
	}
}

async function createFolders () {
	for (const folder of paths) {
		await createFolder(folder)
	}
}
/**
 * asynchronusly checks for existence of folder
 */
function checkForFolder (pathToCheck: string) {
	return new Promise((resolve, reject) => {
		fs.access(pathToFolder + pathToCheck, fs.constants.F_OK, (error) => {
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
function createFolder (pathToCreate: string) {
	return new Promise((resolve, reject) => {
		fs.mkdir(pathToFolder + pathToCreate, (error) => {
			if (error && error.code !== 'EEXIST') {
				reject(error)
			}
			resolve(true)
		})
	})
}

/**
 * Deletes file
 */
function deleteFile (pathToDelete: string) {
	return new Promise((resolve, reject) => {
		fs.unlink(pathToFolder + pathToDelete, (error) => {
			if (error) {
				reject(error)
			}
			resolve(true)
		})
	})
}

/**
 * Deletes file
 */
function deleteFolder (pathToDelete: string) {
	return new Promise((resolve, reject) => {
		fs.rmdir(pathToFolder + pathToDelete, (error) => {
			if (error) {
				reject(error)
			}
			resolve(true)
		})
	})
}

function getFolderContents (pathToCheck: string): Promise<string[]> {
	return new Promise((resolve, reject) => {
		fs.readdir(pathToFolder + pathToCheck, (error: Error, files: string[]) => {
			if (error) {
				reject(error)
			}
			resolve(files)
		})
	})
}
/**
 * deletes all downloaded images
 */
export async function deleteImageCache (event: Event) {
	let images = await getFolderContents('background/thumbs/')
	for (const image of images) {
		await deleteFile('background/thumbs/' + image)
	}
	images = await getFolderContents('background/')
	for (const image of images) {
		await deleteFile('background/' + image)
	}
	images = await getFolderContents('attachments/')
	for (const image of images) {
		await deleteFile('attachments/' + image)
	}
}
