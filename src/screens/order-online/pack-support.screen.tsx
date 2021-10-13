import React from "react";
import { Card, Row, Tabs, Col } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import PackInfo from "./pack-support/pack-info";
import PackList from "./pack-support/pack-list";
import { DeliveryServicesGetList } from "domain/actions/order/order.action";
import { PageResponse } from "model/base/base-metadata.response";
import { useCallback, useEffect, useState } from "react";
import { DeliveryServiceResponse } from "model/response/order/order.response";
import { useDispatch } from "react-redux";

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

  const [listThirdPartyLogistics, setListThirdPartyLogistics] = useState<
    DeliveryServiceResponse[]
  >([]);

  useEffect(() => {
    dispatch(
      DeliveryServicesGetList((response: Array<DeliveryServiceResponse>) => {
        setListThirdPartyLogistics(response);
      })
    );
  }, [dispatch]);

  const onPageChange = useCallback(
    (page, limit) => {
      setQueryParams({ ...queryParams, page, limit });
    },
    [queryParams, setQueryParams]
  );

  console.log(data);
  return (
    <React.Fragment>
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
                    queryParams={queryParams}
                    listThirdPartyLogistics={listThirdPartyLogistics}
                  ></PackInfo>
                </TabPane>
                <TabPane tab="Bàn giao" disabled key="2">
                  Tab 2
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
        
      </ContentContainer>
    </React.Fragment>
  );
};

export default PackSupportScreen;
