const ReactDOM = require('react-dom')
const React = require('react')
const CardCompoment = require('./trelloComponents').CardComponent
const ListCompoment = require('./trelloComponents').ListComponent
const ipcRenderer = require('electron').ipcRenderer
const URL = require('url').URL
const boardId = new URL(window.location.href).searchParams.get('id')

ipcRenderer.send('trelloGetBoardData', boardId)
ipcRenderer.on('trelloGetBoardData-reply', (event, boardData) => {
	// set board name
	document.querySelector('#boardName').innerHTML = boardData.name
	// render empty lists
	var listComponents = []
	boardData.lists.forEach((list) => {
		var element = <ListCompoment name={list.name} id={list.id}/>
		// pair lists with ids for later use
		listComponents.push(element)
	}, this)
	ReactDOM.render(<div>{listComponents}</div>, document.querySelector('#lists'))

	// now we get list data and render it
	var listIds = []
	boardData.lists.forEach((list) => {
		listIds.push(list.id)
	}, this)
	ipcRenderer.send('trelloGetBatchListData', listIds)
	ipcRenderer.send('trelloGetBackground', boardData.id)
})

ipcRenderer.on('trelloGetBatchListData-reply', (event, listData) => {
	// first get lists array paired with ids
	var cardContainers = { elements: [], ids: [] }
	cardContainers.elements = document.querySelectorAll('.cardContainer')
	cardContainers.elements.forEach((cardContainer) => {
		cardContainers.ids.push(cardContainer.id)
	})
	listData.values.forEach((list) => {
		// handle empty lists
		if (list.length < 1) { return }
		var target = cardContainers['elements'][(cardContainers['ids'].indexOf(list[0].idList))]
		var cardComponents = []
		list.forEach((card) => {
			// handle archived cards
			if (card.closed) { return }
			var element = <CardCompoment card={card}/>
			cardComponents.push(element)
		})
		ReactDOM.render(<div>{cardComponents}</div>, target)
	}, this)
})

ipcRenderer.on('trelloGetBackground-reply', (event, imagePath) => {
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
