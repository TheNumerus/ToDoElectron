import { CheckState } from './trelloApi'

export module TrelloTypes {
	interface AddRequest {
		name: string,
		id: string
	}

	type UpdateOptions = [string, any][]

	interface CheckListUpdateIds {
		cardId: string,
		idCheckItem: string
	}

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
		pos: number,
		url: string
	}

	interface ListData {
		cards: CardData[],
		id: string,
		name: string,
		pos: number
	}

	interface BoardData {
		closed: boolean,
		date: number,
		name: string,
		id: string,
		pinned: boolean,
		prefs: BoardPrefs,
		starred: boolean,
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
		name: string,
		checkItems: Check[]
	}

	interface Check {
		id: string,
		name: string,
		pos: number,
		state: CheckState
	}

	interface BoardPrefs {
		backgroundBrightness: 'light' | 'dark',
		backgroundColor: string,
		backgroundImage: string,
		backgroundImageScaled: Array<BoardBackgoundScaled>
	}
	interface BoardBackgoundScaled {
		url: string
	}

	interface SortCard {
		ids: {
			idCard: string,
			idBoard: string,
			idList: string
		}
		newIndex: number,
		oldIndex: number
	}

	interface SortList {
		ids: {
			idBoard: string,
			idList: string
		}
		newIndex: number,
		oldIndex: number
	}
}