import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Button, Tabs } from "antd";

import ContentContainer from "component/container/content.container";
import AllOrdersMapping from "screens/ecommerce/orders-mapping/all-orders/AllOrdersMapping";
import GetOrderDataModal from "screens/ecommerce/orders/component/GetOrderDataModal";
import ResultGetOrderDataModal from "screens/ecommerce/orders/component/ResultGetOrderDataModal";

import { OrdersMappingStyled } from "screens/ecommerce/orders-mapping/styles";
import { EcommerceOrderPermission } from "config/permissions/ecommerce.permission";
import useAuthorization from "hook/useAuthorization";
import { DownloadOutlined } from "@ant-design/icons";

const { TabPane } = Tabs;

const ORDER_TABS = {
  all_orders: {
    title: "Tất cả đơn hàng",
    key: "all-orders"
  },
}

const ordersDownloadPermission = [EcommerceOrderPermission.orders_download];


const OrdersMapping: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("all-orders");
  const history = useHistory();

  const [allowOrdersDownload] = useAuthorization({
    acceptPermissions: ordersDownloadPermission,
    not: false,
  });

  const [isReloadPage, setIsReloadPage] = useState(false);
  const [isShowGetOrderModal, setIsShowGetOrderModal] = useState(false);
  const [isShowResultGetOrderModal, setIsShowResultGetOrderModal] = useState(false);
  const [downloadOrderData, setDownloadOrderData] = useState<any>({
    total: 0,
    create_total: 0,
    update_total: 0,
    error_total: 0,
  });

  useEffect(() => {
    switch (history.location.hash) {
      case "#all-orders":
        setActiveTab(ORDER_TABS.all_orders.key);
        break;
      default: break;
    }
  }, [history.location.hash]);

  const handleOnchangeTab = (active: any) => {
    history.replace(`${history.location.pathname}#${active}`);
  }

  // handle get order
  const openGetOrderModal = () => {
    setIsShowGetOrderModal(true);
    setIsReloadPage(false);
  };

  const cancelGetOrderModal = () => {
    setIsShowGetOrderModal(false);
  };

  const updateOrderList = (data: any) => {
    if (data) {
      setDownloadOrderData(data);
      setIsShowGetOrderModal(false);
      setIsShowResultGetOrderModal(true);
    }
  };

  const reloadPage = () => {
    setIsReloadPage(true);
  };

  const closeResultGetOrderModal = () => {
    setIsShowResultGetOrderModal(false);
    reloadPage();
  };
  // end


  return (
    <OrdersMappingStyled>
      <ContentContainer
        title="Mapping đơn hàng sàn"
        extra={
          <>
            {allowOrdersDownload &&
              <Button
                onClick={openGetOrderModal}
                className="ant-btn-outline ant-btn-primary"
                size="large"
                icon={<DownloadOutlined />}
              >
                Tải đơn hàng về
              </Button>
            }
          </>
        }
      >
        <Tabs activeKey={activeTab} onChange={(active) => { handleOnchangeTab(active) }}>
          <TabPane tab={ORDER_TABS.all_orders.title} key={ORDER_TABS.all_orders.key} />
        </Tabs>

        {activeTab === ORDER_TABS.all_orders.key &&
          <AllOrdersMapping isReloadPage={isReloadPage} />
        }

        {isShowGetOrderModal && (
          <GetOrderDataModal
            visible={isShowGetOrderModal}
            onCancel={cancelGetOrderModal}
            onOk={updateOrderList}
          />
        )}

        {isShowResultGetOrderModal && (
          <ResultGetOrderDataModal
            visible={isShowResultGetOrderModal}
            onCancel={closeResultGetOrderModal}
            onOk={closeResultGetOrderModal}
            downloadOrderData={downloadOrderData}
          />
        )}

      </ContentContainer>
    </OrdersMappingStyled>
  );
};

export default OrdersMapping;
