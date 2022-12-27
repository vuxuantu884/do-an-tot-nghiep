import { dangerColor, greenColor, textBodyColor } from "utils/global-styles/variables";
import { formatCurrency } from "utils/AppUtils";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import React from "react";

export const columns = [
  {
    title: "SKU",
    dataIndex: "sku",
    key: "sku",
    width: 160,
  },
  {
    title: "Thay đổi",
    width: 70,
    dataIndex: "quantity",
    key: "quantity",
    render: (value: number) => {
      return (
        <div className="text-center" style={{ color: value === 0 ? textBodyColor : value > 0 ? greenColor : dangerColor }}>
          {formatCurrency(value)}
        </div>
      )
    }
  },
  {
    title: "Tồn trong kho",
    width: 90,
    dataIndex: "on_hand",
    key: "on_hand",
    render: (value: number) => {
      return (
        <div className="text-center">{formatCurrency(value)}</div>
      )
    }
  },
  {
    title: "Thời gian",
    width: 120,
    dataIndex: "transaction_date",
    key: "transaction_date",
    render: (value: string) => {
      return ConvertUtcToLocalDate(value, "DD/MM/YYYY HH:mm")
    }
  }
];