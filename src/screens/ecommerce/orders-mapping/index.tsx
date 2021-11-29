import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Tabs } from "antd";

import ContentContainer from "component/container/content.container";
import AllOrdersMapping from "screens/ecommerce/orders-mapping/all-orders/AllOrdersMapping";

import AuthWrapper from "component/authorization/AuthWrapper";
import NoPermission from "screens/no-permission.screen";
import { EcommerceOrderPermission } from "config/permissions/ecommerce.permission";

import { OrdersMappingStyled } from "./styles";

const { TabPane } = Tabs;

const ORDER_TABS = {
  all_orders: {
    title: "Tất cả đơn hàng",
    key: "all-orders"
  },
}


const ordersViewPermission = [EcommerceOrderPermission.orders_view];

const OrdersMapping: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("all-orders");
  const history = useHistory();

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


  return (
    <OrdersMappingStyled>
      <ContentContainer
        title="Mapping đơn hàng sàn"
      >
        <AuthWrapper acceptPermissions={ordersViewPermission} passThrough>
          {(allowed: boolean) => (allowed ?
            <>
              <Tabs activeKey={activeTab} onChange={(active) => { handleOnchangeTab(active) }}>
                <TabPane tab={ORDER_TABS.all_orders.title} key={ORDER_TABS.all_orders.key} />
              </Tabs>
              
              {activeTab === ORDER_TABS.all_orders.key &&
                <AllOrdersMapping />
              }
              
            </>
          : <NoPermission />)}
        </AuthWrapper>
      </ContentContainer>
    </OrdersMappingStyled>
  );
};

export default OrdersMapping;
