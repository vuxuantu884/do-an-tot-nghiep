/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { CloseSquareOutlined, ShrinkOutlined } from "@ant-design/icons";
import { Button, Card, Row, Space, Tag } from "antd";
import exportIcon from "assets/icon/export.svg";
import importIcon from "assets/icon/import.svg";
import ContentContainer from "component/container/content.container";
import OrderFilter from "component/filter/order.filter";
import ButtonCreate from "component/header/ButtonCreate";
import { MenuAction } from "component/table/ActionButton";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { HttpStatus } from "config/http-status.config";
import UrlConfig from "config/url.config";
import { searchAccountPublicAction, ShipperGetListAction } from "domain/actions/account/account.action";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { DeliveryServicesGetList, PaymentMethodGetList, updateOrderPartial } from "domain/actions/order/order.action";
import { getListSourceRequest } from "domain/actions/product/source.action";
import { actionFetchListOrderProcessingStatus } from "domain/actions/settings/order-processing-status.action";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { StoreResponse } from "model/core/store.model";
import {
  DuplicateOrderDetailQuery,
  OrderItemModel,
  OrderModel,
  OrderPaymentModel,
  OrderSearchQuery
} from "model/order/order.model";
import {
  OrderProcessingStatusModel,
  OrderProcessingStatusResponseModel
} from "model/response/order-processing-status.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { SourceResponse } from "model/response/order/source.response";
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import NumberFormat from "react-number-format";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory, useParams } from "react-router-dom";
import { exportFile, getFile } from "service/other/export.service";
import { generateQuery } from "utils/AppUtils";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import { DeliveryServiceResponse, OrderResponse } from "model/response/order/order.response";
import { nameQuantityWidth, StyledComponent } from "../index.screen.styles";
import ExportModal from "../modal/export.modal";
import "../scss/index.screen.scss";
import AuthWrapper from "component/authorization/AuthWrapper";
import { ODERS_PERMISSIONS } from "config/permissions/order.permission";
import { OrderStatus, ShipmentMethod } from "utils/Constants";
import EditNote from "../component/edit-note";
import MergeOrderModel from "./modal/merge-order.modal";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import { getDetailOrderDuplicateAction, putOrderDuplicateCancel, putOrderDuplicateMerge } from "domain/actions/order/order-duplicate.action";
import { RootReducerType } from "model/reducers/RootReducerType";

const ACTION_ID = {
  mergeOrder: 1,
  cancelOrder: 2
}

type DuplicateParam = {
  customer_phone: string;
  store_id: string;
};

const actions: Array<MenuAction> = [
  {
    id: ACTION_ID.mergeOrder,
    name: "Gộp đơn đã chọn",
    icon: <ShrinkOutlined />
  },
  {
    id: ACTION_ID.cancelOrder,
    name: "Huỷ đơn đã chọn",
    icon: <CloseSquareOutlined />
  },
];

const initQuery: DuplicateOrderDetailQuery = {
  page: 1,
  limit: 30,
  is_online: null,
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
  shipper_codes: [],
  note: null,
  customer_note: null,
  tags: [],
  reference_code: null,
  full_address: "",
  ward: "",
  district: "",
  city: "",
  country: "",
  services: [],
  coordinator_codes: [],
  marketer_codes: [],
  channel_codes:[],
  created_by: [],
};

