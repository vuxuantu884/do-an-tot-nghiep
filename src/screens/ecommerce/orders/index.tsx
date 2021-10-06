import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import NumberFormat from "react-number-format";
import { Button, Card, Tag, Tooltip } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

import UrlConfig from "config/url.config";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { generateQuery } from "utils/AppUtils";
import { getQueryParams, useQuery } from "utils/useQuery";

import { StoreResponse } from "model/core/store.model";
import {
  OrderFulfillmentsModel,
  OrderItemModel,
  OrderModel,
  OrderPaymentModel,
  OrderSearchQuery,
} from "model/order/order.model";
import {
  AccountResponse,
} from "model/account/account.model";

import { getListOrderAction } from "domain/actions/order/order.action";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { getListSourceRequest } from "domain/actions/product/source.action";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { actionFetchListOrderProcessingStatus } from "domain/actions/settings/order-processing-status.action";

import { PageResponse } from "model/base/base-metadata.response";
import { SourceResponse } from "model/response/order/source.response";
import {
  OrderProcessingStatusModel,
  OrderProcessingStatusResponseModel,
} from "model/response/order-processing-status.response";

import ContentContainer from "component/container/content.container";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import EcommerceOrderFilter from "component/filter/ecommerce.order.filter";
import { MenuAction } from "component/table/ActionButton";
import CustomTable, { ICustomTableColumType, } from "component/table/CustomTable";
import DownloadOrderDataModal from "./component/DownloadOrderDataModal";

import ImageGHTK from "assets/img/imageGHTK.svg";
import ImageGHN from "assets/img/imageGHN.png";
import ImageVTP from "assets/img/imageVTP.svg";
import ImageDHL from "assets/img/imageDHL.svg";

import "./style.scss"
import ResultDownloadOrderDataModal from "./component/ResultDownloadOrderDataModal";

