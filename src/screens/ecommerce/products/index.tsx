import React from "react";
import { Card, Tabs, Form, Button, Modal, Select, DatePicker } from "antd";
import {DownloadOutlined} from "@ant-design/icons"
import checkCircleIcon from "assets/icon/check-circle.svg";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import TotalItemsEcommerce from "./tab/total-items-ecommerce";
import ConnectedItems from "./tab/connected-items";
import NotConnectedItems from "./tab/not-connected-items";
import { StyledComponent } from "./styles";
import { useDispatch } from "react-redux";
import { getListStoresSimpleAction } from "domain/actions/core/store.action";
import { StoreResponse } from "model/core/store.model";
import {
  AccountResponse,
  // AccountSearchQuery,
} from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { TotalItemsEcommerceResponse } from "model/response/ecommerce/ecommerce.response";
import {
  ecommerceConfigGetAction,
} from "domain/actions/ecommerce/ecommerce.actions";

const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;
// const initQueryAccount: AccountSearchQuery = {
//   info: "",
// };

const Products: React.FC = () => {
  const dispatch = useDispatch();
  // const [configForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState<string>("total-item");
  const history = useHistory();
  const [isShowGetItemModal, setIsShowGetItemModal] = React.useState(false);
  const [isShowResultGetItemModal, setIsShowResultGetItemModal] = React.useState(false);
  const [totalGetItem, setTotalGetItem] = React.useState(0);
  const [itemsUpdated, setItemsUpdated] = React.useState(0);
  const [itemsNotConnected, setItemsNotConnected] = React.useState(0);
  
  
  

  const [, setStores] = useState<Array<StoreResponse>>([]);
  const [, setAccounts] = React.useState<Array<AccountResponse>>([]);
  const [configData, setConfigData] = React.useState<Array<TotalItemsEcommerceResponse>>(
    []
  );
  const [, setConfigToView] = React.useState<TotalItemsEcommerceResponse>();
  const setDataAccounts = React.useCallback(
    (data: PageResponse<AccountResponse> | false) => {
      if (!data) {
        return;
      }
      const _items = data.items.filter((item) => item.status === "active");
      setAccounts(_items);
    },
    []
  );
  React.useEffect(() => {
    dispatch(ecommerceConfigGetAction(setConfigData));
  }, [dispatch]);
  const reloadConfigData = () => {
    dispatch(ecommerceConfigGetAction(setConfigData));
  }
  // const accountChangeSearch = React.useCallback(
  //   (value) => {
  //     initQueryAccount.info = value;
  //     dispatch(AccountSearchAction(initQueryAccount, setDataAccounts));
  //   },
  //   [dispatch, setDataAccounts]
  // );

  React.useEffect(() => {
    dispatch(AccountSearchAction({}, setDataAccounts));
  }, [dispatch, setDataAccounts]);

  useEffect(() => {
    dispatch(
      getListStoresSimpleAction((stores) => {
        setStores(stores);
      })
    );
  }, [dispatch]);

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
  };

  const getProductsFromEcommerce = () => {
    setIsShowGetItemModal(false);
    setIsShowResultGetItemModal(true);

    setTotalGetItem(11);
    setItemsUpdated(5)
    setItemsNotConnected(6);
    //thai need todo: call api
  };

  const redirectToNotConnectedItems = () => {
    setIsShowResultGetItemModal(false);
    history.replace(`${history.location.pathname}#not-connected-item`);
    setActiveTab("not-connected-item");
  };

  const cancelResultGetItemModal = () => {
    setIsShowResultGetItemModal(false);
  };

  //thai fake data 
  const LIST_STALL = [
    {
      id: 1,
      name: "Sàn Shopee",
      value: "shopeeChannel"
    }
  ]

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
                reloadConfigData();
              }}
            >
              <TabPane tab="Tất cả sản phẩm" key="total-item">
                <TotalItemsEcommerce
                  configData={configData}
                  setConfigToView={setConfigToView}
                />
              </TabPane>
              <TabPane tab="Sản phẩm đã ghép" key="connected-item">
                <ConnectedItems
                  configData={configData}
                  setConfigToView={setConfigToView}
                />
              </TabPane>
              <TabPane tab="Sản phẩm chưa ghép" key="not-connected-item">
                <NotConnectedItems
                  configData={configData}
                  setConfigToView={setConfigToView}
                />
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
      >
        <div style={{margin: "20px 0"}}>
          <Form
          // form={formAdvance}
          // onFinish={onFinish}
          // //ref={formRef}
          // initialValues={params}
          layout="vertical"
          >
            <Form.Item
              name="stall"
              label={<b>Lựa chọn gian hàng</b>}
            >
              <Select
                showSearch
                placeholder="Chọn gian hàng"
                allowClear
                // optionFilterProp="children"
              >
                {LIST_STALL.map((item) => (
                  <Option key={item.id} value={item.value}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          
            <Form.Item name="start_time" label={<b>Thời gian</b>}>
              <RangePicker placeholder={["Từ ngày", "Đến ngày"]} />
            </Form.Item>
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
