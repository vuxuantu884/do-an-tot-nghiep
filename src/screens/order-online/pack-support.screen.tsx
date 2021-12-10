import React, {useLayoutEffect} from "react";
import {Card, Row, Tabs, Col} from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import PackInfo from "./pack-support/pack-info";
import PackList from "./pack-support/pack-list";
import ReportHandOver from "./pack-support/report-hand-over";
import {
  DeliveryServicesGetList,
  getChannels,
} from "domain/actions/order/order.action";
import {PageResponse} from "model/base/base-metadata.response";
import {useEffect, useState} from "react";
import {
  ChannelsResponse,
  DeliveryServiceResponse,
} from "model/response/order/order.response";
import {useDispatch} from "react-redux";
import {OrderPackContext} from "contexts/order-pack/order-pack-context";
import {StoreResponse} from "model/core/store.model";
import {StoreGetListAction} from "domain/actions/core/store.action";
import {GoodsReceiptsTypeResponse} from "model/response/pack/pack.response";
import {getGoodsReceiptsType} from "domain/actions/goods-receipts/goods-receipts.action";
import PackReportHandOverCopy from "./pack-support/pack-report-hand-over-copy";
import {useQuery} from "utils/useQuery";
import "assets/css/_pack.scss";
import { ODERS_PERMISSIONS } from "config/permissions/order.permission";
import AuthFunction from "component/authorization/AuthFunction";

const {TabPane} = Tabs;

const PackSupportScreen: React.FC = () => {
  const dispatch = useDispatch();
  const query = useQuery();
  //useState

  const [data, setData] = useState<PageResponse<any>>({
    metadata: {
      limit: 1,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const [activeTab, setActiveTab] = useState("1");

  const [listThirdPartyLogistics, setListThirdPartyLogistics] = useState<
    DeliveryServiceResponse[]
  >([]);
  const [listStores, setListStores] = useState<Array<StoreResponse>>([]);
  const [listGoodsReceiptsType, setListGoodsReceiptsType] = useState<
    Array<GoodsReceiptsTypeResponse>
  >([]);
  const [listChannels, setListChannels] = useState<Array<ChannelsResponse>>([]);

  const packSupportContextData = {
    listThirdPartyLogistics,
    setListThirdPartyLogistics,
    listStores,
    setListStores,
    listGoodsReceiptsType,
    setListGoodsReceiptsType,
    listChannels,
    setListChannels,
    data,
    setData,
  };

  // useEffect(() => {
  //   dispatch(loadOrderPackAction(setData));
  // }, [dispatch]);

  useEffect(() => {
    dispatch(
      DeliveryServicesGetList((response: Array<DeliveryServiceResponse>) => {
        setListThirdPartyLogistics(response);
      })
    );
  }, [dispatch]);

  useEffect(() => {
    dispatch(getGoodsReceiptsType(setListGoodsReceiptsType));
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      getChannels(2, (data: ChannelsResponse[]) => {
        setListChannels(data);
      })
    );
  }, [dispatch]);

  useLayoutEffect(() => {
    dispatch(StoreGetListAction(setListStores));
  }, [dispatch, setListStores]);

  const handleClickTab = (value: string) => {
    setActiveTab(value);
  };

  return (
    <OrderPackContext.Provider value={packSupportContextData}>
      <ContentContainer
        title="Hỗ trợ đóng gói"
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
            name: "Hỗ trợ đóng gói",
          },
        ]}
      >
        <Row gutter={24}>
          <Col xs={24}>
            <Card className="pack-support-card">
              <Tabs activeKey={activeTab} onChange={handleClickTab}>
                <TabPane tab="Đóng gói" key="1">
                  <PackInfo
                    setFulfillmentsPackedItems={setData}
                    fulfillmentData={data}
                    listThirdPartyLogistics={listThirdPartyLogistics}
                  ></PackInfo>
                </TabPane>
                <TabPane tab="Biên bản bàn giao" key="2" disabled={!AuthFunction(ODERS_PERMISSIONS.READ_GOODS_RECEIPT)}>
                  <PackReportHandOverCopy query={query} />
                </TabPane>
              </Tabs>
            </Card>
          </Col>
        </Row>
        {activeTab === "1" && (
          <div>
            <Row gutter={24}>
              <Col xs={24}>
                <PackList data={data} />
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24}>
                <ReportHandOver />
              </Col>
            </Row>
          </div>
        )}
      </ContentContainer>
    </OrderPackContext.Provider>
  );
};

export default PackSupportScreen;
