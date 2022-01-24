import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import NumberFormat from "react-number-format";
import { Button, Card } from "antd";
import { DownloadOutlined, PrinterOutlined } from "@ant-design/icons";

import UrlConfig from "config/url.config";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
// todo thai: handle later
// import { showSuccess } from "utils/ToastUtils";
import { getQueryParams, useQuery } from "utils/useQuery";

import { StoreResponse } from "model/core/store.model";
import {
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
import ProgressDownloadOrdersModal from "screens/ecommerce/orders/component/ProgressDownloadOrdersModal";
import EcommerceOrderFilter from "screens/ecommerce/orders/component/EcommerceOrderFilter";

// todo thai: handle later
// import UpdateConnectionModal from "./component/UpdateConnectionModal";
import AuthWrapper from "component/authorization/AuthWrapper";
import NoPermission from "screens/no-permission.screen";
import { EcommerceOrderPermission } from "config/permissions/ecommerce.permission";

import CircleEmptyIcon from "assets/icon/circle_empty.svg";
import CircleHalfFullIcon from "assets/icon/circle_half_full.svg";
import CircleFullIcon from "assets/icon/circle_full.svg";
import CustomerIcon from "assets/icon/customer-icon.svg";
import DeliveryrIcon from "assets/icon/gray-delivery.svg";
import DollarCircleIcon from "assets/icon/dollar-circle.svg";

// // todo thai: handle later
// import ConnectIcon from "assets/icon/connect.svg";
// import SuccessIcon from "assets/icon/success.svg";
// import ErrorIcon from "assets/icon/error.svg";

import { nameQuantityWidth, StyledComponent, } from "screens/ecommerce/orders/orderStyles";
import useAuthorization from "hook/useAuthorization";
import { SourceResponse } from "model/response/order/source.response";
import { getListSourceRequest } from "domain/actions/product/source.action";
import { DeliveryServiceResponse } from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { getToken } from "utils/LocalStorageUtils";
import axios from "axios";
import { AppConfig } from "config/app.config";
import { HttpStatus } from "config/http-status.config";
import { FulFillmentStatus } from "utils/Constants";
import { showError, showSuccess } from "utils/ToastUtils";
import { exitProgressDownloadEcommerceAction, getShopEcommerceList } from "domain/actions/ecommerce/ecommerce.actions";
import { generateQuery, isNullOrUndefined } from "utils/AppUtils";
import BaseResponse from "base/base.response";
import { getProgressDownloadEcommerceApi } from "service/ecommerce/ecommerce.service";

import ConflictDownloadModal from "screens/ecommerce/common/ConflictDownloadModal";
import ExitDownloadOrdersModal from "screens/ecommerce/orders/component/ExitDownloadOrdersModal";
import { StyledStatus } from "screens/ecommerce/common/commonStyle";


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
  sub_status_code: [],
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


const ordersViewPermission = [EcommerceOrderPermission.orders_read];
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

  const [allShopIds, setAllShopIds] = useState([]);

  useEffect(() => {
    dispatch(
      DeliveryServicesGetList((response: Array<DeliveryServiceResponse>) => {
        setDeliveryServices(response)
      })
    );
  }, [dispatch]);

  const status_order = [
    { name: "Nháp", value: "draft", className: "gray-status" },
    { name: "Đóng gói", value: "packed", className: "blue-status" },
    { name: "Xuất kho", value: "shipping", className: "blue-status" },
    { name: "Đã xác nhận", value: "finalized", className: "blue-status" },
    { name: "Hoàn thành", value: "completed", className: "green-status" },
    { name: "Kết thúc", value: "finished", className: "green-status" },
    { name: "Đã huỷ", value: "cancelled", className: "red-status" },
    { name: "Đã hết hạn", value: "expired", className: "red-status" },
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
      title: "ID",
      key: "order_id",
      visible: true,
      fixed: "left",
      className: "custom-shadow-td",
      width: 175,
      render: (data: any, item: OrderModel) => (
        <div>
          <Link to={`${UrlConfig.ORDER}/${item.id}`}><strong>{data.code}</strong></Link>
          <div>{ConvertUtcToLocalDate(data.created_date, "HH:mm DD/MM/YYYY")}</div>
          <div><span style={{ color: "#666666" }}>Kho: </span><span style={{ color: "#2A2A86" }}>{data.store}</span></div>
          <div><span style={{ color: "#666666" }}>GH: </span><span style={{ color: "#2A2A86" }}>{data.ecommerce_shop_name}</span></div>
          <div style={{ color: "#2A2A86" }}>({data.reference_code})</div>
        </div>
      ),
    },
    {
      title: "Khách hàng",
      key: "customer",
      visible: true,
      width: 160,
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
          <span className="quantity">SL</span>
          <span className="item-price">Giá</span>
        </div>
      ),
      dataIndex: "items",
      key: "items.name11",
      className: "product-and-quantity",
      render: (items: any) => {
        return (
          <>
            {items.map((item: any, index: number) => {
              return (
                <div className="item-custom-td" key={index}>
                  <div className="product">
                    <Link
                      target="_blank"
                      to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.variant_id}`}
                    >
                      {item.variant}
                    </Link>
                  </div>
                  <div className="quantity">{item.quantity}</div>
                  <div className="item-price">
                    <div>
                      <NumberFormat
                        value={item.price}
                        className="foo"
                        displayType={"text"}
                        thousandSeparator={true}
                      />
                    </div>
                    {item.discount_items.map((discount: any, index: number) => {
                      return (
                        <div style={{ color: "#EF5B5B" }} key={index}>
                          -
                          <NumberFormat
                            value={discount.amount || 0}
                            className="foo"
                            displayType={"text"}
                            thousandSeparator={true}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              );
            })}
          </>
        );
      },
      visible: true,
      width: nameQuantityWidth,
    },
    {
      title: "Doanh thu",
      key: "customer_amount_money",
      visible: true,
      align: "right",
      width: 105,
      render: (record: any) => (
        <>
          <div>
            <img src={DollarCircleIcon} alt="" style={{ marginRight: 3, height: 13 }} />
            <NumberFormat
              value={record.total_line_amount_after_line_discount}
              className="foo"
              displayType={"text"}
              thousandSeparator={true}
            />
          </div>
          <div style={{ color: "#EF5B5B" }}>
            -
            <NumberFormat
              value={record.total_discount}
              className="foo"
              displayType={"text"}
              thousandSeparator={true}
            />
          </div>
        </>
      ),
    },
    {
      title: "Vận chuyển",
      key: "",
      visible: true,
      width: 130,
      align: "center",
      render: (item: any) => {
        const shipment = item.fulfillments && item.fulfillments[0] && item.fulfillments[0].shipment;
        return (
          <>
            {shipment && (shipment.delivery_service_provider_type === "external_service" || shipment.delivery_service_provider_type === "shopee") &&
              <>
                <strong>{shipment?.delivery_service_provider_name}</strong>
                <div>
                  <img src={CustomerIcon} alt="" style={{ marginRight: 5, height: 15 }} />
                  <NumberFormat
                    value={shipment?.shipping_fee_informed_to_customer}
                    className="foo"
                    displayType={"text"}
                    thousandSeparator={true}
                  />
                </div>
                <div>
                  <img src={DeliveryrIcon} alt="" style={{ marginRight: 5, height: 13 }} />
                  <NumberFormat
                    value={shipment?.shipping_fee_paid_to_three_pls}
                    className="foo"
                    displayType={"text"}
                    thousandSeparator={true}
                  />
                </div>
              </>
            }
            {shipment && shipment.delivery_service_provider_type === "pick_at_store" &&
              <>
                <strong>Nhận tại cửa hàng</strong>
              </>
            }
            {shipment && shipment.delivery_service_provider_type === "Shipper" &&
              <>
                <strong>Tự giao hàng</strong>
              </>
            }
          </>
        );
      },
    },
    {
      title: "TT Xử lý",
      dataIndex: "sub_status",
      key: "sub_status",
      visible: true,
      width: 130,
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
      title: "TT Đơn hàng",
      dataIndex: "status",
      key: "order_status",
      visible: true,
      align: "center",
      width: 150,
      render: (status_value: string) => {
        const status = status_order.find(
          (status) => status.value === status_value
        );
        return (
          <StyledStatus>
            <div className={status?.className}>{status?.name}</div>
          </StyledStatus>
        );
      },
    },
    {
      title: "Ghi chú nội bộ",
      dataIndex: "note",
      key: "note",
      visible: true,
      width: 200,
    },
    {
      title: "Đóng gói",
      dataIndex: "packed_status",
      key: "packed_status",
      visible: true,
      align: "center",
      width: 100,
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
      width: 100,
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
      width: 100,
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
      width: 100,
      render: (value: string) => {
        const processIcon = convertProgressStatus(value);
        return <img src={processIcon} alt="" />;
      },
    },
    {
      title: "NV bán hàng",
      key: "assignee",
      visible: true,
      align: "center",
      width: 200,
      render: (data) => <div>{`${data.assignee_code} - ${data.assignee}`}</div>,
    },
    {
      title: "Ngày hoàn tất",
      dataIndex: "completed_on",
      key: "completed_on",
      visible: true,
      align: "center",
      width: 150,
      render: (completed_on: string) => <div>{ConvertUtcToLocalDate(completed_on, "DD/MM/YYYY")}</div>,
    },
    {
      title: "Ngày huỷ",
      dataIndex: "cancelled_on",
      key: "cancelled_on",
      visible: true,
      align: "center",
      render: (cancelled_on) => (
        <div>{ConvertUtcToLocalDate(cancelled_on, "DD/MM/YYYY")}</div>
      ),
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

  const onSelectTableRow = useCallback((selectedRow) => {
    const newSelectedRow = selectedRow.filter((row: any) => {
      return row !== undefined;
    });

    const selectedRowIds = newSelectedRow.map((row: any) => row?.id);
    setSelectedRowKeys(selectedRowIds);
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
        if (orderMatched) {
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
      axios.post(url, { order_list },
        {
          responseType: 'arraybuffer',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/pdf',
            'Authorization': `Bearer ${token}`
          }
        })
        .then((response) => {
          if(response.data){
            showSuccess("Tạo phiếu giao hàng thành công")
            let blob = new Blob([response.data], { type: 'application/pdf' })
            let fileURL = URL.createObjectURL(blob);
            window.open(fileURL)
          }else {
            showError("Không thể tạo phiếu giao hàng")
          }
          setTableLoading(false)
        })
        .catch(() => {
          setTableLoading(false)
          showError("Không thể tạo phiếu giao hàng")
        });
    }
  }, [selectedRowKeys, token, data?.items]);

  const printAction = useCallback(
    (printType: string) => {
      let params = {
        action: "print",
        ids: selectedRowKeys,
        "print-type": printType,
        "print-dialog": true,
      };
      const queryParam = generateQuery(params);
      const printPreviewUrl = `${process.env.PUBLIC_URL}${UrlConfig.ORDER}/print-preview?${queryParam}`;
      window.open(printPreviewUrl);
    },
    [selectedRowKeys]
  );

  const actions = [
    {
      id: 1,
      name: "In phiếu giao hàng Shopee",
      icon: <PrinterOutlined />,
      disabled: !selectedRowKeys?.length,
      onClick: handlePrintDeliveryNote
    },
    {
      id: 2,
      name: "In phiếu giao hàng",
      icon: <PrinterOutlined />,
      disabled: !selectedRowKeys?.length,
      onClick: () => printAction("shipment")
    },
    {
      id: 3,
      name: "In phiếu xuất kho",
      icon: <PrinterOutlined />,
      disabled: !selectedRowKeys?.length,
      onClick: () => printAction("stock_export")
    },
  ];
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

  const callbackDownloadEcommerceOrders = (data: any) => {
    if (data) {
      if (typeof data === "string") {
        setIsShowGetOrderModal(false);
        setIsVisibleConflictModal(true);
      } else {
        setIsShowGetOrderModal(false);
        setProcessId(data.process_id);
        setIsVisibleProgressModal(true);

        setIsDownloading(true);
      }
      
    }
  };

  const getEcommerceOrderList = useCallback(() => {
    const requestParams = { ...params };
    if (!requestParams.ecommerce_shop_ids.length) {
      requestParams.ecommerce_shop_ids = allShopIds;
    }

    setTableLoading(true);
    dispatch(getListOrderAction(requestParams, (result) => {
      setTableLoading(false);
      setSearchResult(result);
    }));
  }, [allShopIds, dispatch, params, setSearchResult]);

  const reloadPage = () => {
    if (allowOrdersView) {
      getEcommerceOrderList();
    }
  };
  // end

  // handle Select Ecommerce
  const setAllShopListId = useCallback((result) => {
    let shopIds: any = [];
    if (result && result.length > 0) {
      result.forEach((item: any) => {
        shopIds.push(item.id);
      });
    }

    setAllShopIds(shopIds);
  }, []);


  useEffect(() => {
    if (allowOrdersView && allShopIds.length) {
      getEcommerceOrderList();
    }
  }, [allShopIds, allowOrdersView, getEcommerceOrderList]);

  useEffect(() => {
    if (allowOrdersView) {
      dispatch(getShopEcommerceList({}, setAllShopListId));
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
  }, [allowOrdersView, dispatch, setAllShopListId, setDataAccounts]);

    
  // handle progress download orders
  const [isVisibleConflictModal, setIsVisibleConflictModal] = useState<boolean>(false);
  const [isVisibleProgressModal, setIsVisibleProgressModal] = useState<boolean>(false);
  const [isVisibleExitDownloadOrdersModal, setIsVisibleExitDownloadOrdersModal] = useState<boolean>(false);
  const [processId, setProcessId] = useState(null);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressData, setProgressData] = useState(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  

  const resetProgress = () => {
    setProcessId(null);
    setProgressPercent(0);
    setProgressData(null);
  }

  const closeConflictDownloadModal = () => {
    setIsVisibleConflictModal(false);
  }

  // handle progress download orders modal
  const onCancelProgressDownloadOrder = () => {
    setIsVisibleExitDownloadOrdersModal(true);
  }

  const onOKProgressDownloadOrder = () => {
    resetProgress();
    reloadPage();
    setIsVisibleProgressModal(false);
  }
  // end

  // handle exit download orders modal
  const onCancelExitDownloadOrdersModal = () => {
    setIsVisibleExitDownloadOrdersModal(false);
  }

  const onOkExitDownloadOrdersModal = () => {
    resetProgress();
    dispatch(
      exitProgressDownloadEcommerceAction(processId, (responseData) => {
        if (responseData) {
          showSuccess(responseData);
          setIsVisibleExitDownloadOrdersModal(false);
          onOKProgressDownloadOrder();
        }
      })
    );
  }
  // end

  const getProgress = useCallback(() => {
    let getProgressPromises: Promise<BaseResponse<any>> = getProgressDownloadEcommerceApi(processId);

    Promise.all([getProgressPromises]).then((responses) => {
      responses.forEach((response) => {
        if (response.code === HttpStatus.SUCCESS && response.data && !isNullOrUndefined(response.data.total)) {
          const processData = response.data;
          setProgressData(processData);
          const progressCount = processData.total_created + processData.total_updated + processData.total_error;
          if (progressCount >= processData.total || processData.finish) {
            setProgressPercent(100);
            setProcessId(null);
            setIsDownloading(false);
            if (!processData.api_error){
              showSuccess("Tải đơn hàng thành công!");
            }else {
              resetProgress();
              setIsVisibleProgressModal(false);
              showError(processData.api_error);
            }
          } else {
            const percent = Math.floor(progressCount / processData.total * 100);
            setProgressPercent(percent);
          }
        }
      });
    });
  }, [processId]);

  useEffect(() => {
    if (progressPercent === 100 || !processId) {
      return;
    }

    getProgress();
    
    const getFileInterval = setInterval(getProgress, 3000);
    return () => clearInterval(getFileInterval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getProgress,  ]);
// end progress download orders

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
                actions={actions}
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
                scroll={{ x: 2350 }}
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
                onSelectedChange={onSelectTableRow}
                dataSource={data.items}
                columns={columnFinal}
                rowKey={(item: OrderModel) => item.id}
                className="ecommerce-order-list"
              />
            </Card>
            : <NoPermission />)}
        </AuthWrapper>

        {isShowGetOrderModal &&
          <GetOrderDataModal
            visible={isShowGetOrderModal}
            onCancel={cancelGetOrderModal}
            onOk={callbackDownloadEcommerceOrders}
          />
        }

        {isVisibleProgressModal &&
          <ProgressDownloadOrdersModal
            visible={isVisibleProgressModal}
            onCancel={onCancelProgressDownloadOrder}
            onOk={onOKProgressDownloadOrder}
            progressData={progressData}
            progressPercent={progressPercent}
            isDownloading={isDownloading}
          />
        }

        {isVisibleConflictModal &&
          <ConflictDownloadModal
            visible={isVisibleConflictModal}
            onCancel={closeConflictDownloadModal}
            onOk={closeConflictDownloadModal}
          />
        }

        {isVisibleExitDownloadOrdersModal &&
          <ExitDownloadOrdersModal
            visible={isVisibleExitDownloadOrdersModal}
            onCancel={onCancelExitDownloadOrdersModal}
            onOk={onOkExitDownloadOrdersModal}
          />
        }

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
