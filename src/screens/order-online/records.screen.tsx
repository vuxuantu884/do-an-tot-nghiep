import React from "react";
import { Card, Row, Space } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { getChannels } from "domain/actions/order/order.action";
import { useEffect, useState } from "react";
import { ChannelsResponse, DeliveryServiceResponse } from "model/response/order/order.response";
import { useDispatch } from "react-redux";
import { OrderPackContext } from "contexts/order-pack/order-pack-context";
import { StoreResponse } from "model/core/store.model";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { GoodsReceiptsTypeResponse } from "model/response/pack/pack.response";
import { getGoodsReceiptsType } from "domain/actions/goods-receipts/goods-receipts.action";
import PackReportHandOver from "./pack/info/pack-report-hand-over";
import { useQuery } from "utils/useQuery";
import { StyledComponent } from "./pack/styles";
import useAuthorization from "hook/useAuthorization";
import { ORDER_PERMISSIONS } from "config/permissions/order.permission";
import ButtonCreate from "component/header/ButtonCreate";
import { PackModel } from "model/pack/pack.model";
import "./pack/styles.scss";
import ButtonWarningHandover from "./pack/component/button-warning-handover";

const PackSupportScreen: React.FC = () => {
  const dispatch = useDispatch();
  const query = useQuery();
  //useState

  const [allowCreateGoodsReceipt] = useAuthorization({
    acceptPermissions: [ORDER_PERMISSIONS.CREATE_GOODS_RECEIPT],
    not: false,
  });

  const [listThirdPartyLogistics, setListThirdPartyLogistics] = useState<DeliveryServiceResponse[]>(
    [],
  );
  const [listStores, setListStores] = useState<Array<StoreResponse>>([]);
  const [listGoodsReceiptsType, setListGoodsReceiptsType] = useState<
    Array<GoodsReceiptsTypeResponse>
  >([]);
  const [listChannels, setListChannels] = useState<Array<ChannelsResponse>>([]);

  const [singlePack, setSinglePack] = useState<PackModel>();
  const [isFulFillmentPack, setIsFulFillmentPack] = useState<string[]>([]);

  const packSupportContextData = {
    listThirdPartyLogistics,
    setListThirdPartyLogistics,
    listStores,
    setListStores,
    listGoodsReceiptsType,
    setListGoodsReceiptsType,
    listChannels,
    setListChannels,
    setIsFulFillmentPack,
    isFulFillmentPack,
    setSinglePack,
    singlePack,
  };

  useEffect(() => {
    // dispatch(
    //   DeliveryServicesGetList((response: Array<DeliveryServiceResponse>) => {
    //     setListThirdPartyLogistics(response)
    //   })
    // );

    dispatch(getGoodsReceiptsType(setListGoodsReceiptsType));

    dispatch(
      getChannels(2, (data: ChannelsResponse[]) => {
        setListChannels(data);
      }),
    );

    dispatch(StoreGetListAction(setListStores));
  }, [dispatch]);

  return (
    <OrderPackContext.Provider value={packSupportContextData}>
      <ContentContainer
        title="Biên bản bàn giao"
        breadcrumb={[
          {
            name: "Đơn hàng online",
            path: UrlConfig.ORDER,
          },
          {
            name: "Biên bản bàn giao",
          },
        ]}
        extra={
          <Row>
            <Space size={12} style={{ marginLeft: "10px" }}>
              <ButtonWarningHandover stores={listStores} />
              <ButtonCreate
                size="small"
                path={`${UrlConfig.DELIVERY_RECORDS}/create`}
                disabled={!allowCreateGoodsReceipt}
              />
            </Space>
          </Row>
        }
      >
        <StyledComponent>
          <Card>
            <PackReportHandOver query={query} />
          </Card>
        </StyledComponent>
      </ContentContainer>
    </OrderPackContext.Provider>
  );
};

export default PackSupportScreen;
