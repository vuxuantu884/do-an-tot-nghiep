import {
  BUSINESS_RESULT_CART_DESCRIPTION,
  BUSINESS_RESULT_CART_LABEL,
  BUSINESS_RESULT_CART_NAME,
} from "config/dashboard";
import React from "react";
import { DashboardContext } from "../provider/dashboard-provider";
import IncomeBox, { IncomeBoxProps } from "./income-box";

type Props = Partial<IncomeBoxProps> & {
  dataKey: string;
};

function BusinessCard({ dataKey, ...rest }: Props) {
  const { dataSrcBusinessResultCard } = React.useContext(DashboardContext);
  let value = dataSrcBusinessResultCard.get(dataKey)?.value;
  let monthlyAccumulated = dataSrcBusinessResultCard.get(dataKey)?.monthlyAccumulated;
  const {
    companyTotalSales,
    offlineTotalSales,
    onlineTotalSales,
    companyOrders,
    offlineOrders,
    onlineOrders,
  } = BUSINESS_RESULT_CART_NAME;
  if (dataKey === companyOrders) {
    value =
      (dataSrcBusinessResultCard.get(offlineOrders)?.value || 0) +
      (dataSrcBusinessResultCard.get(onlineOrders)?.value || 0);
    monthlyAccumulated =
      (dataSrcBusinessResultCard.get(offlineOrders)?.monthlyAccumulated || 0) +
      (dataSrcBusinessResultCard.get(onlineOrders)?.monthlyAccumulated || 0);
  } else if (dataKey === companyTotalSales) {
    value =
      (dataSrcBusinessResultCard.get(offlineTotalSales)?.value || 0) +
      (dataSrcBusinessResultCard.get(onlineTotalSales)?.value || 0);
    monthlyAccumulated =
      (dataSrcBusinessResultCard.get(offlineTotalSales)?.monthlyAccumulated || 0) +
      (dataSrcBusinessResultCard.get(onlineTotalSales)?.monthlyAccumulated || 0);
  }
  return (
    <IncomeBox
      description={BUSINESS_RESULT_CART_DESCRIPTION[dataKey]}
      title={BUSINESS_RESULT_CART_LABEL[dataKey]}
      value={value}
      monthlyAccumulated={monthlyAccumulated}
      {...rest}
    />
  );
}

export default BusinessCard;
