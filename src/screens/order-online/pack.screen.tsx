import React, { useLayoutEffect } from "react";
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
import { useEffect, useState } from "react";
import {
  ChannelsResponse,
  DeliveryServiceResponse,
} from "model/response/order/order.response";
import { useDispatch, useSelector } from "react-redux";
import { OrderPackContext } from "contexts/order-pack/order-pack-context";
import { StoreResponse } from "model/core/store.model";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { GoodsReceiptsTypeResponse } from "model/response/pack/pack.response";
import { getGoodsReceiptsType } from "domain/actions/goods-receipts/goods-receipts.action";
import { StyledComponent } from "./pack/styles";
import './pack/styles.scss';
import { getPackInfo, setPackInfo } from "utils/LocalStorageUtils";
import { PackModel, PackModelDefaltValue } from "model/pack/pack.model";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { getListOrderApi } from "service/order/order.service";
import { handleFetchApiError, haveAccess, isFetchApiSuccessful } from "utils/AppUtils";
import { RootReducerType } from "model/reducers/RootReducerType";

const PackSupportScreen: React.FC = () => {
  const dispatch = useDispatch();
  const userReducer = useSelector((state: RootReducerType) => state.userReducer);
  const [packModel, setPackModel] = useState<PackModel | null>();

  const [isFulFillmentPack, setIsFulFillmentPack] = useState<string[]>([]);

  const [listThirdPartyLogistics, setListThirdPartyLogistics] = useState<
    DeliveryServiceResponse[]
  >([]);
  const [listStores, setListStores] = useState<Array<StoreResponse>>([]);
  const [listStoresDataCanAccess, setListStoresDataCanAccess] = useState<Array<StoreResponse>>([]);
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
    packModel,
    setPackModel,
    isFulFillmentPack,
    setIsFulFillmentPack,
    listStoresDataCanAccess,
    setListStoresDataCanAccess
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

  useEffect(() => {
    let newData: Array<StoreResponse> = [];
    if (listStores && listStores.length) {
      if (userReducer.account?.account_stores && userReducer.account?.account_stores.length > 0) {
        newData = listStores.filter((store) =>
          haveAccess(
            store.id,
            userReducer.account ? userReducer.account.account_stores : []
          )
        );
        setListStoresDataCanAccess(newData);
      }
      else {
        // trường hợp sửa đơn hàng mà account ko có quyền với cửa hàng đã chọn, thì vẫn hiển thị
        setListStoresDataCanAccess(listStores);
      }
    }
  }, [listStores, userReducer.account]);

  // useLayoutEffect(() => {
  //   setActiveTab(newParam.tab);
  // }, [newParam.tab]);

  useLayoutEffect(() => {
    let packInfo: string | null = getPackInfo();
    if (packInfo) {
      dispatch(showLoading());
      let packInfoConvertJson: any = JSON.parse(packInfo);
      let packData: PackModel = { ...new PackModelDefaltValue(), ...packInfoConvertJson };
      let storeId: number | null | undefined = packData.store_id ? 
        listStoresDataCanAccess.findIndex((p) => p.id === packData.store_id) !== -1 
        ? packData.store_id : null : null;
      let queryCode = packData.order.map(p => p.order_code);
      let queryParam: any = { code: queryCode }
      getListOrderApi(queryParam).then((response) => {
        if (isFetchApiSuccessful(response)) {
          let orderEnd = packData.order.filter((p) => response.data.items.some(p1 => p1.code === p.order_code && !p1.goods_receipt_id));
          setPackModel({ ...packData,store_id:storeId ,order: orderEnd });
          setPackInfo({ ...packData,store_id:storeId, order: orderEnd });
        }
        else handleFetchApiError(response, "Danh sách Fullfiment", dispatch)
      }).catch((err) => {
        console.log(err);
      }).finally(() => { dispatch(hideLoading()); });
    }
  }, [dispatch, listStoresDataCanAccess]);

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
            <Col xs={24}>
              <Card className="pack-card">
                <PackInfo />
              </Card>
            </Col>
          </Row>

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
        </StyledComponent>

      </ContentContainer>
    </OrderPackContext.Provider>
  );
};

export default PackSupportScreen;
