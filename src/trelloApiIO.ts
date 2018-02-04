import * as fs from 'fs'
import * as globalProperties from './globalProperties'
let pathToFolder

/**
 * asynchronusly checks for existence of file/folder in set path
 */
export function checkExistence (path = '') {
	return new Promise<boolean>((resolve, reject) => {
		fs.access(pathToFolder + path, fs.constants.F_OK, (error: NodeJS.ErrnoException) => {
			if (error) {
				// ENOENT is file doesnt exist error
				if (error.code !== 'ENOENT') {
					reject(error)
				}
				resolve(false)
			} else {
				resolve(true)
			}
		})
	})
}

/**
 * saves image to location
 */
export function saveImage (filename: string, data: Buffer) {
	return new Promise<string>((resolve, reject) => {
		fs.writeFile(pathToFolder + filename, data, (error: Error) => {
			if (error) {
				reject(error)
			} else {
				resolve(pathToFolder + filename)
			}
		})
	})
}
export function initialize () {
	pathToFolder = globalProperties.getPath()
}
