import React, { useEffect, useCallback, useState } from "react";
import YDPageOrders from "./yd-page-order-create/YDPageOrders";
import YDPageCustomer from "screens/yd-page/yd-page-customer/YDPageCustomer";
import { Tabs } from "antd";
import { CustomerResponse } from "model/response/customer/customer.response";
import { YDPageCustomerResponse, customerNoteInfo } from "model/response/ecommerce/fpage.response";
import { useQuery } from "utils/useQuery";
import { useDispatch } from "react-redux";
import { FpageCustomerSearchQuery } from "model/query/customer.query";
import {
  getCustomerDetailAction,
  CustomerSearchByPhone,
  CustomerGroups,
} from "domain/actions/customer/customer.action";
import {
  getYDPageCustomerInfo,
  addFpagePhone,
  deleteFpagePhone,
  setFpageDefaultPhone,
} from "domain/actions/ecommerce/ecommerce.actions";

import { showError, showSuccess } from "utils/ToastUtils";
import { YDpageCustomerRequest } from "model/request/customer.request";

import { BillingAddressRequestModel, ShippingAddress } from "model/request/order.request";
import { DistrictGetByCountryAction } from "domain/actions/content/content.action";
import { VietNamId } from "utils/Constants";
import {
  addUnichatCustomerPhone,
  deleteUnichatCustomerPhone,
  getUnichatCustomerInfo,
  setUnichatDefaultPhone,
  SOCIAL_CHANNEL,
} from "screens/yd-page/helper";
import "screens/yd-page/index.scss";

const { TabPane } = Tabs;

const initQueryCustomer: FpageCustomerSearchQuery = {
  request: "",
  limit: 10,
  page: 1,
  phone: null,
};

const initCustomerInfo: YDpageCustomerRequest = {
  full_name: null,
  phone: null,
  birthday: "",
  email: null,
  gender: null,
  city_id: null,
  district_id: null,
  ward_id: null,
  full_address: null,
  card_number: null,
  customer_group_id: null,
};

export interface ICustomerNoteTags {
  _id?: string;
  created_at: Date;
  created_by: string;
  content: string;
  updated_at?: Date;
  updated_by?: string;
}

