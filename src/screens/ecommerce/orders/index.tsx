import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import NumberFormat from "react-number-format";
import { Button, Card, Menu } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

import UrlConfig from "config/url.config";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { generateQuery } from "utils/AppUtils";
// todo thai: handle later
// import { showSuccess } from "utils/ToastUtils";
import { getQueryParams, useQuery } from "utils/useQuery";

import { StoreResponse } from "model/core/store.model";
import {
  OrderFulfillmentsModel,
  OrderItemModel,
  OrderModel,
  EcommerceOrderSearchQuery,
} from "model/order/order.model";
import { AccountResponse } from "model/account/account.model";

import { getListOrderAction } from "domain/actions/order/order.action";
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
import DownloadOrderDataModal from "./component/DownloadOrderDataModal";
import ResultDownloadOrderDataModal from "./component/ResultDownloadOrderDataModal";
import EcommerceOrderFilter from "./component/EcommerceOrderFilter";
// todo thai: handle later
// import UpdateConnectionModal from "./component/UpdateConnectionModal";

import ImageGHTK from "assets/img/imageGHTK.svg";
import ImageGHN from "assets/img/imageGHN.png";
import ImageVTP from "assets/img/imageVTP.svg";
import ImageDHL from "assets/img/imageDHL.svg";
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


const initQuery: EcommerceOrderSearchQuery = {
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

const EcommerceOrderSync: React.FC = () => {
  const query = useQuery();
  const history = useHistory();
  const dispatch = useDispatch();

  const [isShowGetOrderModal, setIsShowGetOrderModal] = useState(false);
  // todo thai: handle later
  // const [isShowUpdateConnectionModal, setIsShowUpdateConnectionModal] =
  //   useState(false);
  const [isShowResultGetOrderModal, setIsShowResultGetOrderModal] =
    useState(false);
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
  const [tableLoading, setTableLoading] = useState(true);
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

  const actionList = (
    <Menu>
      <Menu.Item key="1">
        <span onClick={() => onMenuClick(1)}>In phiếu giao hàng</span>
      </Menu.Item>
  
      <Menu.Item key="2">
        <span onClick={() => onMenuClick(2)}>In phiếu xuất kho</span>
      </Menu.Item>
    </Menu>
  );
  

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
      dataIndex: "finalized_on",
      key: "completed_on",
      visible: true,
      align: "center",
      width: "200px",
      render: (finalized_on) => (
        <div>{convertDateTimeFormat(finalized_on)}</div>
      ),
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
    const selectedRowKeys = selectedRow.map((row: any) => row.id);
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

  const onMenuClick = useCallback(
    (index: number) => {
      let params = {
        action: "print",
        ids: selectedRowKeys,
        "print-type": index === 1 ? "shipment" : "stock_export",
        "print-dialog": true,
      };
      const queryParam = generateQuery(params);
      history.push(`${UrlConfig.ORDER}/print-preview?${queryParam}`);
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
  };

  const cancelGetOrderModal = () => {
    setIsShowGetOrderModal(false);
  };

  const updateOrderList = (data: any) => {
    setIsShowGetOrderModal(false);
    setIsShowResultGetOrderModal(true);

    if (data && data.total) {
      setDownloadOrderData(data);
    }
  };

  const getEcommerceOrderList = useCallback((queryRequest: any) => {
    setTableLoading(true);
    dispatch(getListOrderAction(queryRequest, (result) => {
      setTableLoading(false);
      setSearchResult(result);
    }));
  }, [dispatch, setSearchResult]);

  const reloadPage = () => {
    getEcommerceOrderList(params);
  };

  const closeResultGetOrderModal = () => {
    setIsShowResultGetOrderModal(false);
    reloadPage();
  };

  useEffect(() => {
    setTableLoading(true);
    dispatch(getListOrderAction(params, (result) => {
      setTableLoading(false);
      setSearchResult(result);
    }));
  }, [dispatch, params, setSearchResult]);

  useEffect(() => {
    dispatch(AccountSearchAction({}, setDataAccounts));
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
              disabled={tableLoading}
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
        <Card>
          <EcommerceOrderFilter
            tableLoading={tableLoading}
            onMenuClick={onMenuClick}
            actionList={actionList}
            onFilter={onFilter}
            onClearFilter={onClearFilter}
            params={params}
            initQuery={initQuery}
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

        {isShowGetOrderModal && (
          <DownloadOrderDataModal
            visible={isShowGetOrderModal}
            onCancel={cancelGetOrderModal}
            onOk={updateOrderList}
          />
        )}

        {isShowResultGetOrderModal && (
          <ResultDownloadOrderDataModal
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

export default EcommerceOrderSync;
