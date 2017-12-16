import * as dotenv from 'dotenv'
import * as electron from 'electron'
import * as connectionChecker from './connectionChecker'
import * as dataController from './dataController'
import * as protocols from './protocols'
import * as windowManager from './windowManager'
const app = electron.app
// enable backdrop blur in css
app.commandLine.appendSwitch('--enable-experimental-web-platform-features')

/**
 * call methods after app has loaded
 */
app.on('ready', async () => {
	dotenv.config({path: './.env'})
	await dataController.initialize()
	windowManager.createWindow()
	protocols.registerToDoProtocol()
	connectionChecker.startCheck()
})

app.on('window-all-closed', () => {
	// special behaviour for macOS
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if (windowManager.getMainWindow() === null) {
		windowManager.createWindow()
	}
})
