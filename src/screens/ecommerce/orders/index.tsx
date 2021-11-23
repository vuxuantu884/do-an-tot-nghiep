import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import NumberFormat from "react-number-format";
import { Button, Card, Menu } from "antd";
import { DownloadOutlined, PrinterOutlined } from "@ant-design/icons";

import UrlConfig from "config/url.config";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
// todo thai: handle later
// import { showSuccess } from "utils/ToastUtils";
import { getQueryParams, useQuery } from "utils/useQuery";

import { StoreResponse } from "model/core/store.model";
import {
  OrderItemModel,
  OrderModel,
  EcommerceOrderSearchQuery,
} from "model/order/order.model";
import { AccountResponse } from "model/account/account.model";

import { DeliveryServicesGetList, getListOrderAction, PaymentMethodGetList } from "domain/actions/order/order.action";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { actionFetchListOrderProcessingStatus } from "domain/actions/settings/order-processing-status.action";

import { PageResponse } from "model/base/base-metadata.response";
import {
  OrderProcessingStatusModel,
  OrderProcessingStatusResponseModel,
} from "model/response/order-processing-status.response";

import ContentContainer from "component/container/content.container";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import GetOrderDataModal from "screens/ecommerce/orders/component/GetOrderDataModal";
import ResultGetOrderDataModal from "screens/ecommerce/orders/component/ResultGetOrderDataModal";
import EcommerceOrderFilter from "screens/ecommerce/orders/component/EcommerceOrderFilter";

// todo thai: handle later
// import UpdateConnectionModal from "./component/UpdateConnectionModal";
import AuthWrapper from "component/authorization/AuthWrapper";
import NoPermission from "screens/no-permission.screen";
import { EcommerceOrderPermission } from "config/permissions/ecommerce.permission";

import CircleEmptyIcon from "assets/icon/circle_empty.svg";
import CircleHalfFullIcon from "assets/icon/circle_half_full.svg";
import CircleFullIcon from "assets/icon/circle_full.svg";
// // todo thai: handle later
// import ConnectIcon from "assets/icon/connect.svg";
// import SuccessIcon from "assets/icon/success.svg";
// import ErrorIcon from "assets/icon/error.svg";

import {
  nameQuantityWidth,
  StyledComponent,
} from "screens/ecommerce/orders/orderStyles";
import useAuthorization from "hook/useAuthorization";
import { SourceResponse } from "model/response/order/source.response";
import { getListSourceRequest } from "domain/actions/product/source.action";
import { DeliveryServiceResponse } from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import {getToken} from "utils/LocalStorageUtils";
import axios from "axios";
import {AppConfig} from "config/app.config";
import {FulFillmentStatus} from "utils/Constants";
import {showError, showSuccess, showWarning} from "utils/ToastUtils";


const initQuery: EcommerceOrderSearchQuery = {
  page: 1,
  limit: 30,
  sort_type: null,
  sort_column: null,
  code: null,
  customer_ids: [],
  store_ids: [],
  source_ids: [],
  variant_ids: [],
  issued_on_min: null,
  issued_on_max: null,
  issued_on_predefined: null,
  finalized_on_min: null,
  finalized_on_max: null,
  finalized_on_predefined: null,
  ship_on_min: null,
  ship_on_max: null,
  ship_on_predefined: null,
  ecommerce_shop_ids: [],
  channel_id: undefined,
  expected_receive_on_min: null,
  expected_receive_on_max: null,
  expected_receive_predefined: null,
  completed_on_min: null,
  completed_on_max: null,
  completed_on_predefined: null,
  cancelled_on_min: null,
  cancelled_on_max: null,
  cancelled_on_predefined: null,
  order_status: [],
  sub_status_id: [],
  fulfillment_status: [],
  payment_status: [],
  return_status: [],
  account_codes: [],
  assignee_codes: [],
  price_min: undefined,
  price_max: undefined,
  payment_method_ids: [],
  delivery_types: [],
  delivery_provider_ids: [],
  shipper_ids: [],
  note: null,
  customer_note: null,
  tags: [],
  reference_code: null,
};