const OrderDuplicate: React.FC = () => {
  const { customer_phone, store_id } = useParams<DuplicateParam>();
  const query = useQuery();
  const history = useHistory();
  const dispatch = useDispatch();

  //useState
  const [tableLoading, setTableLoading] = useState(true);
  const [isFilter, setIsFilter] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  useState<Array<AccountResponse>>();
  let dataQuery: OrderSearchQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  let [params, setPrams] = useState<OrderSearchQuery>(dataQuery);
  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);
  const [listStore, setStore] = useState<Array<StoreResponse>>();
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [listOrderProcessingStatus, setListOrderProcessingStatus] = useState<
    OrderProcessingStatusModel[]
  >([]);

  const [listPaymentMethod, setListPaymentMethod] = useState<
    Array<PaymentMethodResponse>
  >([]);
  let delivery_services: Array<DeliveryServiceResponse> = []
  const [deliveryServices, setDeliveryServices] = useState<Array<DeliveryServiceResponse>>([]);
  useEffect(() => {
    dispatch(
      DeliveryServicesGetList((response: Array<DeliveryServiceResponse>) => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        delivery_services = response
        setDeliveryServices(response)
      })
    );
  }, [dispatch]);

  const [data, setData] = useState<PageResponse<OrderModel>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const [listShippers, setListShippers] = useState<Array<AccountResponse>>([]);
  const [listExportFile, setListExportFile] = useState<Array<string>>([]);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [statusExport, setStatusExport] = useState<number>(1);
  const [columns, setColumn] = useState<Array<ICustomTableColumType<OrderModel>>>([
    {
      title: "ID đơn hàng",
      dataIndex: "code",
      render: (value: string, i: OrderModel) => {
        return (
          <React.Fragment>
            <Link target="_blank" to={`${UrlConfig.ORDER}/${i.id}`}>
              {value}
            </Link>
            <div style={{ fontSize: "0.86em" }}>
              {moment(i.created_date).format("hh:mm DD-MM-YYYY")}
            </div>
            <div style={{ fontSize: "0.86em", marginTop: 5 }}>
              <Link target="_blank" to={`${UrlConfig.STORE}/${i?.store_id}`}>
                {i.store}
              </Link>
            </div>
          </React.Fragment>
        )
      },
      visible: true,
      fixed: "left",
      className: "custom-shadow-td",
      width: 120,
    },
    {
      title: "Khách hàng",
      render: (record: OrderResponse) =>
        <div className="customer custom-td">
          <div className="name p-b-3" style={{ color: "#2A2A86" }}>
            <Link
              target="_blank"
              to={`${UrlConfig.CUSTOMER}/${record.customer_id}`}
              className="primary"
            >
              {record.customer}
            </Link>{" "}
          </div>
          {/* <div className="p-b-3">{record.shipping_address.phone}</div>
					<div className="p-b-3">{record.shipping_address.full_address}</div> */}
          {record.customer_phone_number && (
            <div className="p-b-3">
              <a href={`tel:${record.customer_phone_number}`}>
                {record.customer_phone_number}
              </a>
            </div>
          )}
          <div className="p-b-3">{renderCustomerAddress(record)}</div>
        </div>,
      key: "customer",
      visible: true,
      width: 150,
    },
    {
      title: (
        <div className="productNameQuantityHeader">
          <span className="productNameWidth">Sản phẩm</span>
          <span className="quantity quantityWidth">
            <span>SL</span>
          </span>
        </div>
      ),
      dataIndex: "items",
      key: "items.name11",
      className: "productNameQuantity",
      render: (items: Array<OrderItemModel>) => {
        return (
          <div className="items">
            {items.map((item, i) => {
              return (
                <div className="item custom-td">
                  <div className="product productNameWidth 2">
                    <div className="inner">
                      <Link
                        target="_blank"
                        to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.variant_id}`}
                      >
                        {item.sku}
                      </Link>
                      <br />
                      <div className="productNameText" title={item.variant}>
                        {item.variant}
                      </div>
                    </div>

                  </div>
                  <div className="quantity quantityWidth">
                    <span>{item.quantity}</span>
                  </div>
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
      title: "Địa chỉ giao hàng",
      render: (record: OrderResponse) =>
        <div className="customer custom-td">
          <div className="p-b-3">{renderCustomerShippingAddress(record)}</div>
        </div>
      ,
      key: "shipping_address",
      visible: true,
      width: 190,
    },
    {
      title: "HT Vận chuyển",
      key: "shipment.type",
      render: (record: any) => {
        if (record.fulfillments.length) {
          const newFulfillments = record.fulfillments?.sort((a: any, b: any) => b.id - a.id)
          if (newFulfillments[0].shipment) {
            switch (newFulfillments[0].shipment.delivery_service_provider_type) {
              case ShipmentMethod.EXTERNAL_SERVICE:
                const service_code = newFulfillments[0].shipment.delivery_service_provider_code;
                const service = delivery_services.find((service) => service.external_service_code === service_code);
                return (
                  service && (
                    <img
                      src={service.logo ? service.logo : ""}
                      alt=""
                      style={{ maxWidth: "100%" }}
                    />
                  )
                );
              case ShipmentMethod.EMPLOYEE:
              case ShipmentMethod.EXTERNAL_SHIPPER:
                return `Đối tác - ${newFulfillments[0].shipment.shipper_code} - ${newFulfillments[0].shipment.shipper_name}`;
              case ShipmentMethod.PICK_AT_STORE:
                return `Nhận tại - ${record.store}`;
              default: return ""
            }
          }
        }
        return ""
      },
      visible: true,
      width: 140,
      align: "center",
    },
    {
      title: "Trạng thái xử lý đơn",
      dataIndex: "sub_status",
      key: "sub_status",
      render: (sub_status) => (
        <div
          style={{
            // background: "rgba(42, 42, 134, 0.1)",
            borderRadius: "100px",
            color: "#2A2A86",
            padding: sub_status ? "5px 10px" : "0",
          }}
        >
          {sub_status}
        </div>
      ),
      visible: true,
      align: "center",
      width: 160,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      className: "orderStatus",
      render: (value: string, record: OrderModel) => {
        if (!record || !status_order) {
          return null;
        }
        const status = status_order.find((status) => status.value === record.status);
        return (
          <div className="orderStatus">
            <div className="inner">
              <div className="single">
                <div>
                  <strong>Xử lý đơn: </strong>
                </div>
                {record.sub_status ? record.sub_status : "-"}
              </div>
              <div className="single">
                <div>
                  <strong>Đơn hàng: </strong>
                </div>
                {record.status === OrderStatus.DRAFT && (
                  <div
                    style={{
                      color: "#737373",
                    }}>
                    {status?.name}
                  </div>
                )}

                {record.status === OrderStatus.FINALIZED && (
                  <div
                    style={{
                      color: "#FCAF17",
                    }}>
                    {status?.name}
                  </div>
                )}

                {record.status === OrderStatus.FINISHED && (
                  <div
                    style={{
                      color: "#27AE60",
                    }}>
                    {status?.name}
                  </div>
                )}

                {record.status === OrderStatus.CANCELLED && (
                  <div
                    style={{
                      color: "#E24343",
                    }}>
                    {status?.name}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      },
      visible: true,
      align: "left",
      width: 120,
    },
    {
      title: "Nguồn đơn hàng",
      dataIndex: "source",
      key: "source",
      visible: true,
      align: "center",
      width: "130px"
    },
    {
      title: "Đóng gói",
      key: "packed_status",
      render: (record: any) => {
        let processIcon = "icon-blank";
        if (record.fulfillments.length) {
          const newFulfillments = record.fulfillments?.sort((a: any, b: any) => b.id - a.id)
          processIcon = newFulfillments[0].packed_on ? "icon-full" : "icon-blank";
        }
        return (
          <div className="text-center">
            <div className={processIcon} />
          </div>
        );
      },
      visible: true,
      align: "center",
      width: 100,
    },
    {
      title: "Xuất kho",
      key: "received_status",
      render: (record: any) => {
        let processIcon = "icon-blank";
        if (record.fulfillments.length) {
          const newFulfillments = record.fulfillments?.sort((a: any, b: any) => b.id - a.id)
          processIcon = newFulfillments[0].export_on ? "icon-full" : "icon-blank";
        }
        return (
          <div className="text-center">
            <div className={processIcon} />
          </div>
        );
      },
      visible: true,
      align: "center",
      width: 100,
    },
    {
      title: "Trả hàng",
      dataIndex: "return_status",
      key: "return_status",
      render: (value: string) => {
        let processIcon = null;
        switch (value) {
          case "unreturned":
            processIcon = "icon-blank";
            break;
          case "returned":
            processIcon = "icon-full";
            break;
          default:
            processIcon = "icon-blank";
            break;
        }
        return (
          <div className="text-center">
            <div className={processIcon} />
          </div>
        );
      },
      visible: true,
      align: "center",
      width: 100,
    },
    {
      title: "Thanh toán",
      dataIndex: "payment_status",
      key: "payment_status",
      render: (value: string) => {
        let processIcon = null;
        switch (value) {
          case "partial_paid":
            processIcon = "icon-partial";
            break;
          case "paid":
            processIcon = "icon-full";
            break;
          default:
            processIcon = "icon-blank";
            break;
        }
        return (
          <div className="text-center">
            <div className={processIcon} />
          </div>
        );
      },
      visible: true,
      align: "center",
      width: 110,
    },
    {
      title: "HT thanh toán",
      dataIndex: "payments",
      key: "payments.type",
      render: (payments: Array<OrderPaymentModel>) =>
        payments.map((payment) => {
          return <Tag>{payment.payment_method}</Tag>;
        }),
      visible: true,
      align: "center",
      width: 160
    },
    {
      title: "Khách phải trả",
      // dataIndex: "",
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
      key: "customer.amount_money",
      visible: true,
      align: "right",
      width: 150,
    },
    {
      title: "Khách đã trả",
      dataIndex: "payments",
      key: "customer.paid",
      render: (payments: Array<OrderPaymentModel>) => {
        let total = 0;
        payments.forEach((payment) => {
          total += payment.amount;
        });
        return (
          <NumberFormat
            value={total}
            className="foo"
            displayType={"text"}
            thousandSeparator={true}
          />
        );
      },
      visible: true,
      align: "center",
    },
    {
      title: "Còn phải trả",
      key: "customer.pay",
      render: (order: OrderModel) => {
        let paid = 0;
        order.payments.forEach((payment) => {
          paid += payment.amount;
        });
        const missingPaid = order.total_line_amount_after_line_discount
          ? order.total_line_amount_after_line_discount - paid
          : 0;
        return (
          <NumberFormat
            value={missingPaid > 0 ? missingPaid : 0}
            className="foo"
            displayType={"text"}
            thousandSeparator={true}
          />
        );
      },
      visible: true,
      align: "center",
    },
    {
      title: "Ghi chú nội bộ",
      render: (record) =>
        <EditNote note={record.note} onOk={(newNote) => {
          editNote(newNote, 'note', record.id)
        }} />
      ,
      key: "note",
      visible: true,
      align: "center",
    },
    {
      title: "Ghi chú của khách",
      render: (record) =>
        <EditNote note={record.customer_note} onOk={(newNote) => {
          editNote(newNote, 'customer_note', record.id)
        }} />
      ,
      key: "customer_note",
      visible: true,
      align: "center",
    },
    {
      title: "Tag",
      dataIndex: "tags",
      key: "tags",
      visible: true,
      align: "center",
    },
    {
      title: "Mã tham chiếu",
      dataIndex: "reference_code",
      key: "reference_code",
      visible: true,
      render: (value, items, index) => {
        return (
          <Link
            target="_blank"
            to={`${UrlConfig.ORDER}/${items.reference_code}`}
          >
            {value}
          </Link>
        )
      }
    },
    {
      title: "Tổng SL",
      dataIndex: "items",
      key: "item.quantity.total",
      render: (items) => {
        return items.reduce((total: number, item: any) => total + item.quantity, 0);
      },
      visible: true,
      align: "center",
      width: 100,
    },
    {
      title: "Nhân viên bán hàng",
      render: (record) => <div>{`${record.assignee_code} - ${record.assignee}`}</div>,
      key: "assignee",
      visible: true,
      align: "center",
      width: 200
    },
    {
      title: "Nhân viên tạo đơn",
      render: (record) => <div>{`${record.account_code} - ${record.account}`}</div>,
      key: "account",
      visible: true,
      align: "center",
      width: 200
    },
    {
      title: "Ngày hoàn tất đơn",
      dataIndex: "completed_on",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value, DATE_FORMAT.fullDate)}</div>,
      key: "completed_on",
      visible: true,
    },
    {
      title: "Ngày huỷ đơn",
      dataIndex: "cancelled_on",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value, DATE_FORMAT.fullDate)}</div>,
      key: "cancelled_on",
      visible: true,
    },
  ]);
  const [selectedRowCodes, setSelectedRowCodes] = useState([]);
  const [mergeOrderVisible, setMergeOrderVisible] = useState(false);
  const [cancelOrderComfirm, setCancelOrderComfirm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderModel[]>([]);
  const [rowKey, setRowKey] = useState<Array<any>>([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  let data1: any = {
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  }

  const bootstrapReducer = useSelector(
    (state: RootReducerType) => state.bootstrapReducer
  );

  const status_order = bootstrapReducer.data?.order_main_status.filter(single => single.value !== "splitted");

  //arrow function
  const renderCustomerAddress = (orderDetail: OrderResponse) => {
    let html = orderDetail.customer_address;
    if (orderDetail.customer_ward) {
      html += ` - ${orderDetail.customer_ward}`;
    }
    if (orderDetail.customer_district) {
      html += ` - ${orderDetail.customer_district}`;
    }
    if (orderDetail.customer_city) {
      html += ` - ${orderDetail.customer_city}`;
    }
    return html;
  };

  const renderCustomerShippingAddress = (orderDetail: OrderResponse) => {
    let html = orderDetail.shipping_address?.full_address;
    if (orderDetail?.shipping_address?.ward) {
      html += ` - ${orderDetail.shipping_address?.ward}`;
    }
    if (orderDetail?.shipping_address?.district) {
      html += ` - ${orderDetail.shipping_address.district}`;
    }
    if (orderDetail?.shipping_address?.city) {
      html += ` - ${orderDetail.shipping_address.city}`;
    }
    return html;
  };

  // const onSelectedChange = useCallback((selectedRow) => {
  //   setSelectedOrder(selectedRow);
  // }, []);

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setPrams({ ...params });
      history.replace(`${UrlConfig.ORDERS_DUPLICATE}/order/${customer_phone}/${store_id}?${queryParam}`);
    },
    [history, params, customer_phone, store_id]
  );

  const onFilter = useCallback(
    (values) => {
      let newPrams = { ...params, ...values, page: 1 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      setIsFilter(true)
      history.push(`${UrlConfig.ORDERS_DUPLICATE}/order/${customer_phone}/${store_id}?${queryParam}`);
    },
    [history, params, customer_phone, store_id]
  );

  const onClearFilter = useCallback(() => {
    setPrams(initQuery);
    let queryParam = generateQuery(initQuery);
    history.push(`${UrlConfig.ORDERS_DUPLICATE}/order/${customer_phone}/${store_id}?${queryParam}`);
  }, [history, customer_phone, store_id]);

  const onMenuClick = useCallback(
    (index: number) => {
      if (selectedOrder.length <= 0) {
        showWarning("Yêu cầu chọn đơn hàng");
        return;
      }
      switch (index) {
        case 1:
          if (selectedOrder.length <= 1)
            showError("Bạn phải chọn từ 2 đơn hàng trở lên")
          else
            setMergeOrderVisible(true);
          break;
        case 2:
          setCancelOrderComfirm(true);
          break;
        default:
          break;
      }
    },
    [selectedOrder]
  );

  const onExport = useCallback(
    (optionExport, typeExport) => {
      let newParams: any = { ...params };
      // let hiddenFields = [];
      switch (optionExport) {
        case 1:
          newParams = {};
          break;
        case 2:
          break;
        case 3:
          newParams.code = selectedRowCodes;
          break;
        case 4:
          delete newParams.page;
          delete newParams.limit;
          break;
        default:
          break;
      }

      // switch (optionExport) {
      //   case 1:
      //     hiddenFields
      //     break
      //   case 2:
      //     delete newParams.page
      //     delete newParams.limit
      //     break
      //   default: break
      // }
      // }

      let queryParams = generateQuery(newParams);
      exportFile({
        conditions: queryParams,
        type: "EXPORT_ORDER",
      })
        .then((response) => {
          if (response.code === HttpStatus.SUCCESS) {
            setStatusExport(2);
            showSuccess("Đã gửi yêu cầu xuất file");
            setListExportFile([...listExportFile, response.data.code]);
          }
        })
        .catch((error) => {
          setStatusExport(4);
          console.log("orders export file error", error);
          showError("Có lỗi xảy ra, vui lòng thử lại sau");
        });
    },
    [params, selectedRowCodes, listExportFile]
  );
  const checkExportFile = useCallback(() => {
    let getFilePromises = listExportFile.map((code) => {
      return getFile(code);
    });
    Promise.all(getFilePromises).then((responses) => {
      responses.forEach((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          setExportProgress(Math.round(response.data.num_of_record / response.data.total * 10000) / 100);
          if (response.data && response.data.status === "FINISH") {
            setStatusExport(3);
            setExportProgress(100);
            const fileCode = response.data.code;
            const newListExportFile = listExportFile.filter((item) => {
              return item !== fileCode;
            });
            window.open(response.data.url);
            setListExportFile(newListExportFile);
          }
          if (response.data && response.data.status === "ERROR") {
            setStatusExport(4)
          }
        } else {
          setStatusExport(4)
        }
      });
    });
  }, [listExportFile]);

  useEffect(() => {
    if (listExportFile.length === 0 || statusExport === 3 || statusExport === 4) return;
    checkExportFile();

    const getFileInterval = setInterval(checkExportFile, 3000);
    return () => clearInterval(getFileInterval);
  }, [listExportFile, checkExportFile, statusExport]);

  const setSearchResult = useCallback((result: PageResponse<OrderModel> | false) => {
    setTableLoading(false);
    setIsFilter(false);
    if (!!result) {
      setData(result);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      data1 = result
    }
  }, []);

  const handleSearchResult = useCallback(() => {
    setTableLoading(true);

    let _issued_on_min = moment(new Date().setHours(-24)).format('DD-MM-YYYY');
    let _issued_on_max = moment(new Date()).format('DD-MM-YYYY');

    dispatch(getDetailOrderDuplicateAction({
      ...params
      , store_ids: params.store_ids && params.store_ids.length > 0 ? params.store_ids : [store_id]
      , search_term: params.search_term && params.search_term.length > 0 ? params.search_term : customer_phone
      , issued_on_min: params.issued_on_min && params.issued_on_min.length > 0 ? params.issued_on_min : _issued_on_min
      , issued_on_max: params.issued_on_max && params.issued_on_max.length > 0 ? params.issued_on_max : _issued_on_max
    }, setSearchResult));
  }, [dispatch, params, store_id, customer_phone, setSearchResult]);

  const columnFinal = useMemo(
    () => columns.filter((item) => item.visible === true),
    [columns]
  );

  const setDataAccounts = (data: PageResponse<AccountResponse> | false) => {
    if (!data) {
      return;
    }
    setAccounts(data.items);
  };

  const onSuccessEditNote = useCallback((newNote, noteType, orderID) => {
    const indexOrder = data1.items.findIndex((item: any) => item.id === orderID)
    const newItems = [...data1.items]
    if (indexOrder > -1) {
      const newItem: any = newItems[indexOrder]
      newItems.splice(indexOrder, 1, {
        ...newItem,
        note: noteType === 'note' ? newNote : newItem.note,
        customer_note: noteType === 'customer_note' ? newNote : newItem.customer_note
      })
    }
    const newData = {
      ...data1,
      items: newItems
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    data1 = newData
    setData(newData)
  }, [data1]);

  const editNote = useCallback((newNote, noteType, orderID) => {
    let params: any = {}
    if (noteType === 'note') {
      params.note = newNote
    }
    if (noteType === 'customer_note') {
      params.customer_note = newNote
    }
    dispatch(updateOrderPartial(params, orderID, () => onSuccessEditNote(newNote, noteType, orderID)))
  }, [dispatch, onSuccessEditNote]);

  const hanldMergeOrderOk = useCallback((value: number) => {
    if (value === null) {
      showWarning("Yêu cầu chọn đơn hàng gốc");
      return;
    }
    if (selectedOrder.length <= 0) {
      showWarning("Yêu cầu chọn đơn hàng cần gộp");
      return;
    }
    setTableLoading(true);
    setMergeOrderVisible(false);
    let selectedOrderIds = selectedOrder.map((row: any) => row.id);
    dispatch(putOrderDuplicateMerge(value, selectedOrderIds, (data: OrderModel) => {
      if (data) {
        setSelectedOrder([]);
        setRowKey([]);
        handleSearchResult();
        showSuccess("Gộp đơn thành công");
      }
      else {
        setTableLoading(false);
      }
    }));
  }, [dispatch, selectedOrder, handleSearchResult])

  const hanldMergeOrderCancel = () => {
    setMergeOrderVisible(false);
  }

  //hủy đơn trùng
  const hanldCancelOrderOk = useCallback(() => {
    if (selectedOrder.length <= 0) return;

    let selectedOrderIds = selectedOrder.map((row: any) => row.id);

    setTableLoading(true);
    setCancelOrderComfirm(false)

    dispatch(putOrderDuplicateCancel(selectedOrderIds, (data: any) => {
      if (data === true) {
        setSelectedOrder([]);
        setRowKey([]);
        handleSearchResult();
        selectedOrder.forEach((e) => {
          showSuccess(`Đã hủy đơn hàng: ${e.code}`);
        });
      }
      else {
        setTableLoading(false);
      }
    }));

  }, [dispatch, selectedOrder, handleSearchResult]);

  ///arrow function

  //useEffect

  useEffect(() => {
    handleSearchResult();
  }, [handleSearchResult]);

  useEffect(() => {

  }, [data]);

  useEffect(() => {
    dispatch(searchAccountPublicAction({ limit: 30 }, setDataAccounts));
    dispatch(getListSourceRequest(setListSource));
    dispatch(StoreGetListAction(setStore));
    dispatch(PaymentMethodGetList(
      (data) => {
        data.push({
          name: 'COD',
          code: 'cod',
          id: 0
        })
        setListPaymentMethod(data)
      }
    ));
    dispatch(
      actionFetchListOrderProcessingStatus(
        {},
        (data: OrderProcessingStatusResponseModel) => {
          setListOrderProcessingStatus(data.items);
        }
      )
    );
  }, [dispatch]);

  useEffect(() => {
    dispatch(ShipperGetListAction(setListShippers));
  }, [dispatch]);

  useEffect(() => {
    if (selectedOrder) {
      const selectedRowCodes: any = selectedOrder.map((row: any) => row.code);
      setSelectedRowCodes(selectedRowCodes);
    }
  }, [selectedOrder])

  ///useEffect

  return (
    <StyledComponent>
      <ContentContainer
        title="Danh sách đơn trùng"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: UrlConfig.HOME,
          },
          {
            name: "Đơn trùng",
            path: UrlConfig.ORDERS_DUPLICATE
          },
          {
            name: "Danh sách đơn trùng",
          },
        ]}
        extra={
          <Row>
            <Space>
              <AuthWrapper acceptPermissions={[ODERS_PERMISSIONS.IMPORT]} passThrough>
                {(isPassed: boolean) =>
                  <Button
                    type="default"
                    className="light"
                    size="large"
                    icon={<img src={importIcon} style={{ marginRight: 8 }} alt="" />}
                    onClick={() => { }}
                    disabled={!isPassed}
                  >
                    Nhập file
                  </Button>}
              </AuthWrapper>
              <AuthWrapper acceptPermissions={[ODERS_PERMISSIONS.EXPORT]} passThrough>
                {(isPassed: boolean) =>
                  <Button
                    type="default"
                    className="light"
                    size="large"
                    icon={<img src={exportIcon} style={{ marginRight: 8 }} alt="" />}
                    // onClick={onExport}
                    onClick={() => {
                      setShowExportModal(true);
                    }}
                    disabled={!isPassed}
                  >
                    Xuất file
                  </Button>}
              </AuthWrapper>
              <AuthWrapper acceptPermissions={[ODERS_PERMISSIONS.CREATE]} passThrough>
                {(isPassed: boolean) =>
                  <ButtonCreate path={`${UrlConfig.ORDER}/create`} disabled={!isPassed} />}
              </AuthWrapper>

            </Space>
          </Row>
        }
      >
        <Card className="duplicate-card">
          <OrderFilter
            onMenuClick={onMenuClick}
            actions={actions}
            onFilter={onFilter}
            isLoading={isFilter}
            params={params}
            listSource={listSource}
            listStore={listStore}
            accounts={accounts}
            deliveryService={deliveryServices}
            listPaymentMethod={listPaymentMethod}
            subStatus={listOrderProcessingStatus}
            onShowColumnSetting={() => setShowSettingColumn(true)}
            onClearFilter={() => onClearFilter()}
            listShippers={listShippers}
            initSubStatus={listOrderProcessingStatus}
          />
          <CustomTable
            isRowSelection
            isLoading={tableLoading}
            showColumnSetting={true}
            scroll={{ x: 4400 * columnFinal.length / (columns.length ? columns.length : 1) }}
            sticky={{ offsetScroll: 10, offsetHeader: 55 }}
            pagination={{
              pageSize: data.metadata.limit,
              total: data.metadata.total,
              current: data.metadata.page,
              showSizeChanger: true,
              onChange: onPageChange,
              onShowSizeChange: onPageChange,
            }}
            onSelectedChange={(selectedRows) => setSelectedOrder(selectedRows)}
            onChangeRowKey={(rowKey) => setRowKey(rowKey)}
            selectedRowKey={rowKey}
            onShowColumnSetting={() => setShowSettingColumn(true)}
            dataSource={data.items}
            columns={columnFinal}
            rowKey={(item: OrderModel) => item.id}
            className="order-list"
          />
        </Card>

        <ModalSettingColumn
          visible={showSettingColumn}
          onCancel={() => setShowSettingColumn(false)}
          onOk={(data) => {
            setShowSettingColumn(false);
            setColumn(data);
          }}
          data={columns}
        />
        {showExportModal && (
          <ExportModal
            visible={showExportModal}
            onCancel={() => {
              setShowExportModal(false);
              setExportProgress(0);
              setStatusExport(1);
            }}
            onOk={(optionExport, typeExport) => onExport(optionExport, typeExport)}
            type="orders"
            total={data.metadata.total}
            exportProgress={exportProgress}
            statusExport={statusExport}
            selected={selectedRowCodes.length ? true : false}
          />
        )}

        <MergeOrderModel
          visibleModel={mergeOrderVisible}
          hanldOk={hanldMergeOrderOk}
          hanldCancel={hanldMergeOrderCancel}
          selectedOrder={selectedOrder}
          deliveryServices={deliveryServices}
        />

        <ModalDeleteConfirm
          onCancel={() => setCancelOrderComfirm(false)}
          onOk={hanldCancelOrderOk}
          title="Bạn chắc chắn hủy đơn hàng?"
          subTitle={
            <React.Fragment>
              {selectedOrder.map((value: OrderModel, index: number) => (
                <p style={{ lineHeight: "18px" }}>Thông tin của đơn hàng ID{" "}
                  <Link target="_blank" to={`${UrlConfig.ORDER}/${value.id}`}>
                    {value.code}
                  </Link>{" "}
                  sẽ được huỷ</p>
              ))}
            </React.Fragment>
          }
          visible={cancelOrderComfirm}
        />
      </ContentContainer>
    </StyledComponent>
  );
};

export default OrderDuplicate;
