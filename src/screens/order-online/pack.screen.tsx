import React from "react";
import { Card, Row, Col } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import PackInfo from "./pack/info/pack-info";
import PackList from "./pack/info/pack-list";
import AddReportHandOver from "./pack/info/add-report-hand-over";
import {
  DeliveryServicesGetList,
  getChannels,
} from "domain/actions/order/order.action";
import { PageResponse } from "model/base/base-metadata.response";
import { useEffect, useState } from "react";
import {
  ChannelsResponse,
  DeliveryServiceResponse,
} from "model/response/order/order.response";
import { useDispatch } from "react-redux";
import { OrderPackContext } from "contexts/order-pack/order-pack-context";
import { StoreResponse } from "model/core/store.model";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { GoodsReceiptsTypeResponse } from "model/response/pack/pack.response";
import { getGoodsReceiptsType } from "domain/actions/goods-receipts/goods-receipts.action";
import { StyledComponent } from "./pack/styles";
import './pack/styles.scss';

const PackSupportScreen: React.FC = () => {
  const dispatch = useDispatch();

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
          <Row>
            <Col>
              <Card className="pack-card">
                <PackInfo
                  setFulfillmentsPackedItems={setData}
                  fulfillmentData={data}
                />
              </Card>
            </Col>
          </Row>
          
          <Row gutter={24}>
            <Col xs={24}>
              <PackList data={data} />
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24}>
              <AddReportHandOver />
            </Col>
          </Row>
        </StyledComponent>

      </ContentContainer>
    </OrderPackContext.Provider>
  );
};

export default PackSupportScreen;
