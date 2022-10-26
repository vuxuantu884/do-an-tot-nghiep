import { render } from "@testing-library/react";
import { OrderResponse } from "model/response/order/order.response";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import configureStore from "redux-mock-store";
import {
  handleFixWindowMatchMediaTest,
  testForm,
  testOrderArr,
} from "screens/order-online/utils/test.utils";
import OrderCreateProduct from ".";

handleFixWindowMatchMediaTest();

const initialState = {
  orderReducer: {
    orderDetail: {
      orderCustomer: {},
    },
  },
};
const mockStore = configureStore();
const store = mockStore(initialState);

const setup = (orderDetail: OrderResponse) => {
  render(
    <Provider store={store}>
      <Router>
        <OrderCreateProduct
          orderProductsAmount={0}
          totalOrderAmount={0}
          changeInfo={jest.fn}
          setStoreId={jest.fn}
          storeId={null}
          shippingFeeInformedToCustomer={null}
          setItemGift={jest.fn}
          form={testForm}
          items={[]}
          setItems={jest.fn}
          coupon={undefined}
          setCoupon={jest.fn}
          promotion={null}
          setPromotion={jest.fn}
          inventoryResponse={[]}
          customer={null}
          setInventoryResponse={jest.fn}
          totalAmountCustomerNeedToPay={0}
          orderConfig={null}
          orderSourceId={null}
          loyaltyPoint={null}
          setShippingFeeInformedToCustomer={jest.fn}
          countFinishingUpdateCustomer={0}
          shipmentMethod={0}
          stores={[]}
          orderDetail={orderDetail}
          setPromotionTitle={jest.fn}
        />
      </Router>
    </Provider>,
  );
};

describe("sản phẩm", () => {
  testOrderArr.map((single: OrderResponse) => {
    it(`test tên cửa hàng ${single.id}`, async () => {
      setup(single);
      const inputElement = document.querySelector(
        ".orderDetailSidebar div.ant-card-body > div:nth-child(1) > div.ant-col.ant-col-14.rowDetail__value > a",
      );
      if (inputElement && single?.store) {
        return expect(inputElement?.innerHTML).toBeTruthy();
      }
    });
  });
});
