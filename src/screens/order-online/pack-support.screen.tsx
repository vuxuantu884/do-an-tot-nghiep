import React, { useLayoutEffect } from "react";
import { Card, Row, Tabs, Col } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import PackInfo from "./pack-support/pack-info";
import PackList from "./pack-support/pack-list";
import ReportHandOver from "./pack-support/report-hand-over";
import { DeliveryServicesGetList } from "domain/actions/order/order.action";
import { PageResponse } from "model/base/base-metadata.response";
import { useCallback, useEffect, useState } from "react";
import { DeliveryServiceResponse } from "model/response/order/order.response";
import { useDispatch } from "react-redux";
import { OrderPackContext } from "contexts/order-pack/order-pack-context";
import { StoreResponse } from "model/core/store.model";
import { StoreGetListAction } from "domain/actions/core/store.action";
import PackReportHandOver from "./pack-support/pack-report-hand-over";

const { TabPane } = Tabs;

const PackSupportScreen: React.FC = () => {
  const dispatch = useDispatch();

  //queryParams
  const [queryParams, setQueryParams] = useState<any>({
    sort_type: "desc",
    sort_column: "id",
    limit: 1,
    page: 1,
  });

  //useState

  const [data, setData] = useState<PageResponse<any>>({
    metadata: {
      limit: 1,
      page: 1,
      total: 0,
    },
    items: [],
  });

  
  const [listThirdPartyLogistics, setListThirdPartyLogistics] = useState<DeliveryServiceResponse[]>([]);
  const [listStores, setListStores] = useState<Array<StoreResponse>>([]);

  const packSupportContextData={
    listThirdPartyLogistics,
    setListThirdPartyLogistics,
    listStores,
    setListStores,
  };

  useEffect(() => {
    dispatch(
      DeliveryServicesGetList((response: Array<DeliveryServiceResponse>) => {
        setListThirdPartyLogistics(response);
      })
    );
  }, [dispatch]);

  useLayoutEffect(() => {
    dispatch(StoreGetListAction(setListStores));
  }, [dispatch, setListStores]);

  const onPageChange = useCallback(
    (page, limit) => {
      setQueryParams({ ...queryParams, page, limit });
    },
    [queryParams, setQueryParams]
  );

  return (
    <OrderPackContext.Provider value={packSupportContextData}>
      <ContentContainer
        title="Đóng gói và biên bản bàn giao"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: UrlConfig.HOME,
          },
          {
            name: "Đơn hàng",
            path: UrlConfig.ORDER,
          },
          {
            name: "Đóng gói và biên bản bàn giao",
          },
        ]}
      >
        <Row gutter={24}>
          <Col xs={24}>
            <Card>
              <Tabs defaultActiveKey="1">
                <TabPane tab="Đóng gói" key="1">
                  <PackInfo
                    setFulfillmentsPackedItems={setData}
                    fulfillmentData={data}
                    listThirdPartyLogistics={listThirdPartyLogistics}
                  ></PackInfo>
                </TabPane>
                <TabPane tab="Bàn giao" key="2">
                  <PackReportHandOver/>
                </TabPane>
              </Tabs>
            </Card>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col xs={24}>
            <PackList
              data={data}
              queryParams={queryParams}
              onPageChange={onPageChange}
            />
          </Col>
        </Row>

        <Row gutter={24}>
          <Col xs={24}>
            <ReportHandOver/>
          </Col>
        </Row>
        
      </ContentContainer>
    </OrderPackContext.Provider>
  );
};

export default PackSupportScreen;
