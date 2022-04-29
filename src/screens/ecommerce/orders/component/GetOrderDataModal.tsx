import React, { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Form, Modal, Select, Tooltip } from "antd";
import moment from "moment";


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
import CustomDatePicker from "../../../../component/custom/new-date-picker.custom";
import { SwapRightOutlined } from "@ant-design/icons";
import { changeFormatDay } from "utils/DateUtils";


type GetOrderDataModalType = {
  visible: boolean;
  onOk: (data: any) => void;
  onCancel: () => void;
};

const { Option } = Select;


const GetOrderDataModal: React.FC<GetOrderDataModalType> = (
  props: GetOrderDataModalType
) => {
  const { visible, onOk, onCancel } = props;
  const dispatch = useDispatch();

  const [formDownloadOrder] = Form.useForm();

  const [isEcommerceSelected, setIsEcommerceSelected] = useState(false);
  const [ecommerceSelected, setEcommerceSelected] = useState(null);
  const [ecommerceShopList, setEcommerceShopList] = useState<Array<any>>([]);
  const [shopIdSelected, setShopIdSelected] = useState(null);
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

  const onClearShop = () => {
    setShopIdSelected(null);
  }

  //handle select date

  //handle date
  const [startDate, setStartDate] = useState<any>(null);
  const [endDate, setEndDate] = useState<any>(null);
  const [checkDateStartAndDayEnd, setCheckDateStartAndDayEnd] = useState(false);


  const convertStartDateToTimestamp = (date: any) => {
    if (!date) return
    const myDate = date && date.split("-");
    let newDate = myDate[1] + "." + myDate[0] + "." + myDate[2] + " 00:00:00";
    return moment(new Date(newDate)).unix();
  }

  const convertEndDateToTimestamp = (date: any) => {
    if (!date) return
    const myDate = date && date.split("-");
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

  const onChangeDate = useCallback(
      () => {
        let value: any = {};
        value = formDownloadOrder?.getFieldsValue(["date_from", "date_to"])

        const convertDateStartToString = value["date_from"] && value["date_from"].toString()
        const convertDateEndToString = value["date_to"] && value["date_to"].toString()

        const dateStartDayChangeFormat = changeFormatDay(convertDateStartToString)
        const dateEndDayChangeFormat = changeFormatDay(convertDateEndToString)
        
        const date_from = new Date(dateStartDayChangeFormat);
        const date_to = new Date(dateEndDayChangeFormat)
        
        const convertDateStartTimeStamp = convertStartDateToTimestamp(convertDateStartToString)
        const convertDateEndTimeStamp = convertEndDateToTimestamp(convertDateEndToString)


        setStartDate(convertDateStartTimeStamp)
        setEndDate(convertDateEndTimeStamp)

        const compareDate = date_from.getTime() - date_to.getTime()
        const differentDays = compareDate / (1000 * 60 * 60 * 24)

        if (value["date_from"] && value["date_to"]) {
          setCheckDateStartAndDayEnd(true)
        }else {
          setCheckDateStartAndDayEnd(false)
        }


        const getDateFrom = date_from.getTime()
        const getDateTo = date_to.getTime()

        if (getDateFrom > getDateTo) {
          formDownloadOrder?.setFields([
            {
              name: "date_from",
              errors: ['Ngày từ phải nhỏ hơn ngày đến'],
            },
            {
              name: "date_to",
              errors: [''],
            },
          ])
          setCheckDateStartAndDayEnd(false)
        }else if(Math.abs(differentDays) > 15) {
            formDownloadOrder?.setFields([
              {
                name: "date_from",
                errors: [''],
              },
              {
                name: "date_to",
                errors: ['Thời gian tải dữ liệu không vượt quá 15 ngày'],
              },
            ])
            setCheckDateStartAndDayEnd(false)
  
        } else {
          formDownloadOrder?.setFields([
            {
              name: "date_from",
              errors: undefined,
            },
            {
              name: "date_to",
              errors: undefined,
            },
          ])
        }
      }, [formDownloadOrder]);

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
    return !shopIdSelected || !checkDateStartAndDayEnd;
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
        <Form
            form={formDownloadOrder}
            layout="vertical"
        >
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
                showSearch
                onClear={onClearShop}
                notFoundContent="Không có dữ liệu gian hàng"
                filterOption={(input, option) => {
                  if (option) {
                    const shopName = option.children && option.children[1];
                    return (
                      shopName?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    );
                  }
                  return false;
                }}
              >
                {ecommerceShopList &&
                  ecommerceShopList.map((shop: any) => (
                    <Option key={shop.id} value={shop.id}>
                      <img
                        src={getEcommerceIcon(shop.ecommerce_id)}
                        alt={"ecommerce_icon"}
                        style={{ marginRight: "5px", height: "16px" }}
                      />
                      {shop.name}
                    </Option>
                  ))
                }
              </Select>
            }
          </Form.Item>

          {/*<Form.Item label={<b>Thời gian <span style={{ color: 'red' }}>*</span></b>}>*/}
          {/*  <RangePicker*/}
          {/*    disabled={isLoading}*/}
          {/*    placeholder={["Từ ngày", "Đến ngày"]}*/}
          {/*    style={{ width: "100%" }}*/}
          {/*    format={DATE_FORMAT.DDMMYYY}*/}
          {/*    value={selectedDateValue}*/}
          {/*    disabledDate={disabledDate}*/}
          {/*    onChange={onChangeDate}*/}
          {/*    onCalendarChange={onCalendarChange}*/}
          {/*    onOpenChange={onOpenChange}*/}
          {/*  />*/}
          {/*</Form.Item>*/}

          <div className="date-pick-download-order">
            <Form.Item name="date_from">
              <CustomDatePicker
                  format="DD-MM-YYYY"
                  placeholder="Từ ngày"
                  style={{ width: "100%", borderRadius: 0 }}
                  onChange={() => onChangeDate()}
              />
            </Form.Item>

            <div className="date-pick-download-order-icon">
              <SwapRightOutlined />
            </div>

            <Form.Item name="date_to">
              <CustomDatePicker
                  format="DD-MM-YYYY"
                  placeholder="Đến ngày"
                  style={{ width: "100%", borderRadius: 0 }}
                  onChange={() => onChangeDate()}
              />
            </Form.Item>
          </div>

          <div><i>Lưu ý: Thời gian tải dữ liệu không vượt quá <b>15 ngày</b></i></div>
        </Form>
      </StyledDownloadOrderData>
    </Modal>
  );
};

export default GetOrderDataModal;
