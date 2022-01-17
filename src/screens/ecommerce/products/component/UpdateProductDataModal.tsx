import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";

import { Button, DatePicker, Modal, Select, Tooltip } from "antd";
import moment from "moment";
import { DATE_FORMAT } from "utils/DateUtils";

import { getShopEcommerceList } from "domain/actions/ecommerce/ecommerce.actions";

import tikiIcon from "assets/icon/e-tiki.svg";
import shopeeIcon from "assets/icon/e-shopee.svg";
import lazadaIcon from "assets/icon/e-lazada.svg";
import sendoIcon from "assets/icon/e-sendo.svg";
import successIcon from "assets/icon/success_2.svg";

import { StyledUpdateProductDataModal } from "screens/ecommerce/products/styles";


type UpdateProductDataModalProps = {
  isVisible: boolean;
  isLoading: boolean;
  cancelGetProductModal: () => void;
  getProductsFromEcommerce: (params: any) => void;
};

const { Option } = Select;
const { RangePicker } = DatePicker;

const UpdateProductDataModal: React.FC<UpdateProductDataModalProps> = (
  props: UpdateProductDataModalProps
) => {
  const dispatch = useDispatch();
  
  const {
    isVisible,
    isLoading,
    cancelGetProductModal,
    getProductsFromEcommerce,
  } = props;

  const [isEcommerceSelected, setIsEcommerceSelected] = useState(false);
  const [ecommerceShopList, setEcommerceShopList] = useState<Array<any>>([]);
  
  const [ecommerceSelected, setEcommerceSelected] = useState(null);
  const [shopIdSelected, setShopIdSelected] = useState(null);
  const [startDate, setStartDate] = useState<any>();
  const [endDate, setEndDate] = useState<any>();
  
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
  const [selectedDateValue, setSelectedDateValue] = useState<any>();

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
    const startDate = convertStartDateToTimestamp(dateStrings[0]);
    setStartDate(startDate);
    const endDate = convertEndDateToTimestamp(dateStrings[1]);
    setEndDate(endDate);

    setSelectedDateValue(dates);
  };
  //end handle select date

  const isDisableGetItemOkButton = () => {
    return !shopIdSelected || !startDate || !endDate;
  }

  const onOk = () => {
    const params = {
      ecommerce_id: ecommerceSelected,
      shop_id: shopIdSelected,
      update_time_from: startDate,
      update_time_to: endDate
    }
    getProductsFromEcommerce(params);
  }

  const onCancel = () => {
    cancelGetProductModal();
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
  };
  

  return (
    <Modal
      width="600px"
      className=""
      visible={isVisible}
      title="Cập nhật dữ liệu từ gian hàng"
      okText="Cập nhật dữ liệu sản phẩm"
      cancelText="Hủy"
      onCancel={onCancel}
      onOk={onOk}
      okButtonProps={{ disabled: isDisableGetItemOkButton() }}
      maskClosable={false}
      confirmLoading={isLoading}
    >
      <StyledUpdateProductDataModal>
        <div className="ecommerce-list-option">
          {ecommerceList?.map((item) => (
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

        <div className="select-shop">
          <div className="item-title">Lựa chọn gian hàng <span style={{ color: 'red' }}>*</span></div>
          {!isEcommerceSelected &&
            <div className="select-shop-body">
              <Tooltip title="Yêu cầu chọn sàn" color="#1890ff">
                <Select
                  showSearch
                  placeholder="Chọn gian hàng"
                  allowClear
                  disabled={true}
                />
              </Tooltip>
            </div>
          }

          {isEcommerceSelected &&
            <div className="select-shop-body">
              <Select
                showSearch
                placeholder="Chọn gian hàng"
                allowClear
                onSelect={(value) => selectShopEcommerce(value)}
                disabled={isLoading}
              >
                {ecommerceShopList &&
                  ecommerceShopList.map((shop: any) => (
                    <Option key={shop.id} value={shop.id}>
                      {shop.name}
                    </Option>
                  ))
                }
              </Select>
              </div>
          }
        </div>

        <div>
          <div className="item-title">Thời gian <span style={{ color: 'red' }}>*</span></div>
          <RangePicker
            disabled={isLoading}
            placeholder={["Từ ngày", "Đến ngày"]}
            style={{ width: "100%" }}
            format={DATE_FORMAT.DDMMYYY}
            value={selectedDateValue}
            onChange={onChangeDate}
          />
        </div>
      </StyledUpdateProductDataModal>
    </Modal>
  );
};

export default UpdateProductDataModal;
