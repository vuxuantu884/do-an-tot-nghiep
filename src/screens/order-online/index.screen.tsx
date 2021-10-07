import { Button, Card, Row, Space, Tag } from "antd";
import { MenuAction } from "component/table/ActionButton";
import { PageResponse } from "model/base/base-metadata.response";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import { useDispatch } from "react-redux";
import OrderFilter from "component/filter/order.filter";
import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import {
  OrderFulfillmentsModel,
  OrderItemModel,
  OrderModel,
  OrderPaymentModel,
  OrderSearchQuery,
} from "model/order/order.model";
import { AccountResponse } from "model/account/account.model";
import importIcon from "assets/icon/import.svg";
import exportIcon from "assets/icon/export.svg";
import UrlConfig from "config/url.config";
import ButtonCreate from "component/header/ButtonCreate";
import ContentContainer from "component/container/content.container";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { getListOrderAction } from "domain/actions/order/order.action";
import "./scss/index.screen.scss";

import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { getListSourceRequest } from "domain/actions/product/source.action";
import { SourceResponse } from "model/response/order/source.response";
import { StoreResponse } from "model/core/store.model";
import { StoreGetListAction } from "domain/actions/core/store.action";
import NumberFormat from "react-number-format";
import { actionFetchListOrderProcessingStatus } from "domain/actions/settings/order-processing-status.action";
import {
  OrderProcessingStatusModel,
  OrderProcessingStatusResponseModel,
} from "model/response/order-processing-status.response";

import { delivery_service } from "./common/delivery-service";
import { StyledComponent } from "./index.screen.styles";
import ExportModal from "./modal/export.modal";

const actions: Array<MenuAction> = [
  {
    id: 4,
    name: "In phiếu giao hàng",
  },
  {
    id: 5,
    name: "In phiếu xuất kho",
  },
];

