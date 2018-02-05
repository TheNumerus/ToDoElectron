const changePage = (state = 'HOME', action) => {
	switch (action.type) {
		case 'CHANGE_PAGE':
			return {
				page: action.page,
				id: action.id
			}
		default:
			return 'HOME'
	}
}

export default changePage
