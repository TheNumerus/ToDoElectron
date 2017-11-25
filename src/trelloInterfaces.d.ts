export module TrelloTypes {
		interface AddRequest {
		name: string,
		id: string
	}

	type UpdateOptions = {key: string, value: any}[]

	interface PageUpdateOptions {
		forceUpdate: boolean,
		refresh: boolean
	}

	interface CardData {
		attachments : Attachment[],
		badges: Badges,
		comments: Action[],
		desc: string,
		due: string,
		dueComplete: string,
		checklistData: Checklist[],
		id: string,
		idAttachmentCover: string,
		idChecklists: string[],
		labels: Label[],
		name: string,
		placeholder: boolean,
		url: string
	}

	interface ListData {
		cards: CardData[],
		id: string,
		name: string
	}

	interface BoardData {
		closed: boolean,
		date: number,
		name: string,
		id: string,
		prefs: BoardPrefs,
		values: ListData[]
	}

	interface Attachment {
		date: string,
		edgeColor: string,
		id: string,
		name: string,
		isUpload: boolean,
		url: string
	}

	interface Action {
		data: {
			text: string
		}
		id: string,
		memberCreator: {
			fullName: string
		}
		type: string
	}

	interface Badges {
		attachments: number,
		comments: number,
		checkItems: number,
		checkItemsChecked: number
	}

	interface Label {
		color: string,
		id: string,
		name: string
	}

	interface Checklist {
		id: string,
		name: string
		checkItems: Check[]
	}

	interface Check {
		name: string
		pos: number
		state: 'complete'|'incomplete'
	}


	interface BoardPrefs {
		backgroundColor: string,
		backgroundImage: string,
		backgroundImageScaled: Array<BoardBackgoundScaled>
	}
	interface BoardBackgoundScaled {
		url: string
	}
}