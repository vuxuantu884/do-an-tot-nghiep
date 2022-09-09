import {
  DailyRevenueOtherPaymentTypeArrModel,
  DailyRevenueOtherPaymentTypeModel,
} from "model/order/daily-revenue.model";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { dailyRevenueService } from "service/order/daily-revenue.service";
import { showError } from "utils/ToastUtils";

function useGetDailyRevenueOtherPaymentTypes() {
  const [dailyRevenueOtherPaymentType, setDailyRevenueOtherPaymentType] =
    useState<DailyRevenueOtherPaymentTypeArrModel>();

  const dispatch = useDispatch();

  useEffect(() => {
    dailyRevenueService
      .getDailyPaymentType()
      .then((response) => {
        if (response) {
          const result: DailyRevenueOtherPaymentTypeArrModel = Object.entries(response).map(
            (single) => {
              const [, valueOtherPaymentType] = single;
              const valueResult: DailyRevenueOtherPaymentTypeModel = valueOtherPaymentType;
              const title = valueResult.description;
              const value = valueResult.code;
              return {
                title,
                value,
              };
            },
          );
          setDailyRevenueOtherPaymentType(result);
        } else {
          showError("Danh sách loại chi phí không truy cập được");
        }
      })
      .catch((error) => {
        console.log("error", error);
        showError(`Danh sách loại chi phí: ${error.response.data.message}`);
      });
  }, [dispatch]);

  return dailyRevenueOtherPaymentType;
}

export default useGetDailyRevenueOtherPaymentTypes;
