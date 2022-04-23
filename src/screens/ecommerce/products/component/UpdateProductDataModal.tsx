import React, {ChangeEvent, useCallback, useEffect, useState} from "react";
import {useDispatch} from "react-redux";

import {Button, DatePicker, Input, Modal, Radio, Select, Tooltip} from "antd";
import moment from "moment";
import {DATE_FORMAT} from "utils/DateUtils";

import {getShopEcommerceList} from "domain/actions/ecommerce/ecommerce.actions";
import {getIconByEcommerceId} from "screens/ecommerce/common/commonAction";

import tikiIcon from "assets/icon/e-tiki.svg";
import shopeeIcon from "assets/icon/e-shopee.svg";
import lazadaIcon from "assets/icon/e-lazada.svg";
import sendoIcon from "assets/icon/e-sendo.svg";
import successIcon from "assets/icon/success_2.svg";

import {StyledUpdateProductDataModal} from "screens/ecommerce/products/styles";
import {RadioChangeEvent} from "antd/lib/radio/interface";


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

  const [downloadType, setDownloadType] = useState<Number>(1);
  const [variantList, setVariantList] = useState<any>("");

  const selectDownloadType = useCallback((e: RadioChangeEvent) => {
    setDownloadType(e.target.value);
  },[])

  const onInputChange = useCallback((v: ChangeEvent<HTMLInputElement>) => {
    setVariantList(v.target.value)
  }, [])

  useEffect(() => {
    console.log(downloadType)
    if (downloadType !== 2){
      setVariantList("");
    }
    if (downloadType !== 1){
      setSelectedDateValue("");
      setStartDate(null);
      setEndDate(null)
    }
  }, [downloadType])
  
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
    if (shopIdSelected && selectedDateValue) return false;
    return !(shopIdSelected && variantList);
  }

  const onOk = () => {
    let variants = variantList?.split(",");
    const params = {
      ecommerce_id: ecommerceSelected,
      shop_id: shopIdSelected,
      update_time_from: startDate,
      update_time_to: endDate,
      item_ids: variants
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
                        src={getIconByEcommerceId(shop?.ecommerce_id)}
                        alt={"ecommerce_icon"}
                        style={{ marginRight: "5px", height: "16px" }}
                      />
                      {shop.name}
                    </Option>
                  ))
                }
              </Select>
              </div>
          }
        </div>

        <Radio.Group onChange={(v: RadioChangeEvent) => selectDownloadType(v)} defaultValue={downloadType}>
          <Radio value={1} style={{marginBottom: 12}}>
            Tải sản phẩm theo thời gian cập nhật
          </Radio>
          <RangePicker
              disabled={isLoading || downloadType !== 1}
              placeholder={["Từ ngày", "Đến ngày"]}
              style={{ width: "100%", marginBottom: 20 }}
              format={DATE_FORMAT.DDMMYYY}
              value={selectedDateValue}
              onChange={onChangeDate}
          />
          <Radio value={2} style={{marginBottom: 12}} >
            Tải sản phẩm theo ID
          </Radio>

          <Input placeholder={"Nhập ID sản phẩm"}
                 onInput={onInputChange}
                 disabled={downloadType !== 2}
                 value={variantList}
          />
        </Radio.Group>

      </StyledUpdateProductDataModal>
    </Modal>
  );
};

export default UpdateProductDataModal;
