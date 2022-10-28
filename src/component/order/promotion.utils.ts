import { PromotionConstants } from "./promotion.constant";

export const promotionUtils = {
  combinePrivateNoteAndPromotionTitle: (privateNote: string, promotionTitle: string) => {
    if (promotionTitle.trim()) {
      return `${PromotionConstants.combinePromotionTextAndPrivateNote}${promotionTitle}${PromotionConstants.promotionTitleEndText}${privateNote}`;
    } else {
      return privateNote;
    }
  },
  checkIfPrivateNoteHasPromotionText: (note: string) => {
    return note.includes(PromotionConstants.combinePromotionTextAndPrivateNote);
  },
  getPromotionTextFromResponse: (orderPrivateNoteIncludePromotionTitle: string) => {
    const indexStart = orderPrivateNoteIncludePromotionTitle.indexOf(
      PromotionConstants.combinePromotionTextAndPrivateNote,
    );
    const afterRemoveStart = orderPrivateNoteIncludePromotionTitle.replace(
      PromotionConstants.combinePromotionTextAndPrivateNote,
      "",
    );
    console.log("indexStart", indexStart);
    // const indexEnd =PromotionConstants.combinePromotionTextAndPrivateNote.indexOf(afterRemoveStart);
    const end = afterRemoveStart.indexOf(PromotionConstants.promotionTitleEndText);
    console.log("end", end);
    console.log("afterRemoveStart", afterRemoveStart);
    if (indexStart > -1 && end > -1) {
      const indexEnd = end + PromotionConstants.combinePromotionTextAndPrivateNote.length;
      console.log("indexEnd", indexEnd);
      return orderPrivateNoteIncludePromotionTitle
        .substring(indexStart, indexEnd)
        .replace(PromotionConstants.combinePromotionTextAndPrivateNote, "")
        .replace(PromotionConstants.promotionTitleEndText, "");
    }
    return "";
  },
  getPrivateNoteFromResponse: (orderPrivateNoteIncludePromotionTitle: string) => {
    let promotionTitle = promotionUtils.getPromotionTextFromResponse(
      orderPrivateNoteIncludePromotionTitle,
    );
    return orderPrivateNoteIncludePromotionTitle
      .replace(PromotionConstants.combinePromotionTextAndPrivateNote, "")
      .replace(promotionTitle, "")
      .replace(PromotionConstants.promotionTitleEndText, "");
  },
};
