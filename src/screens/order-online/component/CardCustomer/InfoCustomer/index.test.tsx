import { render, waitFor } from "@testing-library/react";
import moment from "moment";
import { unmountComponentAtNode } from "react-dom";
import { BrowserRouter, Router } from "react-router-dom";
import { handleFixWindowMatchMediaTest } from "screens/order-online/utils/test.utils";
import InfoCustomer from ".";

handleFixWindowMatchMediaTest();

const customerDataTest: any = {
  id: 3014155,
  code: "CU003014155",
  version: 5,
  created_by: "",
  created_name: "admin",
  created_date: "2022-10-06T06:18:01Z",
  updated_by: "YD99999",
  updated_name: "Quản trị viên",
  updated_date: "2022-10-06T06:18:01Z",
  full_name: "Chiến hoàn ",
  phone: "0988309621",
  email: null,
  customer_group_id: 1,
  customer_group: "CÔNG NHÂN",
  customer_type_id: null,
  customer_type: null,
  company_id: null,
  company: null,
  website: null,
  description: null,
  customer_level_id: 22,
  customer_level: "SIÊU VIP",
  status: "active",
  wedding_date: null,
  birthday: "2022-05-20T17:00:00Z",
  gender: "male",
  responsible_staff_code: null,
  responsible_staff: null,
  tags: null,
  notes: [],
  tax_code: null,
  country_id: 233,
  country: null,
  city_id: 1,
  city: "TP. Hà Nội",
  district_id: 6,
  district: "Quận Đống Đa",
  ward_id: 72,
  ward: "Phường Cát Linh",
  zip_code: null,
  full_address: "hải dương",
  card_number: null,
  channel: null,
  channel_id: null,
  channel_code: null,
  source: null,
  source_id: null,
  source_code: null,
  billing_addresses: [
    {
      id: 15933,
      code: "maTgvz2ohqB3",
      version: 1,
      created_by: "",
      created_name: "admin",
      created_date: "2022-05-18T18:10:47Z",
      updated_by: "",
      updated_name: "admin",
      updated_date: "2022-05-18T18:10:47Z",
      name: "Chiến",
      email: null,
      phone: "840988309621",
      country_id: null,
      country: null,
      city_id: null,
      city: "Hà Nội",
      district_id: null,
      district: "Quận Đống Đa",
      ward_id: null,
      ward: "Hà Nội, Quận Đống Đa, Phường Phương Liên",
      zip_code: "",
      full_address:
        "42a ngõ 249 phố chợ khâm Thiên,Hà Nội, Quận Đống Đa, Phường Phương Liên,Quận Đống Đa,Hà Nội",
      tax_code: null,
      buyer: null,
      default: true,
    },
  ],
  shipping_addresses: [
    {
      id: 16465,
      code: "kL5XwJXgcukV",
      version: 9,
      created_by: "",
      created_name: "admin",
      created_date: "2022-05-18T18:10:47Z",
      updated_by: "",
      updated_name: "admin",
      updated_date: "2022-10-06T06:18:01Z",
      name: "Chiến",
      email: null,
      phone: "0988309621",
      country_id: null,
      country: null,
      city_id: 1,
      city: "TP. Hà Nội",
      district_id: 2,
      district: "Quận Tây Hồ",
      ward_id: 12,
      ward: "Phường Bưởi",
      zip_code: "",
      full_address: "42a ngõ 249 phố chợ khâm Thiên,Phường Phương Liên,Quận Đống Đa,Hà Nội",
      default: true,
    },
    {
      id: 51591,
      code: "eOeMyAxwrfLB",
      version: 7,
      created_by: "YD99999",
      created_name: "Quản trị viên",
      created_date: "2022-08-11T02:30:01Z",
      updated_by: "YD99999",
      updated_name: "Quản trị viên",
      updated_date: "2022-10-06T06:17:27Z",
      name: "Mẫu in bán lẻ",
      email: null,
      phone: "0392848261",
      country_id: 233,
      country: "VIETNAM",
      city_id: 1,
      city: "TP. Hà Nội",
      district_id: 1,
      district: "Quận Thanh Xuân",
      ward_id: 1,
      ward: "Phường Hạ Đình",
      zip_code: null,
      full_address: "abcv",
      default: false,
    },
  ],
  contacts: [],
  report: {
    total_finished_order: 4943,
    total_returned_order: 81,
    total_paid_amount: 3895619840,
    total_refunded_amount: 30215562,
    remain_amount_to_level_up: null,
    average_order_value: 788108.4,
    first_order_time: "2022-05-18T18:11:22Z",
    last_order_time: "2022-10-08T03:08:11Z",
    number_of_days_without_purchase: 7,
    first_order_time_online: {
      epoch_second: 1652897482,
      nano: 0,
    },
    last_order_time_online: {
      epoch_second: 1664963516,
      nano: 0,
    },
    first_order_time_offline: {
      epoch_second: 1652461199,
      nano: 0,
    },
    last_order_time_offline: {
      epoch_second: 1665198491,
      nano: 0,
    },
    store_id_of_first_order_offline: 349,
    store_id_of_last_order_offline: 394,
    store_of_first_order_offline: "cửa hàng lv 4 new",
    store_of_last_order_offline: "Cửa hàng của Mai",
    source_id_of_first_order_online: 129,
    source_id_of_last_order_online: 257,
    source_of_first_order_online: "Khác",
    source_of_last_order_online: "test chicken 14",
    source_ids: "1,110,111,129,187,221,222,223,225,226,228,229,230,231,232,147,237,257",
    channel_ids: "1,3,13,15",
    store_ids:
      "1,2,3,4,5,12,63,78,136,231,341,342,344,347,348,349,365,336,8,215,376,387,381,80,394",
    first_order_type: "online",
    last_order_type: "offline",
    first_order_place: null,
    last_order_place: null,
  },
  assigned_store_id: null,
  assigned_store: null,
  identity_number: null,
  utm: null,
  assigned_date: null,
  point: 1095955,
  region_code: "84",
  ecommerce_uid: null,
  customer_relationship: null,
  family_info: [],
};
const loyaltyPointDataTest: any = {
  id: 7380,
  customer_id: 3014155,
  loyalty_level_id: 22,
  loyalty_level: "SIÊU VIP",
  point: 1095955,
  total_order_count: 5037,
  total_money_spend: 3895619804,
  total_subtract_lock_point: null,
  level_change_time: "2022-09-07T17:00:00.000+00:00",
  money_maintain_current_level: 6246575.34,
  remain_amount_to_level_up: null,
  money_spend_in_year: 3890722002,
  created_date: "2022-05-18T18:11:23.000+00:00",
  created_by: "system",
  updated_date: "2022-10-08T03:08:12.000+00:00",
  updated_by: "system",
  card: null,
};
const loyaltyUsageRulesDataTest: any = [
  {
    id: 43,
    rank_id: 0,
    rank_name: "Default",
    limit_order_percent: 30,
    limit_line_percent: 30,
    block_order_have_discount: false,
  },
  {
    id: null,
    rank_id: 2,
    rank_name: "VIP G",
    limit_order_percent: null,
    limit_line_percent: null,
    block_order_have_discount: false,
  },
  {
    id: null,
    rank_id: 4,
    rank_name: "Vip R",
    limit_order_percent: null,
    limit_line_percent: null,
    block_order_have_discount: false,
  },
  {
    id: null,
    rank_id: 14,
    rank_name: "VIP S",
    limit_order_percent: null,
    limit_line_percent: null,
    block_order_have_discount: false,
  },
  {
    id: null,
    rank_id: 22,
    rank_name: "SIÊU VIP",
    limit_order_percent: null,
    limit_line_percent: null,
    block_order_have_discount: false,
  },
];

