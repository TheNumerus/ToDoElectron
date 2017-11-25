import {TrelloTypes} from './trelloInterfaces'

export module TrelloInterfacesProps {
	interface IAttachmentProps {
		attData: TrelloTypes.Attachment
	}

	interface IAttachmentControlProps extends IAttachmentProps {
		isCover: boolean,
		changeCover (idCover: string): void
	}

	interface IBadgesProps {
		badges: TrelloTypes.Badges
	}

	interface ICardDataProps {
		cardData: TrelloTypes.CardData
	}

	interface ILabelProps {
		labelData: TrelloTypes.Label
	}

	interface IBoardProps {
		boardData: TrelloTypes.BoardData
	}

	interface IListProps {
		listData: TrelloTypes.ListData
	}

	interface IChecklistProps {
		checklistData: TrelloTypes.Checklist
	}

	interface ICheckProps {
		check: TrelloTypes.Check
	}
	interface ICommentProps {
		commentData: TrelloTypes.Action
	}

}