// todo thai need update
const ECOMMERCE_SOURCE = {
  shopee: 16,
  lazada: 19,
  sendo: 20,
  tiki: 100
}
const ALL_ECOMMERCE_SOURCE_ID = [
  ECOMMERCE_SOURCE.shopee,
  ECOMMERCE_SOURCE.lazada,
  ECOMMERCE_SOURCE.sendo,
  ECOMMERCE_SOURCE.tiki
];

const ordersViewPermission = [EcommerceOrderPermission.orders_view];
const ordersDownloadPermission = [EcommerceOrderPermission.orders_download];


const EcommerceOrders: React.FC = () => {
  const query = useQuery();
  const dispatch = useDispatch();

  const [allowOrdersView] = useAuthorization({
    acceptPermissions: ordersViewPermission,
    not: false,
  });

  const [allowOrdersDownload] = useAuthorization({
    acceptPermissions: ordersDownloadPermission,
    not: false,
  });

  const [isShowGetOrderModal, setIsShowGetOrderModal] = useState(false);
  // todo thai: handle later
  // const [isShowUpdateConnectionModal, setIsShowUpdateConnectionModal] =
  //   useState(false);
  const [isShowResultGetOrderModal, setIsShowResultGetOrderModal] = useState(false);
  const [downloadOrderData, setDownloadOrderData] = useState<any>({
    total: 0,
    create_total: 0,
    update_total: 0,
    error_total: 0,
  });

  // todo thai: handle later
  // const [updateConnectionData, setUpdateConnectionData] = useState<Array<any>>(
  //   []
  // );

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  useState<Array<AccountResponse>>();
  let dataQuery: EcommerceOrderSearchQuery = {
    ...initQuery,
    channel_id: 3,
    ...getQueryParams(query),
  };
  let [params, setPrams] = useState<EcommerceOrderSearchQuery>(dataQuery);
  const [listStore, setStore] = useState<Array<StoreResponse>>();
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [listOrderProcessingStatus, setListOrderProcessingStatus] = useState<
    OrderProcessingStatusModel[]
  >([]);

  const [data, setData] = useState<PageResponse<any>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);
  const [listPaymentMethod, setListPaymentMethod] = useState<Array<PaymentMethodResponse>>([]);
  
  const [deliveryServices, setDeliveryServices] = useState<Array<DeliveryServiceResponse>>([]);
  useEffect(() => {
    dispatch(
      DeliveryServicesGetList((response: Array<DeliveryServiceResponse>) => {
        setDeliveryServices(response)
      })
    );
  }, [dispatch]);

  const status_order = [
    { name: "Nháp", value: "draft" },
    { name: "Đóng gói", value: "packed" },
    { name: "Xuất kho", value: "shipping" },
    { name: "Đã xác nhận", value: "finalized" },
    { name: "Hoàn thành", value: "completed" },
    { name: "Kết thúc", value: "finished" },
    { name: "Đã huỷ", value: "cancelled" },
    { name: "Đã hết hạn", value: "expired" },
  ];
  

  const convertProgressStatus = (value: any) => {
    switch (value) {
      case "partial_paid":
        return CircleHalfFullIcon;
      case "paid":
        return CircleFullIcon;
      default:
        return CircleEmptyIcon;
    }
  };

  const convertDateTimeFormat = (dateTimeData: any) => {
    const formatDateTime = "DD/MM/YYYY HH:mm";
    return ConvertUtcToLocalDate(dateTimeData, formatDateTime);
  };

  // // todo thai: handle later
  // const handleUpdateProductConnection = (data: any) => {
  //   setUpdateConnectionData(data.items);
  //   setIsShowUpdateConnectionModal(true);

  //   showSuccess("Click mở modal cập nhật ghép nối nè");
  // };

  // const cancelUpdateConnectionModal = () => {
  //   setIsShowUpdateConnectionModal(false);
  // };

  // const updateProductConnection = () => {
  //   setIsShowUpdateConnectionModal(false);

    // showSuccess("Sẽ gọi api cập nhật ghép nối tại đây :)");
    //thai todo: call API
  // };

  const [columns, setColumn] = useState<
    Array<ICustomTableColumType<OrderModel>>
  >([
    {
      title: "ID đơn hàng",
      key: "order_id",
      visible: true,
      fixed: "left",
      className: "custom-shadow-td",
      width: "4.5%",
      render: (data: any, i: OrderModel) => (
        <div>
          <Link to={`${UrlConfig.ORDER}/${i.id}`}>{data.code}</Link>
          <div>({data.reference_code})</div>
          <div>{data.ecommerce_shop_name}</div>
        </div>
      ),
    },
    {
      title: "Khách hàng",
      key: "customer",
      visible: true,
      width: "5%",
      render: (record) =>
        record.shipping_address ? (
          <div className="customer custom-td">
            <div className="name p-b-3" style={{ color: "#2A2A86" }}>
              <Link
                target="_blank"
                to={`${UrlConfig.CUSTOMER}/${record.customer_id}`}
                style={{ fontSize: "16px" }}
              >
                {record.shipping_address.name}
              </Link>{" "}
            </div>
            <div className="p-b-3">{record.shipping_address.phone}</div>
            <div className="p-b-3">{record.shipping_address.full_address}</div>
          </div>
        ) : (
          <div className="customer custom-td">
            <div className="name p-b-3" style={{ color: "#2A2A86" }}>
              {record.customer}
            </div>
            <div className="p-b-3">{record.customer_phone_number}</div>
          </div>
        ),
    },
    {
      title: (
        <div className="product-and-quantity-header">
          <span className="product-name">Sản phẩm</span>
          <span className="quantity">Số lượng</span>
        </div>
      ),
      dataIndex: "items",
      key: "items.name11",
      className: "product-and-quantity",
      render: (items: Array<OrderItemModel>) => {
        return (
          <div className="items">
            {items.map((item, i) => {
              return (
                <div className="item-custom-td" key={i}>
                  <div className="product">
                    <Link
                      target="_blank"
                      to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.variant_id}`}
                    >
                      {item.variant}
                    </Link>
                  </div>
                  <div className="quantity">{item.quantity}</div>
                </div>
              );
            })}
          </div>
        );
      },
      visible: true,
      align: "left",
      width: nameQuantityWidth,
    },
    {
      title: "Khách phải trả",
      key: "customer_amount_money",
      visible: true,
      align: "right",
      width: "3.5%",
      render: (record: any) => (
        <>
          <span>
            <NumberFormat
              value={record.total_line_amount_after_line_discount}
              className="foo"
              displayType={"text"}
              thousandSeparator={true}
            />
          </span>
          <br />
          <span style={{ color: "#EF5B5B" }}>
            {" "}
            -
            <NumberFormat
              value={record.total_discount}
              className="foo"
              displayType={"text"}
              thousandSeparator={true}
            />
          </span>
        </>
      ),
    },
    {
      title: "Trạng thái xử lý",
      dataIndex: "sub_status",
      key: "sub_status",
      visible: true,
      width: "5%",
      align: "center",
      render: (sub_status: string) => {
        return (
          <div
            style={{
              background: "rgba(42, 42, 134, 0.1)",
              borderRadius: "100px",
              color: "#2A2A86",
              width: "fit-content",
              padding: "5px 10px",
              margin: "0 auto",
            }}
          >
            {sub_status}
          </div>
        );
      },
    },
    {
      title: "Trạng thái đơn",
      dataIndex: "status",
      key: "order_status",
      visible: true,
      align: "center",
      width: "4%",
      render: (status_value: string) => {
        const status = status_order.find(
          (status) => status.value === status_value
        );
        return (
          <div
            style={{
              background: "rgba(42, 42, 134, 0.1)",
              borderRadius: "100px",
              color: "#2A2A86",
              width: "fit-content",
              padding: "5px 10px",
              margin: "0 auto",
            }}
          >
            {status?.name}
          </div>
        );
      },
    },
    {
      title: "Đóng gói",
      dataIndex: "packed_status",
      key: "packed_status",
      visible: true,
      align: "center",
      width: 120,
      render: (value: string) => {
        const processIcon = convertProgressStatus(value);
        return <img src={processIcon} alt="" />;
      },
    },
    {
      title: "Xuất kho",
      dataIndex: "received_status",
      key: "received_status",
      visible: true,
      align: "center",
      width: 120,
      render: (value: string) => {
        const processIcon = convertProgressStatus(value);
        return <img src={processIcon} alt="" />;
      },
    },
    {
      title: "Thanh toán",
      dataIndex: "payment_status",
      key: "payment_status",
      visible: true,
      align: "center",
      width: 120,
      render: (value: string) => {
        const processIcon = convertProgressStatus(value);
        return <img src={processIcon} alt="" />;
      },
    },
    {
      title: "Trả hàng",
      dataIndex: "return_status",
      key: "return_status",
      visible: true,
      align: "center",
      width: 120,
      render: (value: string) => {
        const processIcon = convertProgressStatus(value);
        return <img src={processIcon} alt="" />;
      },
    },
    {
      title: "Tổng SL sản phẩm",
      dataIndex: "items",
      key: "item_quantity_total",
      visible: true,
      align: "center",
      render: (items) => {
        return items.reduce(
          (total: number, item: any) => total + item.quantity,
          0
        );
      },
    },
    {
      title: "Địa chỉ",
      dataIndex: "shipping_address",
      key: "area",
      visible: true,
      width: "300px",
      render: (shipping_address: any) => {
        const ward = shipping_address?.ward ? shipping_address.ward + "," : "";
        const district = shipping_address?.district
          ? shipping_address.district + ","
          : "";
        const city = shipping_address?.city ? shipping_address.city + "," : "";
        return (
          shipping_address && (
            <div className="name">{`${ward} ${district} ${city}`}</div>
          )
        );
      },
    },
    {
      title: "Gian hàng",
      dataIndex: "store",
      key: "store",
      visible: true,
      width: "200px",
    },
    {
      title: "Nguồn đơn hàng",
      dataIndex: "source",
      key: "order_source",
      visible: true,
      width: "200px",
    },
    {
      title: "Nhân viên bán hàng",
      key: "assignee",
      visible: true,
      align: "center",
      width: "200px",
      render: (data) => <div>{`${data.assignee_code} - ${data.assignee}`}</div>,
    },
    {
      title: "Ngày nhận đơn",
      dataIndex: "created_date",
      key: "created_date",
      visible: true,
      align: "center",
      width: "200px",
      render: (created_date) => (
        <div>{convertDateTimeFormat(created_date)}</div>
      ),
    },
    {
      title: "Ngày hoàn tất đơn",
      dataIndex: "completed_on",
      key: "completed_on",
      visible: true,
      align: "center",
      width: "200px",
      render: (completed_on: string) => <div>{ConvertUtcToLocalDate(completed_on)}</div>,
    },
    {
      title: "Ngày huỷ đơn",
      dataIndex: "cancelled_on",
      key: "cancelled_on",
      visible: true,
      align: "center",
      width: "200px",
      render: (cancelled_on) => (
        <div>{convertDateTimeFormat(cancelled_on)}</div>
      ),
    },
    {
      title: "Ghi chú của khách",
      dataIndex: "customer_note",
      key: "customer_note",
      visible: true,
    },
    // //todo thai: handle later
    // {
    //   title: (
    //     <Tooltip
    //       overlay="Tình trạng ghép nối của sản phẩm"
    //       placement="topRight"
    //       color="blue"
    //     >
    //       <img src={ConnectIcon} alt="" />
    //     </Tooltip>
    //   ),
    //   key: "connect_status",
    //   visible: true,
    //   width: 50,
    //   align: "center",
    //   render: (data) => {
    //     if (data.connect_status) {
    //       return <img src={SuccessIcon} alt="" />;
    //     } else {
    //       return (
    //         <img
    //           src={ErrorIcon}
    //           alt=""
    //           onClick={() => handleUpdateProductConnection(data)}
    //           style={{ cursor: "pointer" }}
    //         />
    //       );
    //     }
    //   },
    // },
  ]);

  const onSelectedChange = useCallback((selectedRow) => {
    const selectedRowKeys = selectedRow.map((row: any) => row?.id);
    setSelectedRowKeys(selectedRowKeys);
  }, []);

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      setPrams({ ...params });
      window.scrollTo(0, 0);
    },
    [params]
  );

  const onFilter = useCallback(
    (values) => {
      let newPrams = { ...params, ...values, page: 1 };
      setPrams(newPrams);
    },
    [params]
  );

  const onClearFilter = useCallback(() => {
    setPrams(initQuery);
  }, []);

  // handle action button
  const token = getToken();
  const handlePrintDeliveryNote = useCallback(() => {
    if (selectedRowKeys?.length > 0) {
      setTableLoading(true);
      let order_list: any = [];
      selectedRowKeys.forEach(idSelected => {
        const orderMatched = data?.items.find(i => i.id === idSelected)
        if(orderMatched){
          const orderRequest = {
            "order_sn": orderMatched.reference_code,
            "tracking_number": orderMatched.fulfillments.find((item: any) => item.status !== FulFillmentStatus.CANCELLED)?.shipment?.tracking_code,
            "delivery_name": orderMatched.fulfillments.find((item: any) => item.status !== FulFillmentStatus.CANCELLED)?.shipment?.delivery_service_provider_name,
            "ecommerce_id": 1,
            "shop_id": orderMatched.ecommerce_shop_id
          }
          order_list.push(orderRequest)
        }
      })

      let url = `${AppConfig.baseUrl}${AppConfig.ECOMMERCE_SERVICE}/orders/print-forms`;
      axios.post(url,{order_list} ,
        {
          responseType: 'arraybuffer',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/pdf',
            'Authorization': `Bearer ${token}`
          }
        })
        .then((response) => {
          showSuccess("Tạo phiếu giao hàng thành công")
          let blob = new Blob([response.data], { type: 'application/pdf' })
          let fileURL = URL.createObjectURL(blob);
          window.open(fileURL)
          setTableLoading(false)
        })
        .catch(() => {
          setTableLoading(false)
          showError("Không thể tạo phiếu giao hàng")
        });
    }
  }, [selectedRowKeys, token, data?.items]);

  const handlePrintStockExport = useCallback(() => {
    if (selectedRowKeys?.length > 0) {
      showWarning("Sẽ làm chức năng này sau bạn nhé")
    }
  }, [selectedRowKeys]);

  const actionList = (
    <Menu>
      <Menu.Item key="1" disabled={selectedRowKeys?.length < 1}>
        <div>
          <PrinterOutlined style={{ marginRight: 5 }} />
          <span onClick={handlePrintDeliveryNote}>In phiếu giao hàng</span>
        </div>
      </Menu.Item>
  
      <Menu.Item key="2" disabled={selectedRowKeys?.length < 1}>
        <div>
          <PrinterOutlined style={{ marginRight: 5 }} />
          <span onClick={handlePrintStockExport}>In phiếu xuất kho</span>
        </div>
      </Menu.Item>
    </Menu>
  );
  // end handle action button

  const setSearchResult = useCallback(
    (result: PageResponse<OrderModel> | false) => {
      setTableLoading(false);
      if (!!result) {
        setData(result);
      }
    },
    []
  );

  const columnFinal = useMemo(
    () => columns.filter((item) => item.visible === true),
    [columns]
  );

  const setDataAccounts = useCallback(
    (data: PageResponse<AccountResponse> | false) => {
      if (!data) {
        return;
      }
      setAccounts(data.items);
    },
    []
  );

  // handle get order
  const openGetOrderModal = () => {
    setIsShowGetOrderModal(true);
  };

  const cancelGetOrderModal = () => {
    setIsShowGetOrderModal(false);
  };

  const updateOrderList = (data: any) => {
    setDownloadOrderData(data);
    setIsShowGetOrderModal(false);
    setIsShowResultGetOrderModal(true);
  };

  const getEcommerceOrderList = useCallback(() => {
    const requestParams = { ...params };
    if (!requestParams.source_ids?.length) {
      requestParams.source_ids = ALL_ECOMMERCE_SOURCE_ID;
    }
    
    setTableLoading(true);
    dispatch(getListOrderAction(requestParams, (result) => {
      setTableLoading(false);
      setSearchResult(result);
    }));
  }, [dispatch, params, setSearchResult]);

  const reloadPage = () => {
    if (allowOrdersView) {
      getEcommerceOrderList();
    }
  };

  const closeResultGetOrderModal = () => {
    setIsShowResultGetOrderModal(false);
    reloadPage();
  };

  useEffect(() => {
    if (allowOrdersView) {
      getEcommerceOrderList();
    }
  }, [allowOrdersView, getEcommerceOrderList]);

  useEffect(() => {
    if (allowOrdersView) {
      dispatch(AccountSearchAction({}, setDataAccounts));
      dispatch(getListSourceRequest(setListSource));
      dispatch(PaymentMethodGetList(setListPaymentMethod));
      dispatch(StoreGetListAction(setStore));
      dispatch(
        actionFetchListOrderProcessingStatus(
          {},
          (data: OrderProcessingStatusResponseModel) => {
            setListOrderProcessingStatus(data.items);
          }
        )
      );
    }
  }, [allowOrdersView, dispatch, setDataAccounts]);

  return (
    <StyledComponent>
      <ContentContainer
        title="Danh sách đơn hàng"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: UrlConfig.HOME,
          },
          {
            name: "Sàn TMĐT",
            path: `${UrlConfig.ECOMMERCE}`,
          },
          {
            name: "Danh sách đơn hàng",
          },
        ]}
        extra={
          <>
            {allowOrdersDownload &&
              <Button
                disabled={tableLoading}
                onClick={openGetOrderModal}
                className="ant-btn-outline ant-btn-primary"
                size="large"
                icon={<DownloadOutlined />}
              >
                Tải đơn hàng về
              </Button>
            }
          </>
        }
      >
        <AuthWrapper acceptPermissions={ordersViewPermission} passThrough>
          {(allowed: boolean) => (allowed ?
            <Card>
              <EcommerceOrderFilter
                actions={actionList}
                onFilter={onFilter}
                isLoading={tableLoading}
                params={params}
                listSource={listSource}
                listStore={listStore}
                accounts={accounts}
                deliveryService={deliveryServices}
                listPaymentMethod={listPaymentMethod}
                subStatus={listOrderProcessingStatus}
                onShowColumnSetting={() => setShowSettingColumn(true)}
                onClearFilter={() => onClearFilter()}
              />
    
              <CustomTable
                isRowSelection
                bordered
                isLoading={tableLoading}
                showColumnSetting={true}
                scroll={{ x: 3630 }}
                sticky={{ offsetScroll: 10, offsetHeader: 55 }}
                pagination={
                  tableLoading
                    ? false
                    : {
                        pageSize: data.metadata.limit,
                        total: data.metadata.total,
                        current: data.metadata.page,
                        showSizeChanger: true,
                        onChange: onPageChange,
                        onShowSizeChange: onPageChange,
                      }
                }
                onSelectedChange={(selectedRows) => onSelectedChange(selectedRows)}
                dataSource={data.items}
                columns={columnFinal}
                rowKey={(item: OrderModel) => item.id}
                className="ecommerce-order-list"
              />
            </Card>
            : <NoPermission />)}
        </AuthWrapper>

        {isShowGetOrderModal && (
          <GetOrderDataModal
            visible={isShowGetOrderModal}
            onCancel={cancelGetOrderModal}
            onOk={updateOrderList}
          />
        )}

        {isShowResultGetOrderModal && (
          <ResultGetOrderDataModal
            visible={isShowResultGetOrderModal}
            onCancel={closeResultGetOrderModal}
            onOk={closeResultGetOrderModal}
            downloadOrderData={downloadOrderData}
          />
        )}

        {/* // todo thai: handle later
        {isShowUpdateConnectionModal && (
          <UpdateConnectionModal
            visible={isShowUpdateConnectionModal}
            onCancel={cancelUpdateConnectionModal}
            onOk={updateProductConnection}
            data={updateConnectionData}
          />
        )} */}

        {showSettingColumn && (
          <ModalSettingColumn
            visible={showSettingColumn}
            isSetDefaultColumn={true}
            onCancel={() => setShowSettingColumn(false)}
            onOk={(data) => {
              setShowSettingColumn(false);
              setColumn(data);
            }}
            data={columns}
          />
        )}
      </ContentContainer>
    </StyledComponent>
  );
};

export default EcommerceOrders;
