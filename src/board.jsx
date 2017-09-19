const ReactDOM = require('react-dom')
const React = require('react')
const Board = require('./trelloComponents').Board
const ipcRenderer = require('electron').ipcRenderer
const URL = require('url').URL
const boardId = new URL(window.location.href).searchParams.get('id')

ipcRenderer.send('trelloGetBoardData', boardId, false)
ipcRenderer.on('trelloGetBoardData-reply', (event, boardData, imagePath) => {
	document.querySelector('#boardName').innerHTML = boardData.name
	ReactDOM.render(<Board boardData={boardData}/>, document.querySelector('#lists'))
	// stop spinning refresh icon
	document.querySelector('#updateIcon').classList.remove('fa-spin')
})

ipcRenderer.on('trelloSetBackground', (event, imagePath) => {
	// handle solid color background
	if (imagePath[0] === '#') {
		document.querySelector('body').style.backgroundColor = imagePath
	} else {
		document.querySelector('body').background = imagePath
	}
})

document.querySelector('.button.back').addEventListener('click', (event) => {
	ipcRenderer.send('goBack')
})

document.querySelector('#update.button').addEventListener('click', (event) => {
	document.querySelector('#updateIcon').classList.add('fa-spin')
	ipcRenderer.send('trelloGetBoardData', boardId, true)
})
