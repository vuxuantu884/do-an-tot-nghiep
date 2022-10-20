import { render, waitFor } from "@testing-library/react";
import { FormInstance } from "antd";
import { OrderResponse } from "model/response/order/order.response";
import { Provider } from "react-redux";
import { Route } from "react-router";
import { BrowserRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import { handleFixWindowMatchMediaTest } from "screens/order-online/utils/test.utils";
import OrderDetail from ".";
import React from "react";

handleFixWindowMatchMediaTest();

const setup = (orderDetail: OrderResponse | null) => {
  const testForm: FormInstance<any> = {
    scrollToField: jest.fn(),
    getFieldValue: jest.fn(),
    getFieldsValue: jest.fn(),
    getFieldError: jest.fn(),
    getFieldsError: jest.fn(),
    getFieldInstance: jest.fn((opts) => (c: any) => c),
    isFieldTouched: jest.fn(),
    isFieldsTouched: jest.fn(() => true),
    isFieldsValidating: jest.fn((opts) => true),
    resetFields: jest.fn(),
    setFieldsValue: jest.fn(),
    isFieldValidating: jest.fn(),
    setFields: jest.fn(),
    validateFields: jest.fn(),
    submit: jest.fn(),
    __INTERNAL__: {
      itemRef: jest.fn(),
    },
  };
  render(
    <Provider store={store}>
      {/* <CardShowOrderPayments
        OrderDetail={orderDetail}
        setExtraPayments={mockFunction}
        disabledActions={mockFunction}
        disabledBottomActions={true}
        isDisablePostPayment={false}
        isShowPaymentPartialPayment={false}
        isVisibleUpdatePayment={false}
        onPaymentSelect={mockFunction}
        orderPageType={OrderPageTypeModel.orderDetail}
        paymentMethod={0}
        paymentMethods={[]}
        payments={[]}
        setOrderDetail={mockFunction}
        setReload={mockFunction}
        setShowPaymentPartialPayment={mockFunction}
        setVisibleUpdatePayment={mockFunction}
        shipmentMethod={0}
        stepsStatusValue={""}
        totalAmountCustomerNeedToPay={0}
        createPaymentCallback={mockFunction}
        form={testForm}
      /> */}
    </Provider>,
  );
};

// jest.spyOn(ReactRouter, "useParams").mockReturnValue({ id: "21903707" });

const initialState = {
  permissionReducer: {
    permissions: {},
  },
  userReducer: {
    account: {
      account_stores: {},
    },
  },
  bootstrapReducer: {
    data: {
      shipping_requirement: {},
    },
  },
  orderReducer: {
    isLoadingDiscount: {},
  },
};
export const mockStore = configureStore();
export const store = mockStore(initialState);

describe("test chi tiết đơn hàng thanh toán", () => {
  it(`test chưa thanh toán`, async () => {
    React.useState = jest.fn(() => [false, jest.fn()]);
    // render(<OrderDetail id="21903707" />);
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Route>
            <OrderDetail id="21903707" setTitle={jest.fn} />
          </Route>
        </BrowserRouter>
      </Provider>,
    );
    // expect(wrapper.find(OrderDetail).prop("size")).toBe("small");
    await waitFor(() => {
      const createPaymentButtonElement = document.querySelector(".page-header-heading-left");
      console.log("createPaymentButtonElement", createPaymentButtonElement);
      expect(createPaymentButtonElement?.innerHTML).toBeTruthy();
    });
  });
});
