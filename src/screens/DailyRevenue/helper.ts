import { PagingParam, ResultPaging } from "model/paging";
import { DailyRevenueTableModel } from "model/revenue";
import { flatDataPaging } from "utils/Paging";

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