const initQuery: OrderSearchQuery = {
  page: 1,
  limit: 30,
  sort_type: null,
  sort_column: null,
  code: null,
  customer_ids: [],
  store_ids: [],
  source_ids: [],
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
  order_sub_status: [],
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

const ListOrderScreen: React.FC = () => {
  const query = useQuery();
  const history = useHistory();
  const dispatch = useDispatch();

  const [tableLoading, setTableLoading] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const isFirstLoad = useRef(true);
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
  const [data, setData] = useState<PageResponse<OrderModel>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

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

  const [columns, setColumn] = useState<
    Array<ICustomTableColumType<OrderModel>>
  >([
    {
      title: "ID đơn hàng",
      dataIndex: "code",
      render: (value: string, i: OrderModel) => (
        <Link to={`${UrlConfig.ORDER}/${i.id}`}>{value}</Link>
      ),
      visible: true,
      fixed: "left",
      className: "custom-shadow-td",
      width: "3.2%",
    },
    {
      title: "Khách hàng",
      render: (record) =>
        record.shipping_address ? (
          <div className="customer custom-td">
            <div className="name p-b-3" style={{ color: "#2A2A86" }}>
              <Link
                target="_blank"
                to={`${UrlConfig.CUSTOMER}/${record.customer_id}`}
                className="primary"
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
      key: "customer",
      visible: true,
      width: "5%",
    },
    {
      title: "Sản phẩm",
      dataIndex: "items",
      key: "items.name11",
      render: (items: Array<OrderItemModel>) => {
        return (
          <div className="items">
            {items.map((item, i) => {
              return (
                <div className="item custom-td">
                  <div className="product">
                    <Link
                      to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.variant_id}`}
                    >
                      {item.variant}
                    </Link>
                    <p>{item.sku}</p>
                  </div>
                  <div className="quantity">
                    <span>SL: {item.quantity}</span>
                  </div>
                </div>
              );
            })}
          </div>
        );
      },
      visible: true,
      align: "left",
      width: "6.5%",
    },
    {
      title: "SL",
      dataIndex: "items",
      key: "items.name",
      render: (items: Array<OrderItemModel>) => (
        <div className="items">
          {items.map((item, i) => {
            return (
              <div className="item" style={{ width: "100%" }}>
                <div className="item-quantity">{item.quantity}</div>
              </div>
            );
          })}
        </div>
      ),
      visible: true,
      align: "center",
      width: "1.3%",
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
      width: "3.5%",
    },
    {
      title: "HTVC",
      dataIndex: "fulfillments",
      key: "shipment.type",
      render: (fulfillments: Array<OrderFulfillmentsModel>) => {
        const service_id =
          fulfillments.length && fulfillments[0].shipment
            ? fulfillments[0].shipment.delivery_service_provider_id
            : null;
        const service = delivery_service.find(
          (service) => service.id === service_id
        );
        return (
          service && (
            <img
              src={service.logo ? service.logo : ""}
              alt=""
              style={{ width: "100%" }}
            />
          )
        );
      },
      visible: true,
      width: "3.5%",
      align: "center",
    },
    {
      title: "Trạng thái đơn",
      dataIndex: "status",
      key: "status",
      render: (status_value: string) => {
        const status = status_order.find(
          (status) => status.value === status_value
        );
        return (
          <div>
            {status?.name === "Nháp" && (
              <div
                style={{
                  background: "#F5F5F5",
                  borderRadius: "100px",
                  color: "#666666",
                  padding: "3px 10px",
                }}
              >
                {status?.name}
              </div>
            )}

            {status?.name === "Đã xác nhận" && (
              <div
                style={{
                  background: "rgba(42, 42, 134, 0.1)",
                  borderRadius: "100px",
                  color: "#2A2A86",
                  padding: "5px 10px",
                }}
              >
                {status?.name}
              </div>
            )}

            {status?.name === "Kết thúc" && (
              <div
                style={{
                  background: "rgba(39, 174, 96, 0.1)",
                  borderRadius: "100px",
                  color: "#27AE60",
                  padding: "5px 10px",
                }}
              >
                {status?.name}
              </div>
            )}

            {status?.name === "Đã huỷ" && (
              <div
                style={{
                  background: "rgba(226, 67, 67, 0.1)",
                  borderRadius: "100px",
                  color: "#E24343",
                  padding: "5px 10px",
                }}
              >
                {status?.name}
              </div>
            )}
          </div>
        );
      },
      visible: true,
      align: "center",
    },
    {
      title: "Đóng gói",
      dataIndex: "packed_status",
      key: "packed_status",
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
      width: 120,
    },
    {
      title: "Xuất kho",
      dataIndex: "received_status",
      key: "received_status",
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
      width: 120,
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
      width: 120,
    },
    {
      title: "Trả hàng",
      dataIndex: "return_status",
      key: "return_status",
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
      width: 120,
    },
    {
      title: "Tổng SL sản phẩm",
      dataIndex: "items",
      key: "item.quantity.total",
      render: (items) => {
        // console.log(items.reduce((total: number, item: any) => total + item.quantity, 0));

        return items.reduce(
          (total: number, item: any) => total + item.quantity,
          0
        );
      },
      visible: true,
      align: "center",
    },
    {
      title: "Khu vực",
      dataIndex: "shipping_address",
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
      key: "area",
      visible: true,
      width: "300px",
    },
    {
      title: "Kho cửa hàng",
      dataIndex: "store",
      key: "store",
      visible: true,
    },
    {
      title: "Nguồn đơn hàng",
      dataIndex: "source",
      key: "source",
      visible: true,
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
    },
    {
      title: "Phương thức thanh toán",
      dataIndex: "payments",
      key: "payments.type",
      render: (payments: Array<OrderPaymentModel>) =>
        payments.map((payment) => {
          return <Tag>{payment.payment_method}</Tag>;
        }),
      visible: true,
    },
    {
      title: "Nhân viên bán hàng",
      render: (record) => (
        <div>{`${record.assignee} - ${record.assignee_code}`}</div>
      ),
      key: "assignee",
      visible: true,
      align: "center",
    },
    {
      title: "Nhân viên tạo đơn",
      render: (record) => (
        <div>{`${record.account} - ${record.account_code}`}</div>
      ),
      key: "account",
      visible: true,
      align: "center",
    },
    {
      title: "Ngày hoàn tất đơn",
      dataIndex: "completed_on",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
      key: "completed_on",
      visible: true,
    },
    {
      title: "Ngày huỷ đơn",
      dataIndex: "cancelled_on",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
      key: "cancelled_on",
      visible: true,
    },
    {
      title: "Ghi chú nội bộ",
      dataIndex: "note",
      key: "note",
      visible: true,
    },
    {
      title: "Ghi chú của khách",
      dataIndex: "customer_note",
      key: "customer_note",
      visible: true,
    },
    {
      title: "Tag",
      dataIndex: "tags",
      // render: (tags: Array<string>) => (
      //   tags?.map(tag => {
      //     return (
      //       <Tag>{tag}</Tag>
      //     )
      //   })
      // ),
      key: "tags",
      visible: true,
    },
    {
      title: "Mã tham chiếu",
      dataIndex: "reference_code",
      key: "reference_code",
      visible: true,
    },
  ]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const onSelectedChange = useCallback((selectedRow) => {
    const selectedRowKeys = selectedRow.map((row: any) => row.id);
    setSelectedRowKeys(selectedRowKeys);
  }, []);

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setPrams({ ...params });
      history.replace(`${UrlConfig.ORDER}?${queryParam}`);
    },
    [history, params]
  );
  const onFilter = useCallback(
    (values) => {
      // console.log("values filter 1", values);
      let newPrams = { ...params, ...values, page: 1 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      // console.log("filter start", `${UrlConfig.ORDER}?${queryParam}`);
      history.push(`${UrlConfig.ORDER}?${queryParam}`);
    },
    [history, params]
  );
  const onMenuClick = useCallback(
    (index: number) => {
      let params = {
        action: "print",
        ids: selectedRowKeys,
        "print-type": index === 4 ? "shipment" : "stock_export",
        "print-dialog": true,
      };
      const queryParam = generateQuery(params);
      console.log(queryParam);
      switch (index) {
        case 1:
          break;
        case 2:
          break;
        case 3:
          break;
        case 4:
          history.push(`${UrlConfig.ORDER}/print-preview?${queryParam}`);
          break;
        case 5:
          history.push(`${UrlConfig.ORDER}/print-preview?${queryParam}`);
          break;
        default:
          break;
      }
    },
    [history, selectedRowKeys]
  );

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

  useEffect(() => {
    if (isFirstLoad.current) {
      setTableLoading(true);
    }
    isFirstLoad.current = false;
    setTableLoading(true);
    dispatch(getListOrderAction(params, setSearchResult));
  }, [dispatch, params, setSearchResult]);

  useEffect(() => {
    dispatch(AccountSearchAction({}, setDataAccounts));
    dispatch(getListSourceRequest(setListSource));
    dispatch(StoreGetListAction(setStore));
    dispatch(
      actionFetchListOrderProcessingStatus(
        {},
        (data: OrderProcessingStatusResponseModel) => {
          setListOrderProcessingStatus(data.items);
        }
      )
    );
  }, [dispatch, setDataAccounts]);

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
            name: "Danh sách đơn hàng",
          },
        ]}
        extra={
          <Row>
            <Space>
              <Button
                type="default"
                className="light"
                size="large"
                icon={
                  <img src={importIcon} style={{ marginRight: 8 }} alt="" />
                }
                onClick={() => {}}
              >
                Nhập file
              </Button>
              <Button
                type="default"
                className="light"
                size="large"
                icon={
                  <img src={exportIcon} style={{ marginRight: 8 }} alt="" />
                }
                // onClick={onExport}
                onClick={() => {
                  console.log("export");
                  setShowExportModal(true);
                }}
              >
                Xuất file
              </Button>
              <ButtonCreate path={`${UrlConfig.ORDER}/create`} />
            </Space>
          </Row>
        }
      >
        <Card>
          <div className="padding-20">
            <OrderFilter
              onMenuClick={onMenuClick}
              actions={actions}
              onFilter={onFilter}
              isLoading={tableLoading}
              params={params}
              listSource={listSource}
              listStore={listStore}
              accounts={accounts}
              deliveryService={delivery_service}
              subStatus={listOrderProcessingStatus}
              onShowColumnSetting={() => setShowSettingColumn(true)}
            />
            <CustomTable
              isRowSelection
              isLoading={tableLoading}
              showColumnSetting={true}
              scroll={{ x: 3630 }}
              sticky={{ offsetScroll: 10, offsetHeader: 55 }}
              pagination={{
                pageSize: data.metadata.limit,
                total: data.metadata.total,
                current: data.metadata.page,
                showSizeChanger: true,
                onChange: onPageChange,
                onShowSizeChange: onPageChange,
              }}
              onSelectedChange={(selectedRows) =>
                onSelectedChange(selectedRows)
              }
              onShowColumnSetting={() => setShowSettingColumn(true)}
              dataSource={data.items}
              columns={columnFinal}
              rowKey={(item: OrderModel) => item.id}
              className="order-list"
            />
          </div>
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
        <ExportModal
          visible={showExportModal}
          onCancel={() => setShowExportModal(false)}
          onOk={() => console.log("123")}
          type="orders"
        />
      </ContentContainer>
    </StyledComponent>
  );
};

export default ListOrderScreen;
