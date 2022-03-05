import React, { useLayoutEffect } from "react";
import { Card, Row, Tabs, Col } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import PackInfo from "./info/pack-info";
import PackList from "./info/pack-list";
import AddReportHandOver from "./info/add-report-hand-over";
import {
  DeliveryServicesGetList,
  getChannels,
} from "domain/actions/order/order.action";
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
import PackReportHandOver from "./info/pack-report-hand-over";
import { getQueryParams, useQuery } from "utils/useQuery";
// import "assets/css/_pack.scss";
import { useHistory } from "react-router-dom";
import { generateQuery, handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";
import { ODERS_PERMISSIONS } from "config/permissions/order.permission";
import useAuthorization from "hook/useAuthorization";
import { StyledComponent } from "./styles";
import './styles.scss';
import { getPackInfo, setPackInfo } from "utils/LocalStorageUtils";
import { PackModel, PackModelDefaltValue } from "model/pack/pack.model";
import { getListOrderApi } from "service/order/order.service";
import { OrderModel } from "model/order/order.model";
import { hideLoading, showLoading } from "domain/actions/loading.action";

const { TabPane } = Tabs;

const PackSupportScreen: React.FC = () => {
  const dispatch = useDispatch();
  const query = useQuery();
  const newParam: any = getQueryParams(query);
  const history = useHistory();
  //useState

  const [packModel, setPackModel] = useState<PackModel | null>();

  const [isFulFillmentPack, setIsFulFillmentPack] = useState<string[]>([]);

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
    packModel,
    setPackModel,
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
      dispatch(showLoading());
      let packInfoConvertJson: any = JSON.parse(packInfo);
      let packData: PackModel = { ...new PackModelDefaltValue(), ...packInfoConvertJson };

      let queryCode = packData.order.map(p => p.order_code);
      let queryParam: any = { code: queryCode }
      getListOrderApi(queryParam).then((response) => {
        if (isFetchApiSuccessful(response)) {
          console.log("getListOrderApi",response.data.items);
          let orderEnd= packData.order.filter((p)=>response.data.items.some(p1=>p1.code===p.order_code && !p1.goods_receipt_id)); 
          setPackModel({...packData,order:orderEnd});
          setPackInfo({...packData,order:orderEnd});
        } 
        else handleFetchApiError(response, "Danh sách Đơn hàng", dispatch)
      }).catch((err) => {
        console.log(err);
      }).finally(()=>{dispatch(hideLoading());});
     
    }
  }, [dispatch]);

  const handleClickTab = (value: string) => {
    setActiveTab(value);

    let queryParam = generateQuery({ ...newParam, tab: value });
    history.push(`${UrlConfig.PACK_SUPPORT}?${queryParam}`);
  };

  return (
    <OrderPackContext.Provider value={packSupportContextData}>
      <ContentContainer
        title="Hỗ trợ đóng gói"
        breadcrumb={[
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
                <Tabs activeKey={activeTab} onChange={handleClickTab}>
                  <TabPane tab="Đóng gói" key="1">
                    <PackInfo
                    // setFulfillmentsPackedItems={setData}
                    // fulfillmentData={data}
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
