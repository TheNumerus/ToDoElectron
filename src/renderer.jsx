const ReactDOM = require('react-dom')
const React = require('react')
const BoardButton = require('./trelloComponents.js').BoardButton
const ipcRenderer = require('electron').ipcRenderer

document.querySelector('#authorizeTrello').addEventListener('click', () => {
	ipcRenderer.send('trelloAuthorize')
})

document.querySelector('#userInfo').addEventListener('click', () => {
	ipcRenderer.send('trelloGetAllUserInfo')
})

document.querySelector('#getBoards').addEventListener('click', () => {
	ipcRenderer.send('trelloGetBoards')
})

ipcRenderer.on('trelloGetAllUserInfo-reply', (event, value) => {
	document.querySelector('#data').innerHTML = JSON.stringify(value)
})

ipcRenderer.on('trelloGetBoards-reply', (event, value) => {
	var boardComponents = []
	value.forEach((board) => {
		var element = <BoardButton class='boardRedirectButton' name={board.name} id={board.id}/>
		boardComponents.push(element)
	}, this)
	ReactDOM.render(<div>{boardComponents}</div>, document.querySelector('#data'))
	// we need to add listener afterwards, because it will otherwise fire event upon creation
	var list = document.querySelectorAll('.boardRedirectButton')
	list.forEach((button) => {
		button.addEventListener('click', (event) => {
			ipcRenderer.send('trelloOpenBoard', button.id)
		})
	})
})
