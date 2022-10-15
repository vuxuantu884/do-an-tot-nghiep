import { render, waitFor } from "@testing-library/react";
import { FormInstance } from "antd";
import { OrderPageTypeModel } from "model/order/order.model";
import { OrderResponse } from "model/response/order/order.response";
import { Provider } from "react-redux";
import {
  handleFixWindowMatchMediaTest,
  mockFunction,
  store,
  testOrderArr,
} from "screens/order-online/utils/test.utils";
import CardShowOrderPayments from ".";

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
      <CardShowOrderPayments
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
      />
    </Provider>,
  );
};

describe("createCustomer.test", () => {
  testOrderArr.map((single: OrderResponse) => {
    return it(`test chi tiết đơn hàng ${single.id}`, async () => {
      setup(single);
      // setup();
      // expect.assertions(1);
      // expect(40 + 2).toEqual(43);
      // const mocSet = jest.fn();
      // mocSet.mockResolvedValue(districts);
      const inputElement = document.querySelector(
        " div.paymentDetailMain > div > div > div > div > div.orderPaymentItem__left > div > div",
      );
      if (inputElement) {
        // fireEvent.change(inputElement, { target: { value: single.text } });
      }
      // await new Promise((r) => setTimeout(r, 2000));
      // const resultElement1 = container.getElementsByClassName("inputDistrictCreateCustomer ")[0];
      // console.log("resultElement1", resultElement1);
      // const ggg = document.getElementById("customer_add_full_address");
      // console.log("ggg", ggg);
      // expect(40 + 2).toEqual(42);
      // const input = document.querySelector("inputDistrictCreateCustomer")
      // await waitFor(() => expect(getByText("huyện Xuân Lộc, tỉnh Đồng Nai")).toBeInTheDocument());
      // await waitFor(() => expect(screen.getByText(/huyện Xuân Lộc/i)).toBeVisible());
      // await waitFor(() =>
      //   expect(screen.getByText("Tỉnh Ninh Bình - Huyện Nho Quan").toBeInTheDocument()),
      // );
      // await new Promise((r) => setTimeout(r, 2000));
      return expect(inputElement?.innerHTML).toMatch("Tiền mặt");
      await waitFor(() => {
        const inputProvice = document.querySelector(
          "#customer_add > div:nth-child(2) > div:nth-child(2) > div > div > div > div > div > div > div > span.ant-select-selection-item",
        );
        // return expect(input.innerHTML).toMatch("Đồng Nai");
        // return expect(inputProvice?.innerHTML).toMatch(single.expectProvince);
        // return expect(inputProvice?.innerHTML.includes(single.expectProvince)).toBeTruthy();
      });
      // await new Promise((r) => setTimeout(r, 2000));
      // await waitFor(async () => {
      //   const bb = document.querySelector(
      //     "#customer_add > div:nth-child(2) > div:nth-child(5) > div > div > div > div > div > div > span.ant-select-selection-item",
      //   );
      //   // return expect(input.innerHTML).toMatch("Nho Quan");
      //   // return expect(input.innerHTML).toMatch("Đồng Nai");
      //   return expect(
      //     bb?.innerHTML.includes(single.expectProvince) &&
      //       bb?.innerHTML.includes(single.expectProvince),
      //   ).toBeTruthy();
      // });
      // await waitFor(() => {
      //   const inputWard = document.querySelector(
      //     "#customer_add > div:nth-child(2) > div:nth-child(2) > div > div > div > div > div > div > span.ant-select-selection-item",
      //   );
      //   return expect(inputWard?.innerHTML).toMatch(single.expectWard);
      // });
      // expect(screen.getByText("THÔNG TIN ")).toBeInTheDocument(); // WORKS !
      // const outputElement = screen.findByText("Tỉnh Đồng Nai - Huyện Xuân Lộc");
      // expect(outputElement).toBeInTheDocument();
      // expect(inputElement.value).toMatch("Đồng Nai");
      // expect(resultElement).toHaveTextContent("Đồng Nai");
    });
  });
});
