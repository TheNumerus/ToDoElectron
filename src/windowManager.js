const {ipcMain} = require('electron')
let history = []
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
	history.push(url)
	window.loadURL(url)
}

ipcMain.on('goBack', (event) => {
	if (history.length > 0) {
		history.pop()
		window.loadURL(history[history.length - 1])
	}
})

ipcMain.on('readyToShow', (event) => {
	window.show()
})
module.exports = {
	initialize: initialize,
	openURL: openURL
}
