import {render} from "@testing-library/react";
import {OrderResponse} from "model/response/order/order.response";
import {Provider} from "react-redux";
import {BrowserRouter as Router} from "react-router-dom";
import {
  handleFixWindowMatchMediaTest,
  store,
  testOrderArr,
} from "screens/order-online/utils/test.utils";
import SidebarOrderDetailExtraInformation from "./../SidebarOrderDetailExtraInformation";

handleFixWindowMatchMediaTest();

const setup = (orderDetail: OrderResponse) => {
  render(
    <Provider store={store}>
      <Router>
        <SidebarOrderDetailExtraInformation OrderDetail={orderDetail}/>
      </Router>
    </Provider>,
  );
};


describe("Thông tin bổ sung Sidebar", () => {

  testOrderArr.map((single: OrderResponse) => {
    return it('customer note value sidebar', () => {
      setup(single);
      const inputElement = document.querySelector(".orderDetailExtraSidebar  div.ant-card-body > div:nth-child(1) > div:nth-child(2) > span")
      if (single.customer_note) {
        expect(inputElement?.innerHTML).toEqual(single?.customer_note);
      } else {
        expect(inputElement?.innerHTML).toEqual('Không có ghi chú');
      }
    })
  });
  testOrderArr.map((single: OrderResponse) => {
    return it('note value sidebar', () => {
      setup(single);
      const inputElement = document.querySelector(".orderDetailExtraSidebar  div.ant-card-body > div:nth-child(1) > div:nth-child(2) > span")
      if (single?.note) {
        expect(inputElement?.innerHTML).toEqual(single?.note);
      } else {
        expect(inputElement?.innerHTML).toEqual('Không có ghi chú');

      }
    })
  });
  testOrderArr.map((single: OrderResponse) => {
    return it('tag sidebar', () => {
      setup(single);
      const inputElement = document.querySelector(".orderDetailExtraSidebar div.ant-card-body > div:nth-child(3) > div:nth-child(2) > span")
      if (!single?.note) {
        expect(inputElement?.innerHTML).toEqual('Không có nhãn');
      }
    })
  });

});
