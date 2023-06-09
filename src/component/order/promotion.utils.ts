import { CustomerOrderHistoryResponse, OrderResponse } from "model/response/order/order.response";
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
    // const indexEnd =PromotionConstants.combinePromotionTextAndPrivateNote.indexOf(afterRemoveStart);
    const end = afterRemoveStart.indexOf(PromotionConstants.promotionTitleEndText);
    if (indexStart > -1 && end > -1) {
      const indexEnd = end + PromotionConstants.combinePromotionTextAndPrivateNote.length;
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
    console.log("promotionTitle", promotionTitle);
    console.log("orderPrivateNoteIncludePromotionTitle", orderPrivateNoteIncludePromotionTitle);
    return orderPrivateNoteIncludePromotionTitle
      .replace(PromotionConstants.combinePromotionTextAndPrivateNote, "")
      .replace(promotionTitle, "")
      .replace(PromotionConstants.promotionTitleEndText, "");
  },
  // lúc trước truyền tên chương trình khuyến mại vào reason, nên lấy thêm ở reason
  getAllPromotionTitle: (orderDetail: OrderResponse | CustomerOrderHistoryResponse) => {
    const lineItemsPromotionTitle = orderDetail.items
      .filter((item) => {
        return (
          item.discount_items.length > 0 &&
          (item.discount_items[0].amount > 0 || item.discount_items[0].promotion_id)
        );
      })
      .map(
        (single) =>
          single.discount_items[0].promotion_title || single.discount_items[0].reason || "",
      );
    const orderPromotionTitle =
      orderDetail.discounts &&
      orderDetail.discounts.length > 0 &&
      orderDetail.discounts[0].amount > 0
        ? [orderDetail.discounts[0].promotion_title || orderDetail.discounts[0].reason || ""]
        : [];

    // thêm tên chương trình ở ghi chú nội bộ
    const promotionTitleByPrivateNote = promotionUtils.getPromotionTextFromResponse(
      orderDetail.note || "",
    );
    const promotionTitleByPrivateNoteArr = [promotionTitleByPrivateNote];
    const allPromotionTitle = [
      ...lineItemsPromotionTitle,
      ...orderPromotionTitle,
      ...promotionTitleByPrivateNoteArr,
    ].filter((single) => single);
    return allPromotionTitle.length > 0 ? allPromotionTitle.join(",") : "";
  },
};
