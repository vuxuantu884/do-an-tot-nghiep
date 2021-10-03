import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Card, Tabs, Form, Button, Modal, Select, DatePicker, Tooltip } from "antd";
import moment from "moment";
import { DATE_FORMAT } from 'utils/DateUtils';
import {DownloadOutlined} from "@ant-design/icons"

import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import TotalItemsEcommerce from "./tab/total-items-ecommerce";
import ConnectedItems from "./tab/connected-items";
import NotConnectedItems from "./tab/not-connected-items";

import {
  getShopEcommerceList,
  postProductEcommerceList,
  getCategoryList
} from "domain/actions/ecommerce/ecommerce.actions";

import tikiIcon from "assets/icon/e-tiki.svg";
import shopeeIcon from "assets/icon/e-shopee.svg";
import lazadaIcon from "assets/icon/e-lazada.svg";
import sendoIcon from "assets/icon/e-sendo.svg";
import checkCircleIcon from "assets/icon/check-circle.svg";
import successIcon from "assets/icon/success_2.svg";

import { StyledComponent, StyledEcommerceList } from "./styles";

const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Products: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("total-item");
  const history = useHistory();
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [isShowGetItemModal, setIsShowGetItemModal] = React.useState(false);
  const [isShowResultGetItemModal, setIsShowResultGetItemModal] = React.useState(false);
  const [totalGetItem, setTotalGetItem] = React.useState(0);
  const [itemsUpdated, setItemsUpdated] = React.useState(0);
  const [itemsNotConnected, setItemsNotConnected] = React.useState(0);

  const [isEcommerceSelected, setIsEcommerceSelected] = React.useState(false);
  const [ecommerceSelected, setEcommerceSelected] = React.useState(0);
  const [ecommerceShopList, setEcommerceShopList] = React.useState<Array<any>>([]);
  const [categoryList, setCategoryList] = React.useState<Array<any>>([]);

  const [shopIdSelected, setShopIdSelected] = React.useState(null);
  const [startDate, setStartDate] = React.useState<any>();
  const [endDate, setEndDate] = React.useState<any>();
  const [activatedBtn, setActivatedBtn] = React.useState({
    title: "",
    icon: "",
    id: 0,
    isActive: "",
    key: "",
  });

  const dispatch = useDispatch();

  const updateCategoryData = React.useCallback((result) => {
    if (!!result && result.items) {
      setCategoryList(result.items);
    }    
  }, []);

  useEffect(() => {
    dispatch(getCategoryList({}, updateCategoryData));
  }, [dispatch, updateCategoryData]);

  useEffect(() => {
    if (history.location.hash) {
      switch (history.location.hash) {
        case "#total-item":
          setActiveTab("total-item");
          break;
        case "#connected-item":
          setActiveTab("connected-item");
          break;
        case "#not-connected-item":
          setActiveTab("not-connected-item");
          break;
      }
    }
  }, [history.location.hash]);

  const handleGetProductsFromEcommerce = () => {
    setIsShowGetItemModal(true);
  }

  const cancelGetItemModal = () => {
    setIsShowGetItemModal(false);
    setActivatedBtn(
      {
        title: "",
        icon: "",
        id: 0,
        isActive: "",
        key: ""
      }
    );
    setEcommerceSelected(0);
    setIsEcommerceSelected(false);
  };

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
    const startDate = convertStartDateToTimestamp(dateStrings[0]);
    setStartDate(startDate);
    const endDate = convertEndDateToTimestamp(dateStrings[1]);
    setEndDate(endDate);

    setValue(dates);
  };
  
  //end handle date

  const updateEcommerceList = React.useCallback((data) => {
    setIsLoading(false);
    if (data) {
      setIsShowGetItemModal(false);
      setIsShowResultGetItemModal(true);

      setTotalGetItem(data.total);
      setItemsUpdated(data.update_total);
      setItemsNotConnected(data.create_total);
    }
  }, []);

  const getProductsFromEcommerce = () => {

    const params = {
      ecommerce_id: ecommerceSelected || null,
      shop_id: shopIdSelected || null,
      update_time_from: startDate || null,
      update_time_to: endDate || null
    }
    
    setIsLoading(true);
    dispatch(postProductEcommerceList(params, updateEcommerceList));
  };

  const isDisableGetItemOkButton = () => {
    return !shopIdSelected || !startDate || !endDate;
  }

  const redirectToNotConnectedItems = () => {
    setIsShowResultGetItemModal(false);
    history.replace(`${history.location.pathname}#not-connected-item`);
    setActiveTab("not-connected-item");
  };

  const cancelResultGetItemModal = () => {
    setIsShowResultGetItemModal(false);
    setIsLoading(false);
  };

  const [ecommerceList] = useState<Array<any>>([
    {
      title: "Sàn Tiki",
      icon: tikiIcon,
      id: 2,
      isActive: false,
      key: "tiki"
    },
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
      id: 3,
      isActive: false,
      key: "lazada",
    },
    {
      title: "Sàn Sendo",
      icon: sendoIcon,
      id: 4,
      isActive: false,
      key: "sendo",
    },
  ]);

  const selectEcommerce = (item: any) => {
    setActivatedBtn(item)
    setEcommerceSelected(item && item.id);
    getShopEcommerce(item && item.id);
  };

  const updateEcommerceShopList = React.useCallback((result) => {
    setIsEcommerceSelected(true);
    setEcommerceShopList(result);
  }, []);

  const getShopEcommerce = (ecommerceId: any) => {
    setShopIdSelected(null);
    setIsEcommerceSelected(false);
    dispatch(getShopEcommerceList({ecommerce_id: ecommerceId}, updateEcommerceShopList));
  }

  const selectShopEcommerce = (shop_id: any) => {
    setShopIdSelected(shop_id);
  }

  return (
    <StyledComponent>
      <ContentContainer
        title="DANH SÁCH SẢN PHẨM"
        breadcrumb={[
          {
            name: "Tổng quản",
            path: UrlConfig.HOME,
          },
          {
            name: "Sàn TMĐT",
            path: `${UrlConfig.ECOMMERCE}`,
          },
          {
            name: "Sản phẩm",
          },
        ]}
        extra={
          <>
            <Button
              onClick={handleGetProductsFromEcommerce}
              className="ant-btn-outline ant-btn-primary"
              size="large"
              icon={<DownloadOutlined />}
            >
              Tải sản phẩm từ sàn về
            </Button>
          </>
        }
      >
          <Card>
            <Tabs
              activeKey={activeTab}
              onChange={(active) => {
                history.replace(`${history.location.pathname}#${active}`);
              }}
            >
              <TabPane tab="Tất cả sản phẩm" key="total-item">
                <TotalItemsEcommerce categoryList={categoryList} />
              </TabPane>

              <TabPane tab="Sản phẩm đã ghép" key="connected-item">
                <ConnectedItems categoryList={categoryList} />
              </TabPane>
              
              <TabPane tab="Sản phẩm chưa ghép" key="not-connected-item">
                <NotConnectedItems categoryList={categoryList} />
              </TabPane>
            </Tabs>
          </Card>
      </ContentContainer>

      <Modal
        width="600px"
        className=""
        visible={isShowGetItemModal}
        title="Cập nhật dữ liệu từ gian hàng"
        okText="Cập nhật dữ liệu sản phẩm"
        cancelText="Hủy"
        onCancel={cancelGetItemModal}
        onOk={getProductsFromEcommerce}
        okButtonProps={{disabled: isDisableGetItemOkButton()}}
        maskClosable={false}
        confirmLoading={isLoading}
      >
        <div style={{margin: "20px 0"}}>
          <Form
          // form={formAdvance}
          // onFinish={onFinish}
          // //ref={formRef}
          // initialValues={params}
          layout="vertical"
          >
            <StyledEcommerceList>
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
            </StyledEcommerceList>

            <Form.Item
              name="shop_id"
              label={<b>Lựa chọn gian hàng <span style={{color: 'red'}}>*</span></b>}
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
              }
            </Form.Item>
          
            <Form.Item name="start_time" label={<b>Thời gian <span style={{color: 'red'}}>*</span></b>}>
              <RangePicker
                disabled={isLoading}
                placeholder={["Từ ngày", "Đến ngày"]}
                style={{width: "100%"}}
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
        </div>
      </Modal>

      <Modal
        width="600px"
        className=""
        visible={isShowResultGetItemModal}
        title={"Có " + totalGetItem + " sản phẩm được cập nhật thành công"}
        okText="Đóng"
        onOk={redirectToNotConnectedItems}
        onCancel={cancelResultGetItemModal}
        cancelButtonProps={{ style: { display: 'none' } }}
      >
        <div>
          <div>
            <img src={checkCircleIcon} style={{ marginRight: 5 }} alt="" />
            <span>Có <p style={{color: "orange", display: "inline-block"}}>{itemsNotConnected}</p> sản phẩm được tải mới về để ghép</span>
          </div>
          <div>
            <img src={checkCircleIcon} style={{ marginRight: 5 }} alt="" />
            <span>Có <p style={{color: "green", display: "inline-block"}}>{itemsUpdated}</p> sản phẩm đã update thành công</span>
          </div>
        </div>
      </Modal>

    </StyledComponent>
  );
};

export default Products;
