/// <reference path="trelloApi.d.ts" />

interface AttachmentProps {
    attData: Attachment
}

interface AttachmentControlProps extends AttachmentProps{
    isCover: boolean,
    changeCover(idCover: string): void
}

interface BadgesProps {
    badges: Badges
}

interface CardDataProps {
    cardData: CardData
}

interface LabelProps {
    labelData: Label
}

interface BoardProps {
    boardData: BoardData
}

interface ChecklistProps {
    checklistData: Checklist
}

interface CheckProps {
    check: Check
}
interface CommentProps {
    commentData: Action
}