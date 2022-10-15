import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import CreateCustomer from "./CreateCustomer";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: any) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }),
});
const initialState = {};
const mockStore = configureStore();
const store = mockStore(initialState);

const setup = () => {
  render(
    <Provider store={store}>
      <CreateCustomer
        areas={[]}
        setCustomerChange={jest.fn}
        CustomerDeleteInfo={jest.fn}
        ShippingAddressChange={jest.fn}
        customerChange={true}
        groups={[]}
        handleChangeCustomer={jest.fn}
        keySearchCustomer={""}
      />
    </Provider>,
  );
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("createCustomer.test", () => {
  it(`check số điện thoại`, async () => {
    setup();

    const inputElementCustomerAddPhone = document.querySelector("#customer_add_phone");
    if (inputElementCustomerAddPhone) {
      fireEvent.change(inputElementCustomerAddPhone, { target: { value: "" } });
    }

    await sleep(1000);

    const inputGroup = document.querySelectorAll(
      "#customer_add > div:nth-child(2) > div:nth-child(4) > div > div",
    );

    let a = inputGroup.length;

    await waitFor(() => {
      return expect(inputGroup.length).toBe(1);
    });
  });
});
