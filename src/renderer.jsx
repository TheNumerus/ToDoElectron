const ReactDOM = require('react-dom')
const React = require('react')
const BoardButton = require('./trelloComponents.js').BoardButton
const ipcRenderer = require('electron').ipcRenderer

function authorize () {
	ipcRenderer.send('trelloAuthorize')
}

function getUserInfo () {
	ipcRenderer.send('trelloGetAllUserInfo')
}

function getBoards () {
	ipcRenderer.send('trelloGetBoards')
}

function clearCache () {
	ipcRenderer.send('clearCache')
}

ipcRenderer.on('trelloGetAllUserInfo-reply', (event, value) => {
	document.querySelector('#data').innerHTML = JSON.stringify(value)
})

ipcRenderer.on('trelloGetBoards-reply', (event, boards) => {
	var boardComponents = boards.map((board) => {
		return <BoardButton class='boardRedirectButton' name={board.name} id={board.id}/>
	})
	ReactDOM.render(<div>{boardComponents}</div>, document.querySelector('#data'))
})
