import { Button, Modal, Space } from "antd";
import ButtonCreate from "component/header/ButtonCreate";
import CustomTable from "component/table/CustomTable";
import { ODERS_PERMISSIONS } from "config/permissions/order.permission";
import UrlConfig from "config/url.config";
import { getListOrderAction } from "domain/actions/order/order.action";
import useAuthorization from "hook/useAuthorization";
import { PageResponse } from "model/base/base-metadata.response";
import { BaseQuery } from "model/base/base.query";
import { StoreResponse } from "model/core/store.model";
import { OrderModel } from "model/order/order.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { haveAccess } from "utils/AppUtils";
import { ShipmentMethod } from "utils/Constants";
import { ORDER_SUB_STATUS } from "utils/Order.constants";
import { getFulfillmentActive } from "utils/OrderUtils";
import { StyledComponent } from "./style";

type ButtonCreateProps = {
  stores?: StoreResponse[];
  isHiddenCreate?: boolean;
};

const ButtonWarningHandover: React.FC<ButtonCreateProps> = (props: ButtonCreateProps) => {
  const { stores, isHiddenCreate = false } = props;

  const dispatch = useDispatch();

  const userReducer = useSelector((state: RootReducerType) => state.userReducer);

  const [allowCreateGoodsReceipt] = useAuthorization({
    acceptPermissions: [ODERS_PERMISSIONS.CREATE_GOODS_RECEIPT],
    not: false,
  });

  const [baseQuery, setBaseQuery] = useState<BaseQuery>({
    limit: 10,
    page: 1,
  });

  const [orderPackedNotRecord, setOrderPackedNotRecord] = useState<PageResponse<OrderModel>>({
    metadata: {
      total: 0,
      page: 1,
      limit: 10,
    },
    items: [],
  });
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const storesDataCanAccess = useMemo(() => {
    if (stores && stores.length > 0) {
      if (userReducer.account?.account_stores && userReducer.account?.account_stores.length > 0) {
        let newData: Array<StoreResponse> = [];
        newData = stores.filter((store) =>
          haveAccess(store.id, userReducer.account ? userReducer.account.account_stores : []),
        );
        return newData;
      } else {
        // trường hợp sửa đơn hàng mà account ko có quyền với cửa hàng đã chọn, thì vẫn hiển thị
        return stores;
      }
    }
  }, [stores, userReducer.account]);

  const renderTitleButtonCreate = useMemo(() => {
    const orderQuantity: number = orderPackedNotRecord?.metadata.total || 0;
    return (
      <div>
        Đã đóng gói chưa thêm vào biên bản <span style={{ color: "red" }}>({orderQuantity})</span>
      </div>
    );
  }, [orderPackedNotRecord?.metadata.total]);

  const renderTitleModel = useMemo(() => {
    const orderQuantity: number = orderPackedNotRecord?.metadata.total || 0;
    return (
      <div>
        Danh sách các đơn đã đóng gói chưa thêm vào biên bản{" "}
        <span style={{ color: "red" }}>({orderQuantity})</span>
      </div>
    );
  }, [orderPackedNotRecord?.metadata.total]);

  useEffect(() => {
    // const fromDate = moment().startOf("day").subtract(3, "days").format(dateFormat);
    // const toDate = moment().endOf("day").format(dateFormat);
    setIsLoading(true);
    let query: any = {
      limit: baseQuery.limit,
      page: baseQuery.page,
      // finalized_on_min : formatDateTimeOrderFilter(fromDate, dateFormat),
      // finalized_on_max :  formatDateTimeOrderFilter(toDate, dateFormat),
      sub_status_code: ORDER_SUB_STATUS.merchandise_packed,
      is_online: true,
      in_goods_receipt: false,
      store_ids: storesDataCanAccess?.map((p) => p.id),
    };

    dispatch(
      getListOrderAction(query, (data: PageResponse<OrderModel> | false) => {
        data && setOrderPackedNotRecord(data);
        setIsLoading(false);
      }),
    );
  }, [dispatch, storesDataCanAccess, baseQuery]);

  const onPageChange = useCallback((page, size) => {
    setBaseQuery({
      limit: size,
      page: page,
    });
  }, []);

  // const handleCreateHandoverOrderPack = useCallback(()=>{

  // },[])

  return (
    <>
      {orderPackedNotRecord?.metadata.total && orderPackedNotRecord?.metadata.total > 0 ? (
        <React.Fragment>
          <Button
            size="small"
            disabled={!allowCreateGoodsReceipt}
            onClick={() => {
              setIsVisible(true);
            }}
          >
            {renderTitleButtonCreate}
          </Button>
          <Modal
            title={renderTitleModel}
            visible={isVisible}
            onCancel={() => setIsVisible(false)}
            footer={
              <Space size={12} style={{ marginLeft: "10px" }}>
                <Button type="default" size="small" onClick={() => setIsVisible(false)}>
                  Bỏ qua
                </Button>
                {/* <Button type="primary" size="small">Thêm đơn</Button> */}
                <ButtonCreate
                  hidden={isHiddenCreate}
                  size="small"
                  path={`${UrlConfig.DELIVERY_RECORDS}/create`}
                  disabled={!allowCreateGoodsReceipt}
                />
              </Space>
            }
            width="1200px"
          >
            <StyledComponent>
              <CustomTable
                isLoading={isLoading}
                dataSource={orderPackedNotRecord.items}
                pagination={{
                  pageSize: baseQuery?.limit || 1,
                  total: orderPackedNotRecord.metadata?.total,
                  current: baseQuery?.page || 10,
                  showSizeChanger: true,
                  onChange: onPageChange,
                  onShowSizeChange: onPageChange,
                }}
                columns={[
                  {
                    title: "Mã đơn hàng",
                    dataIndex: "code",
                    align: "center",
                    key: "code",
                    render: (value: any, record: OrderModel, index: number) => (
                      <Link to={`${UrlConfig.ORDER}/${record.id}`} target="_blank">
                        {record.code}
                      </Link>
                    ),
                  },
                  {
                    title: "Mã đơn giao",
                    key: "fulfillment_code",
                    align: "center",
                    render: (value: any, record: OrderModel, index: number) => {
                      const fulfillment = getFulfillmentActive(record.fulfillments);
                      return (
                        <Link to={`${UrlConfig.ORDER}/${record.id}`} target="_blank">
                          {fulfillment?.code}
                        </Link>
                      );
                    },
                  },
                  {
                    title: "Cửa hàng",
                    key: "store_name",
                    dataIndex: "store",
                    align: "left",
                    render: (value: any, record: OrderModel, index: number) => {
                      return (
                        <React.Fragment>
                          <Link to={`${UrlConfig.STORE}/${record.store_id}`} target="_blank">
                            {record.store}
                          </Link>
                          <div>{record.store_full_address}</div>
                        </React.Fragment>
                      );
                    },
                  },
                  {
                    title: "Hãng vận chuyển",
                    key: "delivery_service",
                    align: "center",
                    render: (value: any, record: OrderModel, index: number) => {
                      const fulfillment = getFulfillmentActive(record.fulfillments);
                      //const service = delivery_services.find((service) => service.id === service_id);
                      return (
                        <React.Fragment>
                          {fulfillment?.shipment?.delivery_service_provider_type ===
                          ShipmentMethod.EMPLOYEE ? (
                            <div>Tự giao hàng</div>
                          ) : (
                            <div>{fulfillment?.shipment?.delivery_service_provider_name}</div>
                          )}
                        </React.Fragment>
                      );
                    },
                  },
                  {
                    title: "Khách hàng",
                    key: "customer_name",
                    align: "center",
                    render: (value: any, record: OrderModel, index: number) => {
                      return (
                        <React.Fragment>
                          <div>{record.customer}</div>
                          <div>{record.customer_phone_number}</div>
                        </React.Fragment>
                      );
                    },
                  },
                  {
                    title: "Trạng thái",
                    dataIndex: "sub_status",
                    key: "sub_status",
                    align: "center",
                  },
                ]}
                isRowSelection={false}
                rowKey={(item) => item.code}
                bordered
                className="pack-order-hand-over"
              />
            </StyledComponent>
          </Modal>
        </React.Fragment>
      ) : undefined}
    </>
  );
};

export default ButtonWarningHandover;
