import React, { useLayoutEffect } from "react";
import { Card, Row, Tabs, Col } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import PackInfo from "./pack/info/pack-info";
import PackList from "./pack/info/pack-list";
import AddReportHandOver from "./pack/info/add-report-hand-over";
import {
  DeliveryServicesGetList,
  getChannels,
} from "domain/actions/order/order.action";
import { useEffect, useState } from "react";
import {
  ChannelsResponse,
  DeliveryServiceResponse,
  OrderResponse,
} from "model/response/order/order.response";
import { useDispatch } from "react-redux";
import { OrderPackContext } from "contexts/order-pack/order-pack-context";
import { StoreResponse } from "model/core/store.model";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { GoodsReceiptsTypeResponse } from "model/response/pack/pack.response";
import { getGoodsReceiptsType } from "domain/actions/goods-receipts/goods-receipts.action";
import PackReportHandOver from "./pack/info/pack-report-hand-over";
import { getQueryParams, useQuery } from "utils/useQuery";
// import "assets/css/_pack.scss";
import { useHistory } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import { ODERS_PERMISSIONS } from "config/permissions/order.permission";
import useAuthorization from "hook/useAuthorization";
import { StyledComponent } from "./pack/styles";
import './pack/styles.scss';
import { getPackInfo } from "utils/LocalStorageUtils";

const { TabPane } = Tabs;

const PackSupportScreen: React.FC = () => {
  const dispatch = useDispatch();
  const query = useQuery();
  const newParam: any = getQueryParams(query);
  const history = useHistory();
  //useState

  const [data, setData] = useState<OrderResponse[]>([]);

  const [isFulFillmentPack,setIsFulFillmentPack]=useState<string[]>([]);

  const [activeTab, setActiveTab] = useState("1");

  const [listThirdPartyLogistics, setListThirdPartyLogistics] = useState<
    DeliveryServiceResponse[]
  >([]);
  const [listStores, setListStores] = useState<Array<StoreResponse>>([]);
  const [listGoodsReceiptsType, setListGoodsReceiptsType] = useState<
    Array<GoodsReceiptsTypeResponse>
  >([]);
  const [listChannels, setListChannels] = useState<Array<ChannelsResponse>>([]);

  const [allowReadGoodReceipt] = useAuthorization({
    acceptPermissions: [ODERS_PERMISSIONS.READ_GOODS_RECEIPT],
    not: false,
  });

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
    isFulFillmentPack,
    setIsFulFillmentPack,
  };

  useEffect(() => {
    dispatch(
      DeliveryServicesGetList((response: Array<DeliveryServiceResponse>) => {
        setListThirdPartyLogistics(response);
      })
    );

    dispatch(getGoodsReceiptsType(setListGoodsReceiptsType));

    dispatch(
      getChannels(2, (data: ChannelsResponse[]) => {
        setListChannels(data);
      })
    );

    dispatch(StoreGetListAction(setListStores));
  }, [dispatch]);


  useLayoutEffect(() => {
    setActiveTab(newParam.tab);
  }, [newParam.tab]);

  useLayoutEffect(() => {
    let packInfo: string | null = getPackInfo();
    if (packInfo) {
      let order: any = JSON.parse(packInfo);
      setData([...order]);
    }
  }, []);

  const handleClickTab = (value: string) => {
    setActiveTab(value);

    let queryParam = generateQuery({ ...newParam, tab: value });
    history.push(`${UrlConfig.PACK_SUPPORT}?${queryParam}`);
  };

  console.log("isFulFillmentPack",isFulFillmentPack);
  

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
        <StyledComponent>
          <Row gutter={24}>
            <Col xs={24}>
              <Card className="pack-card">
                <Tabs activeKey={activeTab} onChange={handleClickTab}>
                  <TabPane tab="Đóng gói" key="1">
                    <PackInfo
                      setFulfillmentsPackedItems={setData}
                      fulfillmentData={data}
                    ></PackInfo>
                  </TabPane>
                  <TabPane tab="Biên bản bàn giao" key="2" disabled={!allowReadGoodReceipt}>
                    <PackReportHandOver query={query} />
                  </TabPane>
                </Tabs>
              </Card>
            </Col>
          </Row>
          {activeTab !== "2" && (
            <div>
              <Row gutter={24}>
                <Col xs={24}>
                  <PackList />
                </Col>
              </Row>

              <Row gutter={24}>
                <Col xs={24}>
                  <AddReportHandOver />
                </Col>
              </Row>
            </div>
          )}
        </StyledComponent>

      </ContentContainer>
    </OrderPackContext.Provider>
  );
};

export default PackSupportScreen;
