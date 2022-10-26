import { PromotionConstants } from "./promotion.constant";

export const promotionUtils = {
  combinePrivateNoteAndPromotionTitle: (privateNote: string, promotionTitle: string) => {
    return `${PromotionConstants.combinePromotionTextAndPrivateNote}:${promotionTitle}${PromotionConstants.promotionTitleEndText}${privateNote} `;
  },
  findTextPromotionTitleFromResponse: (orderPrivateNoteIncludePromotionTitle: string) => {
    const indexStart = orderPrivateNoteIncludePromotionTitle.indexOf(
      PromotionConstants.combinePromotionTextAndPrivateNote,
    );
    const afterRemoveStart = orderPrivateNoteIncludePromotionTitle.replace(
      PromotionConstants.combinePromotionTextAndPrivateNote,
      "",
    );
    console.log("indexStart", indexStart);
    // const indexEnd =PromotionConstants.combinePromotionTextAndPrivateNote.indexOf(afterRemoveStart);
    const indexEnd = afterRemoveStart.indexOf(PromotionConstants.promotionTitleEndText);
    console.log("indexEnd", indexEnd);
    console.log("afterRemoveStart", afterRemoveStart);
    if (indexStart > -1 && indexEnd > -1) {
      const abc = indexEnd + PromotionConstants.combinePromotionTextAndPrivateNote.length + 1;
      console.log("abc", abc);
      return orderPrivateNoteIncludePromotionTitle
        .substring(indexStart, abc)
        .replace(PromotionConstants.promotionTitleEndText, "");
    }
    return "";
  },
  getPrivateNoteFromResponse: (orderPrivateNoteIncludePromotionTitle: string) => {
    const promotionTitle =
      promotionUtils.findTextPromotionTitleFromResponse(orderPrivateNoteIncludePromotionTitle) +
      PromotionConstants.promotionTitleEndText;
    const regexFunction = new RegExp(promotionTitle, "g");
    return orderPrivateNoteIncludePromotionTitle.replace(regexFunction, "");
  },
  getPromotionText: (orderPrivateNoteIncludePromotionTitle: string) => {
    // return orderPrivateNoteIncludePromotionTitle.replace(regexFunction, "");
    const result2 = promotionUtils.findTextPromotionTitleFromResponse(
      orderPrivateNoteIncludePromotionTitle,
    );
    const replaceText =
      PromotionConstants.combinePromotionTextAndPrivateNote +
      "|/" +
      PromotionConstants.promotionTitleEndText +
      "|:";
    const regexFunction = new RegExp(replaceText, "g");
    const result = result2.replace(regexFunction, "");
    return result;
  },
};
