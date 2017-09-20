const ReactDOM = require('react-dom')
const React = require('react')
const CardDetail = require('./trelloDetailsComponents')
const ipcRenderer = require('electron').ipcRenderer
const URL = require('url').URL
const cardId = new URL(window.location.href).searchParams.get('id')

ipcRenderer.send('trelloGetCardData', cardId, false)
ipcRenderer.on('trelloGetCardData-reply', (event, cardData) => {
	ReactDOM.render(<CardDetail cardData={cardData}/>, document.querySelector('#container'))
})

/* document.querySelector('.button.back').addEventListener('click', (event) => {
	ipcRenderer.send('goBack')
})

document.querySelector('#update.button').addEventListener('click', (event) => {
	document.querySelector('#updateIcon').classList.add('fa-spin')
	ipcRenderer.send('trelloGetBoardData', cardId, true)
}) */
