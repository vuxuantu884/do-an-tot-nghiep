import _ from "lodash";
import { ShopRevenueModel } from "model/order/daily-revenue.model";
import { PagingParam, ResultPaging } from "model/paging";
import { AnalyticConditions, AnalyticQuery, AnalyticResult } from "model/report";
import { DailyRevenueTableModel } from "model/revenue";
import { formatCurrency } from "utils/AppUtils";
import { flatDataPaging } from "utils/Paging";
import { generateRQuery } from "utils/ReportUtils";

export const columnsReport = {
  cashPayments: "cash_payments",
  vnpayPayments: "vnpay_payments",
  momoPayments: "momo_payments",
  transferPayments: "transfer_payments",
  cardPayments: "card_payments",
  unknownPayments: "unknown_payments",
  vcbPayments: "vcb_payments",
  total_sales: "total_sales",
};

export const dailyRevenueStatus = {
  draft: {
    title: "Mới",
    value: "draft",
  },
  paying: {
    title: "Chưa nộp tiền",
    value: "paying",
  },
  paid: {
    title: "Đã nộp tiền",
    value: "paid",
  },
  finished: {
    title: "Đã xác nhận",
    value: "finished",
  },
};

export const getDataTable = (pagingParam?: PagingParam): ResultPaging => {
  let fakeData: DailyRevenueTableModel[] = [];
  for (let index = 1; index <= 100; index++) {
    const element = {
      id: index,
      code: "0001",
      name: "phieu 1",
    };
    fakeData.push(element);
  }

  let result = flatDataPaging(
    fakeData,
    !pagingParam ? { currentPage: 1, perPage: 30 } : pagingParam,
  );

  return result;
};

export const getBase64 = (file: any) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let encoded = reader.result ? reader.result?.toString().replace(/^data:(.*,)?/, "") : "";
      if (encoded && encoded.length % 4 > 0) {
        encoded += "=".repeat(4 - (encoded.length % 4));
      }

      resolve(encoded as string);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const filterNumberDiff = (
  title: string,
  key: string,
  minKey: string,
  maxKey: string,
  initialExt: any,
) => {
  let textRemaining =
    (initialExt[minKey] ? formatCurrency(initialExt[minKey]) : "??") +
    " ~ " +
    (initialExt[maxKey] ? formatCurrency(initialExt[maxKey]) : "??");

  let result: any = {
    key: key,
    name: title,
    value: textRemaining,
  };
  return result;
};
export const getAnalyticConditions = (where: { [key: string]: any[] }) => {
  const whereParams: AnalyticConditions =
    where &&
    Object.keys(JSON.parse(JSON.stringify(where))).map((key) => {
      const value: Array<string> = where[key];
      const operator = _.isEqual(value, [""]) ? "!=" : "IN";
      let values: string | Array<string> = "";
      if (operator === "IN") {
        values = value
          .map((item) => encodeURIComponent(item))
          .join(",")
          .split(",")
          .map((item: string) => decodeURIComponent(`'${item}'`))
          .join(",");
      } else {
        values = value;
      }

      return [key, operator, ...values];
    });

  return whereParams;
};

export const getParamReport = (currentDate: string, currentStoreId: number) => {
  const conditions = getAnalyticConditions({ pos_location_id: [currentStoreId] });
  console.log("conditions", conditions);
  const params: AnalyticQuery = {
    columns: [
      {
        field: columnsReport.cashPayments,
      },
      {
        field: columnsReport.vnpayPayments,
      },
      {
        field: columnsReport.momoPayments,
      },
      {
        field: columnsReport.transferPayments,
      },
      {
        field: columnsReport.cardPayments,
      },
      {
        field: columnsReport.unknownPayments,
      },
      // {
      //   field: columnsReport.vcbPayments,
      // },
      {
        field: columnsReport.total_sales,
      },
    ],
    rows: ["pos_location_name", "pos_location_name", "pos_location_name"],
    cube: "offline_sales",
    from: currentDate,
    to: currentDate,
    conditions: conditions,
    order_by: [["total_sales", "DESC"]],
  };

  const query = generateRQuery(params);

  return {
    q: query,
    options: 'time:"completed_at"',
  };
};

export const getDataReport = (v: AnalyticResult) => {
  let result: ShopRevenueModel = {
    cash_payments: 0,
    vnpay_payments: 0,
    momo_payments: 0,
    transfer_payments: 0,
    card_payments: 0,
    unknown_payments: 0,
    vcb_payments: 0,
    total_revenue: 0,
  };

  const cashPaymentsIndex = v.columns.findIndex((p) => p.field === columnsReport.cashPayments);

  const vnpayPaymentsIndex = v.columns.findIndex((p) => p.field === columnsReport.vnpayPayments);

  const momoPaymentsIndex = v.columns.findIndex((p) => p.field === columnsReport.momoPayments);

  const transferPaymentsIndex = v.columns.findIndex(
    (p) => p.field === columnsReport.transferPayments,
  );

  const cardPaymentsIndex = v.columns.findIndex((p) => p.field === columnsReport.cardPayments);

  const unknownPaymentsIndex = v.columns.findIndex(
    (p) => p.field === columnsReport.unknownPayments,
  );

  const vcbPaymentsIndex = v.columns.findIndex((p) => p.field === columnsReport.vcbPayments);
  const totalRevenueIndex = v.columns.findIndex((p) => p.field === columnsReport.total_sales);

  if (v.data && v.data.length !== 0) {
    result = {
      cash_payments: v.data[0][cashPaymentsIndex] || 0,
      vnpay_payments: v.data[0][vnpayPaymentsIndex] || 0,
      momo_payments: v.data[0][momoPaymentsIndex] || 0,
      transfer_payments: v.data[0][transferPaymentsIndex] || 0,
      card_payments: v.data[0][cardPaymentsIndex] || 0,
      unknown_payments: v.data[0][unknownPaymentsIndex] || 0,
      vcb_payments: v.data[0][vcbPaymentsIndex] || 0,
      total_revenue: v.data[0][totalRevenueIndex] || 0,
    };
  }

  return result;
};

export const getTotalShopRevenueAmount = (value: ShopRevenueModel) => {
  return Object.values(value)
    .map((item) => item)
    .reduce((prev, next) => prev + next);
};
