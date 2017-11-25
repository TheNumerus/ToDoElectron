import globalProperties from './globalProperties'
import * as fs from 'fs'
var pathToFolder

/**
 * asynchronusly checks for existence of file/folder in set path
 */
export function checkExistence (path = '') {
	return new Promise<string>(function (resolve, reject) {
		fs.access(pathToFolder + path, fs.constants.F_OK, (error: Error) => {
			if (error) {
				reject(error)
			} else {
				resolve(pathToFolder + path)
			}
		})
	})
}

/**
 * saves image to location
 */
export function saveImage (filename: string, data: Buffer) {
	return new Promise<string>(function (resolve, reject) {
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
