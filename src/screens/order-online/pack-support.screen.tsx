import React from "react";
import { Card, Row, Tabs, Col } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import PackInfo from "./pack-support/pack-info";
import PackList from "./pack-support/pack-list";
import { getFulfillmentsPackedSaga } from "domain/actions/order/order.action";
import { PageResponse } from "model/base/base-metadata.response";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { showError } from "utils/ToastUtils";

const { TabPane } = Tabs;

const PackSupportScreen: React.FC = () => {
  const dispatch = useDispatch();

  //queryParams
  const [queryParams, setQueryParams] = useState<any>({
    sort_type: "desc",
    sort_column: "id",
    limit: 10,
    page: 1,
  });

  //useState
  const [tableLoading, setTableLoading] = useState(true);

  const [data, setData] = useState<PageResponse<any>>({
    metadata: {
      limit: 10,
      page: 1,
      total: 0,
    },
    items: [],
  });



  const setFulfillmentsPackedItems = useCallback((data: PageResponse<any>) => {
    setTableLoading(false);
    if (data) {
      setData(data);
    }
  }, []);

  useEffect(() => {
    dispatch(
      getFulfillmentsPackedSaga(queryParams, (data: PageResponse<any>) => {
        if (data) {
          setFulfillmentsPackedItems(data);
        } else showError("Lấy danh sách Order thất bại");
      })
    );
  }, [dispatch, setFulfillmentsPackedItems, queryParams]);

  const onPageChange = useCallback(
    (page, limit) => {
      setQueryParams({ ...queryParams, page, limit });
    },
    [queryParams, setQueryParams]
  );
  return (
    <React.Fragment>
      <ContentContainer
        title="Đóng gói và giao hàng"
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
            name: "Đóng gói và giao hàng",
          },
        ]}
      >
        <Row gutter={24}>
          <Col xs={24}>
            <Card>
              <Tabs defaultActiveKey="1">
                <TabPane tab="Đóng gói" key="1">
                  <PackInfo setFulfillmentsPackedItems={setFulfillmentsPackedItems} queryParams={queryParams}></PackInfo>
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
            <PackList data={data} tableLoading={tableLoading} onPageChange={onPageChange} />
          </Col>
        </Row>
      </ContentContainer>
    </React.Fragment>
  );
};

export default PackSupportScreen;
