import { render } from "@testing-library/react";
import { OrderResponse } from "model/response/order/order.response";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import {
  handleFixWindowMatchMediaTest,
  store,
  testOrderArr,
} from "screens/order-online/utils/test.utils";
import SidebarOrderDetailInformation from ".";

handleFixWindowMatchMediaTest();

const setup = (orderDetail: OrderResponse) => {
  render(
    <Provider store={store}>
      <Router>
        <SidebarOrderDetailInformation OrderDetail={orderDetail} />
      </Router>
    </Provider>,
  );
};

describe("chi tiết đơn hàng sidebar", () => {
  testOrderArr.map((single: OrderResponse) => {
    return it(`test tên cửa hàng ${single.id}`, async () => {
      setup(single);
      const inputElement = document.querySelector(
        ".orderDetailSidebar div.ant-card-body > div:nth-child(1) > div.ant-col.ant-col-14.rowDetail__value > a",
      );
      if (inputElement && single?.store) {
        return expect(inputElement?.innerHTML).toEqual(single?.store);
      }
    });
  });
  testOrderArr.map((single: OrderResponse) => {
    return it(`test số điện thoại ${single.id}`, async () => {
      setup(single);
      const inputElement = document.querySelector(
        ".orderDetailSidebar div.ant-card-body > div:nth-child(2) > div.ant-col.ant-col-14.rowDetail__value > a span",
      );
      if (inputElement && single?.store_phone_number) {
        return expect(inputElement?.innerHTML).toEqual(single?.store_phone_number);
      }
    });
  });
});
