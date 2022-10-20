import {render} from "@testing-library/react";
import {OrderResponse} from "model/response/order/order.response";
import {Provider} from "react-redux";
import {BrowserRouter as Router} from "react-router-dom";
import {
  handleFixWindowMatchMediaTest,
  store,
  testOrderArr, testStoreArr,
} from "screens/order-online/utils/test.utils";
import SidebarOrderDetailInformation from "./../SidebarOrderDetailInformation";
import {screen} from "@testing-library/dom";
import {isOrderFromPOS} from "../../../../utils/AppUtils";

handleFixWindowMatchMediaTest();

const setup = (orderDetail: OrderResponse) => {
  render(
    <Provider store={store}>
      <Router>
        <SidebarOrderDetailInformation OrderDetail={orderDetail} currentStores={testStoreArr}/>
      </Router>
    </Provider>,
  );
};


describe("Chi tiết đơn hàng Sidebar", () => {

  testOrderArr.map((single: OrderResponse) => {
    return it('test tiêu đề "Thông tin đơn hàng"', () => {
      setup(single);
      const inputElement = document.querySelector(".orderDetailSidebar .ant-card-head > div > div")
      return expect(inputElement?.innerHTML).toEqual("THÔNG TIN ĐƠN HÀNG");
    })
  });


  testOrderArr.map((single: OrderResponse) => {
    return it('test tiêu đề "Cửa hàng"', () => {
      setup(single);
      const inputElement = screen.getByTestId('storeTitle')
      return expect(inputElement.textContent).toEqual("Cửa hàng:");
    })
  });
  testOrderArr.map((single: OrderResponse) => {
    return it(`test cửa hàng ${single.id}`, () => {
      setup(single);
      const inputElement = screen.getByTestId('storeVal')
      if (single?.store) {
        return expect(inputElement.textContent).toEqual(single?.store);
      } else {
        return expect(inputElement).toBeEmptyDOMElement()
      }
    })
  });

  testOrderArr.map((single: OrderResponse) => {
    return it('test tiêu đề "Điện thoại"', () => {
      setup(single);
      const inputElement = screen.getByTestId('phoneNumberTitle')
      return expect(inputElement.textContent).toEqual("Điện thoại:");
    })
  });
  testOrderArr.map((single: OrderResponse) => {
    return it(`test điện thoại`, () => {
      setup(single);
      const inputElement = screen.getByTestId('phoneNumberVal')
      if (single?.store_phone_number) {
        return expect(inputElement.textContent).toEqual(single?.store_phone_number);
      } else {
        return expect(inputElement).toBeEmptyDOMElement()
      }
    })
  });

  testOrderArr.map((single: OrderResponse) => {
    return it('test tiêu đề "Địa chỉ"', () => {
      setup(single);
      const inputElement = screen.getByTestId('addressTitle')
      return expect(inputElement.textContent).toEqual("Địa chỉ:");
    })
  });
  testOrderArr.map((single: OrderResponse) => {
    return it(`test địa chỉ`, () => {
      setup(single);
      const inputElement = screen.getByTestId('addressVal')

      if (single?.store_full_address) {
        return expect(inputElement.textContent).toEqual(single?.store_full_address);
      } else {
        return expect(inputElement.textContent).toEqual('-')
      }

    })
  });

  testOrderArr.map((single: OrderResponse) => {
    return it('test tiêu đề "NV bán hàng"', () => {
      setup(single);
      const inputElement = screen.getByTestId('salesConsultantTitle')
      return expect(inputElement.textContent).toEqual(isOrderFromPOS(single) ? "NV tư vấn:" : "NV bán hàng:");
    })
  });

  testOrderArr.map((single: OrderResponse) => {
    return it(`test NV bán hàng`, () => {
      setup(single);
      const inputElement = screen.getByTestId('salesConsultantVal')
      if (single?.assignee_code && single?.assignee) {
        return expect(inputElement.textContent).toEqual(`${single?.assignee_code} - ${single?.assignee}`);
      } else {
        return expect(inputElement.textContent).toEqual(' - ')
      }
    })
  });

  testOrderArr.map((single: OrderResponse) => {
    return it('test tiêu đề "NV marketing"', () => {
      setup(single);
      const inputElement = screen.getByTestId('marketingTitle')
      return expect(inputElement.textContent).toEqual("NV marketing:");
    })
  });
  testOrderArr.map((single: OrderResponse) => {
    return it(`test NV marketing`, () => {
      setup(single);
      const inputElement = screen.getByTestId('marketingVal')
      if (single?.marketer_code && single?.marketer) {
        return expect(inputElement.textContent).toEqual(`${single?.marketer_code} - ${single?.marketer}`);
      } else {
        return expect(inputElement.textContent).toEqual(` - `);
      }

    })
  });

  testOrderArr.map((single: OrderResponse) => {
    return it('test tiêu đề "NV điều phối"', () => {
      setup(single);
      const inputElement = screen.getByTestId('coordinatorTitle')
      return expect(inputElement.textContent).toEqual("NV điều phối:");
    })
  });
  testOrderArr.map((single: OrderResponse) => {
    return it(`test NV điều phối`, () => {
      setup(single);
      const inputElement = screen.getByTestId('coordinatorVal')
      if (single?.coordinator_code && single?.coordinator) {
        return expect(inputElement.textContent).toEqual(`${single?.coordinator_code} - ${single?.coordinator}`);
      } else return expect(inputElement.textContent).toEqual(` - `);

    })
  });

  testOrderArr.map((single: OrderResponse) => {
    return it('test tiêu đề "Người tạo"', () => {
      setup(single);
      const inputElement = screen.getByTestId('creatorTitle')
      return expect(inputElement.textContent).toEqual("Người tạo:");
    })
  });
  testOrderArr.map((single: OrderResponse) => {
    return it(`test Người tạo`, async () => {
      setup(single);
      const inputElement = screen.getByTestId('creatorVal')
      return expect(inputElement.textContent).toEqual(`${single?.created_by} - `);
    })
  });
});