const actions: Array<MenuAction> = [
  {
    id: 1,
    name: "Xóa",
  },
  {
    id: 2,
    name: "Export",
  },
  // {
  //   id: 3,
  //   name: "Clone đơn hàng",
  // },
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

const EcommerceOrderSync: React.FC = () => {
  const query = useQuery();
  const history = useHistory();
  const dispatch = useDispatch();

  const [isShowGetOrderModal, setIsShowGetOrderModal] = useState(false);
  const [isShowResultGetOrderModal, setIsShowResultGetOrderModal] = useState(false);
  const [downloadedOrderData, setDownloadedOrderData] = useState<any>(
    {
      total: 0,
      create_total: 0,
      update_total: 0,
    }
  );
  
  const [tableLoading, setTableLoading] = useState(true);
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
  const delivery_service = [
    {
      code: "ghtk",
      id: 1,
      logo: ImageGHTK,
      name: "Giao hàng tiết kiệm",
    },
    {
      code: "ghn",
      id: 2,
      logo: ImageGHN,
      name: "Giao hàng nhanh",
    },
    {
      code: "vtp",
      id: 3,
      logo: ImageVTP,
      name: "Viettel Post",
    },
    {
      code: "dhl",
      id: 4,
      logo: ImageDHL,
      name: "DHL",
    },
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
      key: "items.name",
      render: (items: Array<OrderItemModel>) => (
        <div className="cell-items">
          {items.length > 1 && items.map((item, i) => {
            return (
              <div className="item">
                {item.variant.length > 33 &&
                  <div key={item.variant_id} className="tooltip-item">
                    <Tooltip title={item.variant} color="#1890ff">
                      <Link
                        target="_blank"
                        to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.variant_id}`}
                      >
                        {item.variant}
                      </Link>
                    </Tooltip>
                  </div>
                }

                {item.variant.length <= 31 &&
                  <div key={item.variant_id}>
                    <Link
                      target="_blank"
                      to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.variant_id}`}
                    >
                      {item.variant}
                    </Link>
                  </div>
                }
              </div>
            );
          })}

          {items.length === 1 &&
            <div className="item">
              <Link target="_blank" to={`${UrlConfig.PRODUCT}/${items[0].product_id}/variants/${items[0].variant_id}`}>
                {items[0].variant}
              </Link>
            </div>
          }
        </div>
      ),
      visible: true,
      align: "left",
      width: "6.5%",
    },
    {
      title: "Số lượng",
      dataIndex: "items",
      key: "items.name",
      render: (items: Array<OrderItemModel>) => (
        <div className="cell-items">
          {items.map((item, i) => {
            return (
              <div key={i} className="item">{item.quantity}</div>
            );
          })}
        </div>
      ),
      visible: true,
      align: "center",
      width: "2.5%",
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
      title: "Phí ship trả sàn",
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
              style={{ width: "100%"}}
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
          <div
            style={{
              background: "rgba(42, 42, 134, 0.1)",
              borderRadius: "100px",
              color: "#2A2A86",
            }}
          >
            {status?.name}
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
        return items.reduce(
          (total: number, item: any) => total + item.quantity,
          0
        );
      },
      visible: true,
      align: "center",
    },
    {
      title: "Địa chỉ",
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
      title: "Gian hàng",
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
      title: "Phương thức thanh toán",
      dataIndex: "payments",
      key: "payments.type",
      render: (payments: Array<OrderPaymentModel>) =>
        payments.map((payment) => {
          return <Tag key={payment.id}>{payment.payment_method}</Tag>;
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
      title: "Ngày nhận đơn",
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
      title: "Ghi chú của khách",
      dataIndex: "customer_note",
      key: "customer_note",
      visible: true,
    },
    {
      title: "Tình trạng ghép nối",
      dataIndex: "customer_note",
      key: "customer_note",
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
      history.replace(`${UrlConfig.ORDER}/list?${queryParam}`);
    },
    [history, params]
  );
  const onFilter = useCallback(
    (values) => {
      // console.log("values filter 1", values);
      let newPrams = { ...params, ...values, page: 1 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      // console.log("filter start", `${UrlConfig.ORDER}/list?${queryParam}`);
      history.push(`${UrlConfig.ORDER}/list?${queryParam}`);
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

  // handle get order
  const openGetOrderModal = () => {
    setIsShowGetOrderModal(true);
  }

  const cancelGetOrderModal = () => {
    setIsShowGetOrderModal(false);
  };

  const updateOrderList = (data: any) => {
    setIsShowGetOrderModal(false);
    setIsShowResultGetOrderModal(true);
    setDownloadedOrderData(data);
    console.log("updateOrderList: ",data);
    

    // thai need todo: call api
  };

  const cancelResultGetOrderModal = () => {
    setIsShowResultGetOrderModal(false);
  };

  const okResultGetOrderModal = () => {
    setIsShowResultGetOrderModal(false);
  };

  
  


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
          <Button
            onClick={openGetOrderModal}
            className="ant-btn-outline ant-btn-primary"
            size="large"
            icon={<DownloadOutlined />}
          >
            Tải đơn hàng về
          </Button>
        </>
      }
    >
      <Card style={{ padding: "0 20px 20px" }}>
        <EcommerceOrderFilter
          onMenuClick={onMenuClick}
          actions={actions}
          onFilter={onFilter}
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
          scroll={{ x: 3630, y: "50vh" }}
          pagination={{
            pageSize: data.metadata.limit,
            total: data.metadata.total,
            current: data.metadata.page,
            showSizeChanger: true,
            onChange: onPageChange,
            onShowSizeChange: onPageChange,
          }}
          onSelectedChange={(selectedRows) => onSelectedChange(selectedRows)}
          onShowColumnSetting={() => setShowSettingColumn(true)}
          dataSource={data.items}
          columns={columnFinal}
          rowKey={(item: OrderModel) => item.id}
          className="ecommerce-order-list"
        />
      </Card>

      <DownloadOrderDataModal
        visible={isShowGetOrderModal}
        onCancel={cancelGetOrderModal}
        onOk={updateOrderList}
      />

      <ResultDownloadOrderDataModal
        visible={isShowResultGetOrderModal}
        onCancel={cancelResultGetOrderModal}
        onOk={okResultGetOrderModal}
        data={downloadedOrderData}
      />


      <ModalSettingColumn
        visible={showSettingColumn}
        onCancel={() => setShowSettingColumn(false)}
        onOk={(data) => {
          setShowSettingColumn(false);
          setColumn(data);
        }}
        data={columns}
      />
    </ContentContainer>
  );
};

export default EcommerceOrderSync;
