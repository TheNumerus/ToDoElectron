import globalProperties from './globalProperties'
const fs = require('fs')
var pathToFolder

/**
 * asynchronusly checks for existence of file/folder in set path
 * @param {path} path to check
 * @return {Promise} Promise
 */
export function checkExistence (path = '') {
	return new Promise(function (resolve, reject) {
		fs.access(pathToFolder + path, fs.constants.F_OK, (error) => {
			if (error) {
				reject(error)
			} else {
				resolve(pathToFolder + path)
			}
		})
	})
}

/**
 * saves image to location if needed
 * @param {string} filename - saves to this path
 * @param {Buffer} data - data to save
 */
export function saveImage (filename, data) {
	return new Promise(function (resolve, reject) {
		fs.writeFile(pathToFolder + filename, data, (error) => {
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