function YDPageAdmin() {
  let queryString = useQuery();
  const dispatch = useDispatch();
  const [activeTabKey, setActiveTabKey] = React.useState<string>("1");
  const [customer, setCustomer] = React.useState<CustomerResponse | null>(null);
  const [newCustomerInfo, setNewCustomerInfo] = useState<YDpageCustomerRequest>(initCustomerInfo);
  const [isClearOrderTab, setIsClearOrderTab] = useState<boolean>(false);
  const [socialChannel] = React.useState<string | null | undefined>(
    queryString?.get("socialChannel"),
  );
  const [fbCustomerId] = React.useState<string | null>(queryString?.get("fbCustomerId"));
  const [customerFbName] = React.useState<string | null>(queryString?.get("fbName"));
  const [defaultSourceId] = React.useState<number | null>(
    queryString?.get("defaultSourceId") ? Number(queryString?.get("defaultSourceId")) : null,
  );
  const [defaultStoreId] = React.useState<number | null>(
    queryString?.get("defaultStoreId") ? Number(queryString?.get("defaultStoreId")) : null,
  );
  const [fbAdsId] = React.useState<string>(queryString?.get("fbAdsId")?.toString() || "");
  const [campaignId] = React.useState<string>(queryString?.get("campaignId")?.toString() || "");

  const [YDPageCustomerInfo, setYDPageCustomerInfo] = useState<YDPageCustomerResponse | null>();
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [billingAddress, setBillingAddress] = useState<BillingAddressRequestModel | null>(null);
  const [customerPhone, setCustomerPhone] = useState<string | null>("");
  const [customerDefaultPhone, setCustomerDefaultPhone] = useState<string>("");
  const [customerPhones, setCustomerPhones] = useState<Array<string>>([]);
  const [isVisibleCustomer, setVisibleCustomer] = useState(false);

  const [customerNoteTags, setCustomerNoteTags] = useState<ICustomerNoteTags[]>([]);

  const [fbPageId] = React.useState<string | null>(queryString?.get("fbPageId"));
  const [userId] = React.useState<string | null>(queryString?.get("userId"));

  const [isEditCustomer, setIsEditCustomer] = React.useState<boolean>(false);

  // get customer group
  const [customerGroups, setCustomerGroups] = React.useState<Array<any>>([]);

  useEffect(() => {
    dispatch(CustomerGroups(setCustomerGroups));
  }, [dispatch]);
  // end get customer group

  // get area list
  const [areaList, setAreaList] = React.useState<Array<any>>([]);

  useEffect(() => {
    dispatch(DistrictGetByCountryAction(VietNamId, setAreaList));
  }, [dispatch]);

  useEffect(() => {
    const handleEvent = (event: any) => {
      const { data } = event;
      const { cmd } = data;
      switch (cmd) {
        case "phone_updated":
          if (fbCustomerId) {
            if (socialChannel === SOCIAL_CHANNEL.UNICHAT) {
              getUnichatCustomerInfo(fbCustomerId, setYDPageCustomerInfo);
            } else {
              dispatch(getYDPageCustomerInfo(fbCustomerId, setYDPageCustomerInfo));
            }
          }
          break;
        default:
          break;
      }
    };
    window.addEventListener("message", handleEvent, false);
    return () => {
      window.removeEventListener("message", handleEvent, false);
    };
  }, [dispatch, fbCustomerId, socialChannel]);

  useEffect(() => {
    if (fbCustomerId) {
      if (socialChannel === SOCIAL_CHANNEL.UNICHAT) {
        getUnichatCustomerInfo(fbCustomerId, setYDPageCustomerInfo);
      } else {
        dispatch(getYDPageCustomerInfo(fbCustomerId, setYDPageCustomerInfo));
      }
    }
  }, [fbCustomerId, dispatch, setYDPageCustomerInfo, socialChannel]);

  const searchByPhoneCallback = useCallback((value: any) => {
    setIsEditCustomer(false);
    if (value) {
      setCustomer(value);
      setVisibleCustomer(true);
    } else {
      setCustomer(null);
    }
  }, []);

  const getCustomerWhenPhoneChange = useCallback(
    (phoneNumber: string) => {
      setCustomerPhone(phoneNumber);
      if (phoneNumber) {
        initQueryCustomer.phone = phoneNumber;
        setVisibleCustomer(false);
        dispatch(CustomerSearchByPhone(initQueryCustomer, searchByPhoneCallback));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customerPhone, dispatch, searchByPhoneCallback],
  );

  useEffect(() => {
    if (YDPageCustomerInfo) {
      const { default_phone, phones, notes } = YDPageCustomerInfo;
      if (default_phone) {
        setCustomerPhone(default_phone);
        setCustomerDefaultPhone(default_phone);
      } else if (phones && phones.length > 0) {
        getCustomerWhenPhoneChange(phones[0]);
      }
      setCustomerPhones(phones);

      if (notes && Array.isArray(notes)) {
        const noteListSort = notes.sort((preNote: customerNoteInfo, nextNote: customerNoteInfo) => {
          const preNoteDate = new Date(preNote.created_at).getTime();
          const nextNoteDate = new Date(nextNote.created_at).getTime();

          return nextNoteDate - preNoteDate;
        });

        setCustomerNoteTags(noteListSort);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [YDPageCustomerInfo]);

  useEffect(() => {
    if (customerDefaultPhone) {
      initQueryCustomer.phone = customerDefaultPhone;
      dispatch(CustomerSearchByPhone(initQueryCustomer, searchByPhoneCallback));
    }
  }, [customerDefaultPhone, dispatch, searchByPhoneCallback]);

  const addFpPhone = useCallback(
    (phone: string, callback: () => void) => {
      if (fbCustomerId) {
        if (socialChannel === SOCIAL_CHANNEL.UNICHAT) {
          addUnichatCustomerPhone(fbCustomerId, phone, () => {
            getUnichatCustomerInfo(fbCustomerId, setYDPageCustomerInfo);
            callback();
          });
        } else {
          dispatch(
            addFpagePhone(fbCustomerId, phone, (customerInfo: YDPageCustomerResponse) => {
              setYDPageCustomerInfo(customerInfo);
              callback();
            }),
          );
        }
      }
    },
    [fbCustomerId, socialChannel, dispatch],
  );

  const deleteFpPhone = useCallback(
    (phone: string) => {
      if (phone === customerDefaultPhone) {
        showError("Không được xóa số điện thoại mặc định");
      } else {
        if (fbCustomerId) {
          if (socialChannel === SOCIAL_CHANNEL.UNICHAT) {
            deleteUnichatCustomerPhone(fbCustomerId, phone, setYDPageCustomerInfo);
          } else {
            dispatch(deleteFpagePhone(fbCustomerId, phone, setYDPageCustomerInfo));
          }
        }
      }
    },
    [customerDefaultPhone, fbCustomerId, socialChannel, dispatch],
  );

  const setFpDefaultPhone = useCallback(
    (phone: string) => {
      if (phone === customerDefaultPhone) return;

      if (fbCustomerId) {
        setCustomerPhone(phone);
        setCustomerDefaultPhone(phone);
        if (socialChannel === SOCIAL_CHANNEL.UNICHAT) {
          setUnichatDefaultPhone(fbCustomerId, phone, () => {
            getUnichatCustomerInfo(fbCustomerId, setYDPageCustomerInfo);
            showSuccess("Cập nhật số điện thoại mặc định thành công");
          });
        } else {
          dispatch(setFpageDefaultPhone(fbCustomerId, phone, setYDPageCustomerInfo));
        }
      }
    },
    [customerDefaultPhone, fbCustomerId, socialChannel, dispatch],
  );

  useEffect(() => {
    if (customer) {
      setVisibleCustomer(true);
      if (customer.shipping_addresses?.length > 0) {
        const shippingAddressesDefault =
          customer.shipping_addresses.find((item: any) => item.default) || null;
        setShippingAddress(shippingAddressesDefault);
      } else {
        setShippingAddress(null);
      }

      if (customer.billing_addresses?.length > 0) {
        const billingAddressDefault =
          customer.billing_addresses.find((item: any) => item.default) || null;
        setBillingAddress(billingAddressDefault);
      } else {
        setBillingAddress(null);
      }
    } else {
      setShippingAddress(null);
      setBillingAddress(null);
    }
  }, [dispatch, customer]);

  //Render result search
  const handleOnchangeTabs = React.useCallback((value: string) => {
    setActiveTabKey(value);
    setIsClearOrderTab(false);
  }, []);

  const handleCustomerById = React.useCallback(
    (id: number | null) => {
      dispatch(getCustomerDetailAction(id, searchByPhoneCallback));
    },
    [dispatch, searchByPhoneCallback],
  );

  return (
    <div className="yd-page-admin">
      <Tabs
        className="yd-page-admin-tabs"
        destroyInactiveTabPane={isClearOrderTab}
        centered
        animated
        activeKey={activeTabKey}
        onChange={(value: string) => handleOnchangeTabs(value)}
      >
        <TabPane key="1" tab={<div>KHÁCH HÀNG</div>}>
          <YDPageCustomer
            fbCustomerId={fbCustomerId}
            customerGroups={customerGroups}
            areaList={areaList}
            customer={customer}
            isEditCustomer={isEditCustomer}
            setIsEditCustomer={setIsEditCustomer}
            newCustomerInfo={newCustomerInfo}
            setNewCustomerInfo={setNewCustomerInfo}
            getCustomerWhenPhoneChange={getCustomerWhenPhoneChange}
            customerPhone={customerPhone}
            customerDefaultPhone={customerDefaultPhone}
            customerPhones={customerPhones}
            customerFbName={customerFbName}
            addFpPhone={addFpPhone}
            deleteFpPhone={deleteFpPhone}
            setFpDefaultPhone={setFpDefaultPhone}
            setCustomerDefaultPhone={setCustomerDefaultPhone}
            socialChannel={socialChannel}
            userId={userId}
            customerNoteTags={customerNoteTags}
            setCustomerNoteTags={setCustomerNoteTags}
          />
        </TabPane>
        <TabPane key="2" tab={<div>TẠO ĐƠN</div>}>
          <YDPageOrders
            fbCustomerId={fbCustomerId}
            fbPageId={fbPageId}
            defaultSourceId={defaultSourceId}
            defaultStoreId={defaultStoreId}
            fbAdsId={fbAdsId}
            campaignId={campaignId}
            customerGroups={customerGroups}
            areaList={areaList}
            customer={customer}
            newCustomerInfo={newCustomerInfo}
            userId={userId}
            setCustomer={setCustomer}
            setActiveTabKey={setActiveTabKey}
            setIsClearOrderTab={setIsClearOrderTab}
            setCustomerPhone={setCustomerPhone}
            // getCustomerByPhone={getCustomerWhenPhoneChange}
            handleCustomerById={handleCustomerById}
            setShippingAddress={setShippingAddress}
            setBillingAddress={setBillingAddress}
            shippingAddress={shippingAddress}
            billingAddress={billingAddress}
            setVisibleCustomer={setVisibleCustomer}
            isVisibleCustomer={isVisibleCustomer}
          />
        </TabPane>
      </Tabs>
    </div>
  );
}

export default YDPageAdmin;
