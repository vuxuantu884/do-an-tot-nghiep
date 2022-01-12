import React, { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { Button, DatePicker, Form, Modal, Select, Tooltip } from "antd";
import moment from "moment";

import { DATE_FORMAT } from 'utils/DateUtils';

import {
  getShopEcommerceList,
  postEcommerceOrderAction,
} from "domain/actions/ecommerce/ecommerce.actions";

import tikiIcon from "assets/icon/e-tiki.svg";
import shopeeIcon from "assets/icon/e-shopee.svg";
import lazadaIcon from "assets/icon/e-lazada.svg";
import sendoIcon from "assets/icon/e-sendo.svg";
import successIcon from "assets/icon/success_2.svg";

import { StyledDownloadOrderData } from "screens/ecommerce/orders/orderStyles";


type GetOrderDataModalType = {
  visible: boolean;
  onOk: (data: any) => void;
  onCancel: () => void;
};

const { Option } = Select;
const { RangePicker } = DatePicker;


const GetOrderDataModal: React.FC<GetOrderDataModalType> = (
  props: GetOrderDataModalType
) => {
  const { visible, onOk, onCancel } = props;
  const dispatch = useDispatch();

  const [isEcommerceSelected, setIsEcommerceSelected] = useState(false);
  const [ecommerceSelected, setEcommerceSelected] = useState(null);
  const [ecommerceShopList, setEcommerceShopList] = useState<Array<any>>([]);
  const [shopIdSelected, setShopIdSelected] = useState(null);
  const [startDate, setStartDate] = useState<any>(null);
  const [endDate, setEndDate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activatedBtn, setActivatedBtn] = useState({
    title: "",
    icon: "",
    id: 0,
    isActive: "",
    key: "",
  });

  const [ecommerceList] = useState<Array<any>>([
    {
      title: "Sàn Shopee",
      icon: shopeeIcon,
      id: 1,
      isActive: false,
      key: "shopee",
    },
    {
      title: "Sàn Lazada",
      icon: lazadaIcon,
      id: 2,
      isActive: false,
      key: "lazada",
    },
    {
      title: "Sàn Tiki",
      icon: tikiIcon,
      id: 3,
      isActive: false,
      key: "tiki"
    },
    {
      title: "Sàn Sendo",
      icon: sendoIcon,
      id: 4,
      isActive: false,
      key: "sendo",
    },
  ]);

  const getEcommerceIcon = (ecommerce_id: number) => {
    const ecommerce = ecommerceList.find(item => item.id === ecommerce_id);
    return ecommerce?.icon;
  }

  const updateEcommerceShopList = useCallback((result) => {
    setIsEcommerceSelected(true);
    setEcommerceShopList(result);
  }, []);

  const getShopEcommerce = (ecommerceId: any) => {
    setShopIdSelected(null);
    setIsEcommerceSelected(false);
    dispatch(getShopEcommerceList({ ecommerce_id: ecommerceId }, updateEcommerceShopList));
  }

  const selectEcommerce = (item: any) => {
    setActivatedBtn(item)
    setEcommerceSelected(item && item.id);
    getShopEcommerce(item && item.id);
  };

  const selectShopEcommerce = (shop_id: any) => {
    setShopIdSelected(shop_id);
  }

  //handle select date

  // check disable select date
  const [dates, setDates] = useState<any>([]);
  const [hackValue, setHackValue] = useState<any>();
  const [value, setValue] = useState<any>();

  const disabledDate = (current: any) => {
    if (!dates || dates.length === 0) {
      return false;
    }
    const tooLate = dates[0] && current.diff(dates[0], 'days') > 14;
    const tooEarly = dates[1] && dates[1].diff(current, 'days') > 14;
    return tooEarly || tooLate;
  };

  const onOpenChange = (open: any) => {
    if (open) {
      setHackValue([]);
      setDates([]);
    } else {
      setHackValue(undefined);
    }
  };


  const convertStartDateToTimestamp = (date: any) => {
    const myDate = date.split("/");
    let newDate = myDate[1] + "." + myDate[0] + "." + myDate[2] + " 00:00:00";
    return moment(new Date(newDate)).unix();
  }

  const convertEndDateToTimestamp = (date: any) => {
    const myDate = date.split("/");
    const today = new Date();
    let time = "23:59:59";

    if ((Number(myDate[0]) === Number(today.getDate())) &&
      (Number(myDate[1]) === Number(today.getMonth()) + 1) &&
      (Number(myDate[2]) === Number(today.getFullYear()))
    ) {
      time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    }

    const newDate = myDate[1] + "." + myDate[0] + "." + myDate[2];
    const dateTime = newDate + " " + time;
    return moment(new Date(dateTime)).unix();
  }

  const onChangeDate = (dates: any, dateStrings: any) => {
    const startDateValue = convertStartDateToTimestamp(dateStrings[0]);
    setStartDate(startDateValue);
    const endDateValue = convertEndDateToTimestamp(dateStrings[1]);
    setEndDate(endDateValue);

    setValue(dates);
  };

  //end handle select date


  const updateEcommerceOrderList = useCallback((data) => {
    setIsLoading(false);
    onOk(data);
  }, [onOk]);

  const handleDownloadEcommerceOrders = () => {
    const params = {
      ecommerce_id: ecommerceSelected,
      shop_id: shopIdSelected,
      update_time_from: startDate,
      update_time_to: endDate,
    }

    setIsLoading(true);
    dispatch(postEcommerceOrderAction(params, updateEcommerceOrderList));
  };

  const isDisableOkButton = () => {
    return !shopIdSelected || !startDate || !endDate;
  }

  const cancelGetOrderModal = () => {
    setActivatedBtn(
      {
        title: "",
        icon: "",
        id: 0,
        isActive: "",
        key: ""
      }
    );
    setEcommerceSelected(null);
    setIsEcommerceSelected(false);
    onCancel();
  };


  return (
    <Modal
      width="600px"
      visible={visible}
      title="Tải dữ liệu đơn hàng"
      okText="Tải dữ liệu"
      cancelText="Hủy"
      onCancel={cancelGetOrderModal}
      onOk={handleDownloadEcommerceOrders}
      okButtonProps={{ disabled: isDisableOkButton() }}
      cancelButtonProps={{ disabled: isLoading }}
      closable={!isLoading}
      maskClosable={false}
      confirmLoading={isLoading}
    >
      <StyledDownloadOrderData>
        <Form layout="vertical">
          <div className="ecommerce-list">
            {ecommerceList.map((item) => (
              <Button
                key={item.id}
                className={item.id === activatedBtn?.id ? "active-button" : ""}
                icon={item.icon && <img src={item.icon} alt={item.id} />}
                type="ghost"
                onClick={() => selectEcommerce(item)}
                disabled={isLoading}
              >
                {item.title}
                {item.id === activatedBtn?.id &&
                  <img src={successIcon} className="icon-active-button" alt="" />
                }
              </Button>
            ))}
          </div>

          <Form.Item
            label={<b>Lựa chọn gian hàng <span style={{ color: 'red' }}>*</span></b>}
          >
            {!isEcommerceSelected &&
              <Tooltip title="Yêu cầu chọn sàn" color="#1890ff">
                <Select
                  showSearch
                  placeholder="Chọn gian hàng"
                  allowClear
                  disabled={true}
                />
              </Tooltip>
            }

            {isEcommerceSelected &&
              <Select
                placeholder="Chọn gian hàng"
                allowClear
                onSelect={(value) => selectShopEcommerce(value)}
                disabled={isLoading}
              >
                {ecommerceShopList &&
                  ecommerceShopList.map((shop: any) => (
                    <Option key={shop.id} value={shop.id}>
                      <span>
                        <img
                          src={getEcommerceIcon(shop.ecommerce_id)}
                          alt={"ecommerce_icon"}
                          style={{ marginRight: "5px", height: "16px" }}
                        />
                        <span>{shop.name}</span>
                      </span>
                    </Option>
                  ))
                }
              </Select>
            }
          </Form.Item>

          <Form.Item label={<b>Thời gian <span style={{ color: 'red' }}>*</span></b>}>
            <RangePicker
              disabled={isLoading}
              placeholder={["Từ ngày", "Đến ngày"]}
              style={{ width: "100%" }}
              format={DATE_FORMAT.DDMMYYY}
              value={hackValue || value}
              disabledDate={disabledDate}
              onCalendarChange={val => setDates(val)}
              onChange={onChangeDate}
              onOpenChange={onOpenChange}
            />
          </Form.Item>

          <div><i>Lưu ý: Thời gian tải dữ liệu không vượt quá <b>15 ngày</b></i></div>
        </Form>
      </StyledDownloadOrderData>
    </Modal>
  );
};

export default GetOrderDataModal;
