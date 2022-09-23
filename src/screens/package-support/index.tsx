import React from "react";
import { Row, Col } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { DeliveryServicesGetList, getChannels } from "domain/actions/order/order.action";
import { useEffect, useState } from "react";
import { ChannelsResponse, DeliveryServiceResponse } from "model/response/order/order.response";
import { useDispatch, useSelector } from "react-redux";
import { OrderPackContext } from "contexts/order-pack/order-pack-context";
import { StoreResponse } from "model/core/store.model";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { GoodsReceiptsTypeResponse } from "model/response/pack/pack.response";
import { getGoodsReceiptsType } from "domain/actions/goods-receipts/goods-receipts.action";
import { getPackInfo, setPackInfo } from "utils/LocalStorageUtils";
import { PackModel, PackModelDefaultValue } from "model/pack/pack.model";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { getListOrderApi } from "service/order/order.service";
import { handleFetchApiError, haveAccess, isFetchApiSuccessful } from "utils/AppUtils";
import { RootReducerType } from "model/reducers/RootReducerType";
import { FulFillmentStatus } from "utils/Constants";
import { getFulfillmentActive } from "utils/OrderUtils";
import { StyledComponent } from "./style";
import PackInfoComponent from "./component/pack-info.component";
import PackListComponent from "./component/pack-list.component";
import AddReportHandOverComponent from "./component/add-report-hand-over.component";
import PackConfirmModal from "./modal/pack-comfirm.modal";
import "./style.scss";
import { FulfillmentDto } from "model/handover/fulfillment.dto";

const PackageSupport: React.FC = () => {
  const dispatch = useDispatch();
  const userReducer = useSelector((state: RootReducerType) => state.userReducer);
  const [singlePack, setSinglePack] = useState<PackModel | null>();

  const [isFulFillmentPack, setIsFulFillmentPack] = useState<string[]>([]);

  const [listThirdPartyLogistics, setListThirdPartyLogistics] = useState<DeliveryServiceResponse[]>(
    [],
  );
  const [listStores, setListStores] = useState<Array<StoreResponse>>([]);
  const [listStoresDataCanAccess, setListStoresDataCanAccess] = useState<Array<StoreResponse>>([]);
  // const [listGoodsReceiptsType, setListGoodsReceiptsType] = useState<
  //   Array<GoodsReceiptsTypeResponse>
  // >([]);
  const [listChannels, setListChannels] = useState<Array<ChannelsResponse>>([]);
  const [isVisiblePackedOrderModal, setIsVisiblePackedOrderModal] = useState<boolean>(false);
  const [orderPushFalseDelivery, setOrderPushFalseDelivery] = useState<FulfillmentDto[]>([]);

  const packSupportContextData = {
    listThirdPartyLogistics,
    setListThirdPartyLogistics,
    listStores,
    setListStores,
    // listGoodsReceiptsType,
    // setListGoodsReceiptsType,
    listChannels,
    setListChannels,
    singlePack,
    setSinglePack,
    isFulFillmentPack,
    setIsFulFillmentPack,
    listStoresDataCanAccess,
    setListStoresDataCanAccess,
  };

  useEffect(() => {
    dispatch(
      DeliveryServicesGetList((response: Array<DeliveryServiceResponse>) => {
        setListThirdPartyLogistics(response);
      }),
    );

    //dispatch(getGoodsReceiptsType(setListGoodsReceiptsType));

    dispatch(
      getChannels(2, (data: ChannelsResponse[]) => {
        setListChannels(data);
      }),
    );

    dispatch(StoreGetListAction(setListStores));
  }, [dispatch]);

  useEffect(() => {
    let newData: Array<StoreResponse> = [];
    if (listStores && listStores.length !== 0) {
      if (userReducer.account?.account_stores && userReducer.account?.account_stores.length > 0) {
        newData = listStores.filter((store) =>
          haveAccess(store.id, userReducer.account ? userReducer.account.account_stores : []),
        );
        setListStoresDataCanAccess(newData);
      } else {
        // trường hợp sửa đơn hàng mà account ko có quyền với cửa hàng đã chọn, thì vẫn hiển thị
        setListStoresDataCanAccess(listStores);
      }
    }
  }, [listStores, userReducer.account]);

  useEffect(() => {
    let packInfo: string | null = getPackInfo();
    if (packInfo) {
      let packInfoConvertJson: any = JSON.parse(packInfo);
      let packData: PackModel = {
        ...new PackModelDefaultValue(),
        ...packInfoConvertJson,
      };
      if (packData.fulfillments && packData.fulfillments.length !== 0) {
        dispatch(showLoading());
        let queryCode = packData.fulfillments.map((p) => p.order_code);
        let queryParam: any = { code: queryCode };
        getListOrderApi(queryParam)
          .then((response) => {
            if (isFetchApiSuccessful(response)) {
              let fulfillments = packData.fulfillments.filter((p) =>
                response.data.items.some(
                  (p1) =>
                    p1.code === p.order_code &&
                    getFulfillmentActive(p1.fulfillments)?.status === FulFillmentStatus.PACKED,
                  //&&(!p1.goods_receipts || (p1.goods_receipts && p1.goods_receipts?.length <= 0)),
                ),
              );
              setSinglePack({
                ...packData,
                store_id: packData.store_id,
                fulfillments: fulfillments,
              });
              setPackInfo({
                ...packData,
                store_id: packData.store_id,
                fulfillments: fulfillments,
              });
            } else handleFetchApiError(response, "Danh sách fulfillment", dispatch);
          })
          .catch((err) => {
            console.log(err);
          })
          .finally(() => {
            dispatch(hideLoading());
          });
      } else {
        setSinglePack(packData);
      }
    }
  }, [dispatch]);

  return (
    <OrderPackContext.Provider value={packSupportContextData}>
      <ContentContainer
        title="Hỗ trợ đóng gói"
        breadcrumb={[
          {
            name: "Đơn hàng online",
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
              <PackInfoComponent />
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24}>
              <PackListComponent />
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24}>
              <AddReportHandOverComponent
                setOrderPushFalseDelivery={setOrderPushFalseDelivery}
                setIsVisiblePackedOrderModal={setIsVisiblePackedOrderModal}
              />
            </Col>
          </Row>
        </StyledComponent>
        <PackConfirmModal
          isVisible={isVisiblePackedOrderModal}
          setIsVisible={setIsVisiblePackedOrderModal}
          orderPushFalseDelivery={orderPushFalseDelivery}
          setOrderPushFalseDelivery={setOrderPushFalseDelivery}
        />
      </ContentContainer>
    </OrderPackContext.Provider>
  );
};

export default PackageSupport;