const setup = () => {
  render(
    <BrowserRouter>
      <InfoCustomer
        customer={customerDataTest}
        loyaltyPoint={loyaltyPointDataTest}
        loyaltyUsageRules={loyaltyUsageRulesDataTest}
        levelOrder={0}
        CustomerDeleteInfo={jest.fn}
      />
    </BrowserRouter>,
  );
};

let container: any = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);
  jest.useFakeTimers();
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
  jest.useRealTimers();
});

describe("Customer info", () => {
  it("customer name", async () => {
    setup();
    await waitFor(() => {
      const element = document.querySelector("#customer_info");
      expect(element).toBeTruthy();
    });
  });
  it("customer phone", async () => {
    setup();
    await waitFor(() => {
      const element = document.querySelector(
        "#customer_info > div.ant-space.ant-space-horizontal.ant-space-align-center.customer-detail-phone > div:nth-child(2) > a",
      );
      expect(element?.innerHTML.toString().trim()).toEqual(customerDataTest.phone);
    });
  });
  it("customer point", async () => {
    setup();
    await waitFor(() => {
      const element = document.querySelector(
        "#customer_info > div.ant-space.ant-space-horizontal.ant-space-align-center.customer-detail-point > div:nth-child(2) > span > span > strong",
      );
      expect(element?.innerHTML).toEqual(loyaltyPointDataTest.point.toString());
      console.log("point", loyaltyPointDataTest.point.toString());
    });
  });
  it("customer date", async () => {
    setup();
    await waitFor(() => {
      const element = document.querySelector(
        "#customer_info > div.ant-space.ant-space-horizontal.ant-space-align-center.customer-detail-birthday > div:nth-child(2) > span",
      );
      let customerBirthday = moment(customerDataTest.birthday).format("DD/MM/YYYY");
      if (customerDataTest.birthday) {
        expect(element?.innerHTML).toEqual(customerBirthday);
      }
    });
  });
});
