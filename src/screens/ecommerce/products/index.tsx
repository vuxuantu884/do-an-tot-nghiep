import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Card, Tabs, Form, Button, Modal, Select, DatePicker } from "antd";
import {DownloadOutlined} from "@ant-design/icons"

import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import TotalItemsEcommerce from "./tab/total-items-ecommerce";
import ConnectedItems from "./tab/connected-items";
import NotConnectedItems from "./tab/not-connected-items";

import checkCircleIcon from "assets/icon/check-circle.svg";

import { StyledComponent } from "./styles";

const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Products: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("total-item");
  const history = useHistory();
  const [isShowGetItemModal, setIsShowGetItemModal] = React.useState(false);
  const [isShowResultGetItemModal, setIsShowResultGetItemModal] = React.useState(false);
  const [totalGetItem, setTotalGetItem] = React.useState(0);
  const [itemsUpdated, setItemsUpdated] = React.useState(0);
  const [itemsNotConnected, setItemsNotConnected] = React.useState(0);

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
              }}
            >
              <TabPane tab="Tất cả sản phẩm" key="total-item">
                <TotalItemsEcommerce />
              </TabPane>

              <TabPane tab="Sản phẩm đã ghép" key="connected-item">
                <ConnectedItems />
              </TabPane>
              
              <TabPane tab="Sản phẩm chưa ghép" key="not-connected-item">
                <NotConnectedItems />
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
