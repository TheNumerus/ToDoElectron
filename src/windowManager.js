const {ipcMain} = require('electron')
let previousURL
let currentURL
/**
 * @type {Electron.BrowserWindow}
 */
let window
/**
* Initialize windowManager
* @param {Electron.BrowserWindow} broswerWindow - window to manage
*/
function initialize (broswerWindow) {
	window = broswerWindow
}
/**
 * Opens provided url in main window
 * @param {url.URL} url - url to load
 */
function openURL (url) {
	previousURL = currentURL
	currentURL = url
	window.loadURL(url)
}

ipcMain.on('goBack', (event) => {
	if (previousURL !== undefined) {
		window.loadURL(previousURL)
		[currentURL, previousURL] = [previousURL, currentURL]
	}
})

module.exports = {
	initialize: initialize,
	openURL: openURL
}
