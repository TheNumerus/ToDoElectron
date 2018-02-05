export const changePage = (page: string, id?: string) => {
	return {
		type: 'CHANGE_PAGE',
		page,
		id
	}
}
