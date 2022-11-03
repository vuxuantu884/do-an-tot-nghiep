import {useEffect, useState} from "react";
import {showError} from "utils/ToastUtils";
import {getListPriceRuleGiftService} from "../../../service/order/order.service";

export type PromotionType = { [key: number]: string }

function useGetGiftPromotions() {
  const [giftPromotions, setGiftPromotions] =
    useState({} as PromotionType);
  useEffect(() => {
    getListPriceRuleGiftService({states: 'ACTIVE', page: 1, limit: 200})
      .then((response) => {
        if (response) {
          let result: PromotionType = {};
          response.data.items.forEach((promotion) => result[promotion.id] = promotion.title)
          setGiftPromotions(result);
        } else {
          showError("Lỗi");
        }
      })
      .catch((error) => {
        console.log("error", error);
        showError(`Danh sách lỗi: ${error.response.data.message}`);
      });
  }, []);

  return {giftPromotions};
}

export default useGetGiftPromotions;
