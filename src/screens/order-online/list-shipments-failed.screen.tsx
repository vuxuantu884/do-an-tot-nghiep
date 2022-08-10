import { DeleteOutlined, ExportOutlined } from "@ant-design/icons";
import { Button, Card, Row, Space } from "antd";
import exportIcon from "assets/icon/export.svg";
import importIcon from "assets/icon/import.svg";
import AuthWrapper from "component/authorization/AuthWrapper";
import ContentContainer from "component/container/content.container";
import ShipmentFilter from "component/filter/shipment.filter";
import ButtonCreate from "component/header/ButtonCreate";
import { MenuAction } from "component/table/ActionButton";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { HttpStatus } from "config/http-status.config";
import { ODERS_PERMISSIONS } from "config/permissions/order.permission";
import UrlConfig from "config/url.config";
import { searchAccountPublicAction } from "domain/actions/account/account.action";
import { StoreGetListAction } from "domain/actions/core/store.action";
import {
  DeliveryServicesGetList,
  getListReasonRequest,
  getShipmentsAction,
} from "domain/actions/order/order.action";
import { getListSourceRequest } from "domain/actions/product/source.action";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { StoreResponse } from "model/core/store.model";
import { Item, ShipmentModel, ShipmentSearchQuery } from "model/order/shipment.model";
import { DeliveryServiceResponse } from "model/response/order/order.response";
import { SourceResponse } from "model/response/order/source.response";
import moment from "moment";
import queryString from "query-string";
import { useCallback, useEffect, useMemo, useState } from "react";
import NumberFormat from "react-number-format";
import { useDispatch } from "react-redux";
import { Link, useHistory, withRouter } from "react-router-dom";
import useFetchDeliverServices from "screens/order-online/hooks/useFetchDeliverServices";
import { exportFile, getFile } from "service/other/export.service";
import { formatCurrency, generateQuery } from "utils/AppUtils";
import { ShipmentMethod } from "utils/Constants";
import { DATE_FORMAT } from "utils/DateUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import { getQueryParams, getQueryParamsFromQueryString, useQuery } from "utils/useQuery";
import { StyledComponent } from "./list-shipments-failed.styles";
import ExportModal from "./modal/export.modal";
import "./scss/index.screen.scss";

const ACTION_ID = {
  delete: 1,
  export: 2,
  printShipment: 3,
};

const initQuery: ShipmentSearchQuery = {
  page: 1,
  limit: 30,
  sort_type: null,
  sort_column: null,
  search_term: null,
  status: null,
  stock_location_ids: [],
  delivery_provider_ids: [],
  delivery_types: [],
  shipper_codes: [],
  reference_status: [],
  packed_on_min: null,
  packed_on_max: null,
  packed_on_predefined: null,
  exported_on_min: null,
  exported_on_max: null,
  exported_on_predefined: null,
  ship_on_min: null,
  ship_on_max: null,
  ship_on_predefined: null,
  shipped_on_min: null,
  shipped_on_max: null,
  shipped_predefined: null,
  cancelled_on_min: null,
  cancelled_on_max: null,
  cancelled_on_predefined: null,
  print_status: [],
  pushing_status: ["failed"],
  store_ids: [],
  source_ids: [],
  account_codes: [],
  shipping_address: null,
  variant_ids: [],
  note: null,
  customer_note: null,
  tags: [],
  reason_ids: [],
};
const ShipmentsFailedScreen: React.FC = (props: any) => {
  const { location } = props;
  const queryParamsParsed: any = queryString.parse(location.search);
  const query = useQuery();
  const history = useHistory();
  const dispatch = useDispatch();

  const [tableLoading, setTableLoading] = useState(true);
  const [isFilter, setIsFilter] = useState(false);
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  useState<Array<AccountResponse>>();
  let dataQuery: ShipmentSearchQuery = {
    ...initQuery,
    ...getQueryParams(query),
    pushing_status: ["failed"],
  };

  let [params, setPrams] = useState<ShipmentSearchQuery>(dataQuery);
  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);
  const [listStore, setStore] = useState<Array<StoreResponse>>();
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [shippers, setShippers] = useState<Array<AccountResponse>>([]);
  const [reasons, setReasons] = useState<Array<{ id: number; name: string }>>([]);

  let delivery_services: Array<DeliveryServiceResponse> = [];
  const deliveryServices = useFetchDeliverServices();
  delivery_services = deliveryServices;

  const [data, setData] = useState<PageResponse<ShipmentModel>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const status_order = [
    { name: "Chưa giao", value: "unshipped", color: "#000000" },
    { name: "Đã lấy hàng", value: "picked", color: "#2A2A86" },
    { name: "Giao một phần", value: "partial", color: "#FCAF17" },
    { name: "Đã đóng gói", value: "packed", color: "#FCAF17" },
    { name: "Đang giao", value: "shipping", color: "#FCAF17" },
    { name: "Đã giao", value: "shipped", color: "#27AE60" },
    { name: "Đang trả lại", value: "returning", color: "#E24343" },
    { name: "Đã trả lại", value: "returned", color: "#E24343" },
    { name: "Đã hủy", value: "cancelled", color: "#E24343" },
  ];

  const [columns, setColumn] = useState<Array<ICustomTableColumType<ShipmentModel>>>([
    {
      title: "Mã đơn giao / Mã vận đơn",
      render: (record: ShipmentModel) => (
        <div className="code">
          <div className="order">
            <span>
              <span className="title">MĐG: </span>
              <Link target="_blank" to={`${UrlConfig.SHIPMENTS}/${record.code}`}>
                {record.code}
              </Link>
            </span>
          </div>
          <div className="order-time">
            {record.created_date ? moment(record.created_date).format(DATE_FORMAT.fullDate) : ""}
          </div>
          {record.shipment.tracking_code && (
            <div className="tracking">
              <span>
                <span className="title">MVĐ: </span>
                <span>{record.shipment.tracking_code}</span>
              </span>
            </div>
          )}
        </div>
      ),
      visible: true,
      fixed: "left",
      width: "200px",
    },
    {
      title: "Người nhận",
      render: (record: any) => (
        <div className="customer">
          <div className="name p-b-3" style={{ color: "#2A2A86" }}>
            <Link
              target="_blank"
              to={`${UrlConfig.CUSTOMER}/${record.customer_id}`}
              className="primary"
            >
              {record.customer}
            </Link>
          </div>
          {record.shipment && record.shipment.shipping_address && (
            <div>
              <div className="p-b-3">{record.shipment.shipping_address.phone}</div>
              <div className="p-b-3">{record.shipment.shipping_address.full_address}</div>
            </div>
          )}
        </div>
      ),
      key: "customer",
      visible: true,
      width: 200,
    },
    {
      title: (
        <div className="productNameQuantityHeader">
          <span className="productNameWidth">Sản phẩm</span>
          <span className="quantity quantityWidth">
            <span>Số lượng</span>
          </span>
        </div>
      ),
      dataIndex: "items",
      key: "items",
      className: "productNameQuantity",
      render: (items: Array<Item>) => {
        return (
          <div className="items">
            {items.map((item, i) => {
              return (
                <div className="item custom-td">
                  <div className="product productNameWidth">
                    <div>
                      <Link to={`${UrlConfig.PRODUCT}/${item.variant_id}`}>{item.variant}</Link>
                      <p>{item.sku}</p>
                    </div>
                  </div>
                  <div className="quantity quantityWidth">
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
      width: "280px",
    },
    {
      title: "Vận Chuyển",
      render: (record: any) => {
        switch (record.shipment?.delivery_service_provider_type) {
          case ShipmentMethod.EXTERNAL_SERVICE:
            const service_id = record.shipment.delivery_service_provider_id;
            const service = delivery_services.find((service) => service.id === service_id);
            return (
              <div className="shipment-details">
                {service && (
                  <img src={service.logo ? service.logo : ""} alt="" style={{ width: 135 }} />
                )}
                <p>
                  <span className="label">Tiền COD: </span>
                  <span className="value">
                    <NumberFormat
                      value={formatCurrency(record.shipment?.cod)}
                      className="foo"
                      displayType={"text"}
                    />
                  </span>
                </p>
                <p>
                  <span className="label">Tổng SL: </span>
                  <span className="value">{record.total_quantity}</span>
                </p>
                {record.shipment?.shipping_fee_paid_to_three_pls >= 0 && (
                  <p>
                    <span className="label">Phí giao: </span>
                    <span className="value">
                      <NumberFormat
                        value={formatCurrency(record.shipment?.shipping_fee_paid_to_three_pls)}
                        className="foo"
                        displayType={"text"}
                      />
                    </span>
                  </p>
                )}
              </div>
            );
          case ShipmentMethod.EMPLOYEE:
          case ShipmentMethod.EXTERNAL_SHIPPER:
            return (
              <div className="shipment-details">
                <p>
                  Đối tác - {record.shipment.shipper_code} - {record.shipment.shipper_name}
                </p>
                <p>
                  <span className="label">Tiền COD: </span>
                  <span className="value">
                    <NumberFormat
                      value={formatCurrency(record.shipment?.cod)}
                      className="foo"
                      displayType={"text"}
                    />
                  </span>
                </p>
                <p>
                  <span className="label">Tổng SL: </span>
                  <span className="value">{record.total_quantity}</span>
                </p>
                {record.shipment?.shipping_fee_paid_to_three_pls && (
                  <p>
                    <span className="label">Phí giao: </span>
                    <span className="value">
                      <NumberFormat
                        value={formatCurrency(record.shipment?.shipping_fee_paid_to_three_pls)}
                        className="foo"
                        displayType={"text"}
                      />
                    </span>
                  </p>
                )}
              </div>
            );
          case ShipmentMethod.SHOPEE:
            return (
              <div className="shipment-details">
                <p>{record.shipment.delivery_service_provider_name}</p>
                <p>
                  <span className="label">Tiền COD: </span>
                  <span className="value">
                    <NumberFormat
                      value={formatCurrency(record.shipment?.cod)}
                      className="foo"
                      displayType={"text"}
                    />
                  </span>
                </p>
                <p>
                  <span className="label">Tổng SL: </span>
                  <span className="value">{record.total_quantity}</span>
                </p>
                {record.shipment?.shipping_fee_paid_to_three_pls >= 0 && (
                  <p>
                    <span className="label">Phí giao: </span>
                    <span className="value">
                      <NumberFormat
                        value={formatCurrency(record.shipment?.shipping_fee_paid_to_three_pls)}
                        className="foo"
                        displayType={"text"}
                      />
                    </span>
                  </p>
                )}
              </div>
            );
          case ShipmentMethod.PICK_AT_STORE:
            return (
              <div className="shipment-details">
                <p>Nhận tại - {record.store}</p>
                <p>
                  <span className="label">Tiền COD: </span>
                  <span className="value">
                    <NumberFormat
                      value={formatCurrency(record.shipment?.cod)}
                      className="foo"
                      displayType={"text"}
                    />
                  </span>
                </p>
                <p>
                  <span className="label">Tổng SL: </span>
                  <span className="value">{record.total_quantity}</span>
                </p>
              </div>
            );
          default:
            return "";
        }
      },
      key: "shipment.type",
      visible: true,
      width: 200,
      // align: "center",
    },
    {
      title: "Trạng thái giao vận",
      // dataIndex: "status",
      key: "status",
      render: (record: any) => {
        const status = status_order.find((status) => status.value === record.status);
        return (
          <div>
            <p
              style={{
                // background: "rgba(42, 42, 134, 0.1)",
                // borderRadius: "100px",
                color: status?.color,
              }}
            >
              {status?.name}
            </p>
            {record.reason?.name && <p>Lý do: {record.reason?.name}</p>}
          </div>
        );
      },
      visible: true,
      align: "center",
      width: 160,
    },
    {
      title: "Nhân viên tạo đơn giao",
      render: (value: string, record: ShipmentModel) => {
        return (
          <div>
            <Link
              target="_blank"
              to={`${UrlConfig.ACCOUNTS}/${record.account_code}`}
              className="primary"
            >
              {`${record.account ? record.account : ""} - ${record.account_code}`}
            </Link>{" "}
          </div>
        );
      },
      key: "account_code",
      visible: true,
      align: "center",
    },
    {
      title: "Ghi chú",
      key: "note_order",
      visible: true,
    },
    {
      title: "Ngày giao hàng",
      visible: true,
      render: (value: string, record: ShipmentModel) => {
        if (record.shipped_on) {
          return <div>{moment(record.shipped_on).format(DATE_FORMAT.fullDate)}</div>;
        }
        return "";
      },
      key: "shipped_on",
      align: "center",
    },

    {
      title: "Ngày tạo đơn",
      render: (value: string, record: ShipmentModel) => {
        if (record.created_date) {
          return <div>{moment(record.created_date).format(DATE_FORMAT.fullDate)}</div>;
        }
        return "";
      },
      key: "created_date",
      visible: true,
    },
    {
      title: "Ngày hoàn tất đơn",
      render: (value: string, record: ShipmentModel) => {
        if (record.finished_order_on) {
          return <div>{moment(record.finished_order_on).format(DATE_FORMAT.fullDate)}</div>;
        }
        return "";
      },
      key: "finished_order_on",
      visible: true,
    },
    {
      title: "Ngày huỷ đơn",
      render: (value: string, record: ShipmentModel) => {
        if (record.cancel_date) {
          return <div>{moment(record.cancel_date).format(DATE_FORMAT.fullDate)}</div>;
        }
        return "";
      },
      key: "cancel_date",
      visible: true,
    },
    {
      title: "Tỉnh thành",
      dataIndex: "shipment.shipping_address.city",
      key: "city",
      render: (value: string, record: ShipmentModel) => {
        return record.shipment.shipping_address?.city;
      },
      visible: true,
    },
    {
      title: "Quận huyện",
      dataIndex: "shipment.shipping_address.district",
      key: "district",
      render: (value: string, record: ShipmentModel) => {
        return record.shipment.shipping_address?.district;
      },
      visible: true,
    },
    {
      title: "Trạng thái đối soát",
      dataIndex: "shipment.reference_status",
      key: "reference_status",
      render: (value: string, record: ShipmentModel) => {
        return record.shipment.reference_status;
      },
      visible: true,
    },
  ]);

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setPrams({ ...params });
      history.replace(`${UrlConfig.SHIPMENTS}?${queryParam}`);
    },
    [history, params],
  );

  const setSearchResult = useCallback((result: PageResponse<ShipmentModel> | false) => {
    setTableLoading(false);
    setIsFilter(false);
    if (!!result) {
      setData(result);
    }
  }, []);

  const fetchData = useCallback(
    (params) => {
      return new Promise<void>((resolve, reject) => {
        setTableLoading(true);
        setIsFilter(true);
        dispatch(
          getShipmentsAction(params, setSearchResult, () => {
            setTableLoading(false);
            setIsFilter(false);
          }),
        );
        resolve();
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, setSearchResult],
  );

  const handleFetchData = useCallback(
    (params) => {
      fetchData(params).catch(() => {
        setTableLoading(false);
        setIsFilter(false);
      });
    },
    [fetchData],
  );

  const onFilter = useCallback(
    (values) => {
      let newPrams = { ...params, ...values, page: 1 };
      let currentParam = generateQuery(params);
      let queryParam = generateQuery({ ...newPrams, pushing_status: [] });
      if (currentParam === queryParam) {
        handleFetchData(newPrams);
      } else {
        history.push(`${UrlConfig.SHIPMENTS_FAILED}?${queryParam}`);
      }
    },
    [handleFetchData, history, params],
  );

  const onClearFilter = useCallback(() => {
    setPrams(initQuery);
    let queryParam = generateQuery(initQuery);
    history.push(`${UrlConfig.SHIPMENTS}?${queryParam}`);
  }, [history]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [listExportFile, setListExportFile] = useState<Array<string>>([]);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [statusExport, setStatusExport] = useState<number>(1);

  const [selectedRowCodes, setSelectedRowCodes] = useState([]);
  const [selectedRow, setSelectedRow] = useState([]);

  const actions: Array<MenuAction> = useMemo(
    () => [
      {
        id: ACTION_ID.delete,
        name: "Xóa",
        icon: <DeleteOutlined />,
        disabled: selectedRow.length ? false : true,
      },
      {
        id: ACTION_ID.export,
        name: "Export",
        icon: <ExportOutlined />,
        disabled: selectedRow.length ? false : true,
      },
      {
        id: ACTION_ID.printShipment,
        name: "In phiếu giao hàng",
        icon: <ExportOutlined />,
        disabled: selectedRow.length ? false : true,
      },
    ],
    [selectedRow],
  );

  const onSelectedChange = useCallback((selectedRow) => {
    const selectedRowCodes = selectedRow.map((row: any) => row.code);
    setSelectedRowCodes(selectedRowCodes);
    setSelectedRow(selectedRow);
  }, []);

  const onExport = useCallback(
    (optionExport) => {
      let newParams: any = { ...params };
      // let hiddenFields = [];
      switch (optionExport) {
        case 1:
          newParams = {};
          break;
        case 2:
          break;
        case 3:
          newParams = {
            fulfillment_code: selectedRowCodes,
          };
          break;
        case 4:
          delete newParams.page;
          delete newParams.limit;
          break;
        default:
          break;
      }

      let queryParams = generateQuery(newParams);
      exportFile({
        conditions: queryParams,
        type: "EXPORT_FULFILMENT",
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
    [params, selectedRowCodes, listExportFile],
  );
  const checkExportFile = useCallback(() => {
    let getFilePromises = listExportFile.map((code) => {
      return getFile(code);
    });
    Promise.all(getFilePromises).then((responses) => {
      responses.forEach((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          setExportProgress(
            Math.round((response.data.num_of_record / response.data.total) * 10000) / 100,
          );
          if (response.data && response.data.status === "FINISH") {
            setStatusExport(3);
            setExportProgress(100);
            const fileCode = response.data.code;
            const newListExportFile = listExportFile.filter((item) => {
              return item !== fileCode;
            });
            window.open(response.data.url, "_self");
            setListExportFile(newListExportFile);
          }
          if (response.data && response.data.status === "ERROR") {
            setStatusExport(4);
          }
        } else {
          setStatusExport(4);
        }
      });
    });
  }, [listExportFile]);

  useEffect(() => {
    if (listExportFile.length === 0 || statusExport === 3) return;
    checkExportFile();

    const getFileInterval = setInterval(checkExportFile, 3000);
    return () => clearInterval(getFileInterval);
  }, [listExportFile, checkExportFile, statusExport]);

  const onMenuClick = useCallback(
    (index: number) => {
      switch (index) {
        case ACTION_ID.printShipment:
          let params = {
            action: "print",
            ids: selectedRow.map((single: ShipmentModel) => single.order_id),
            "print-type": "shipment",
            "print-dialog": true,
          };
          const queryParam = generateQuery(params);
          const printPreviewUrl = `${process.env.PUBLIC_URL}${UrlConfig.ORDER}/print-preview?${queryParam}`;
          window.open(printPreviewUrl, "_blank");
          break;

        default:
          break;
      }
    },
    [selectedRow],
  );

  const columnFinal = useMemo(() => columns.filter((item) => item.visible === true), [columns]);

  const setDataAccounts = (data: PageResponse<AccountResponse> | false) => {
    if (!data) {
      return;
    }
    setAccounts(data.items);
  };

  useEffect(() => {
    dispatch(searchAccountPublicAction({ limit: 30 }, setDataAccounts));
    dispatch(
      searchAccountPublicAction(
        {
          is_shipper: 1,
        },
        (response) => {
          if (response) {
            setShippers(response.items);
          }
        },
      ),
    );
    dispatch(getListSourceRequest(setListSource));
    dispatch(StoreGetListAction(setStore));
    dispatch(getListReasonRequest(setReasons));
  }, [dispatch]);

  useEffect(() => {
    let dataQuery: ShipmentSearchQuery = {
      ...initQuery,
      ...getQueryParamsFromQueryString(queryParamsParsed),
      pushing_status: ["failed"],
    };
    setPrams(dataQuery);
    handleFetchData(dataQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, handleFetchData, setSearchResult, location.search]);

  return (
    <StyledComponent>
      <ContentContainer
        title="Danh sách đơn đẩy sang HVC thất bại"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: UrlConfig.HOME,
          },
          {
            name: "Danh sách đơn đẩy sang HVC thất bại",
          },
        ]}
        extra={
          <Row>
            <Space>
              <AuthWrapper acceptPermissions={[ODERS_PERMISSIONS.IMPORT]} passThrough>
                {(isPassed: boolean) => (
                  <Button
                    type="default"
                    className="light"
                    size="large"
                    icon={<img src={importIcon} style={{ marginRight: 8 }} alt="" />}
                    onClick={() => {}}
                    disabled={!isPassed}
                  >
                    Nhập file
                  </Button>
                )}
              </AuthWrapper>
              <AuthWrapper acceptPermissions={[ODERS_PERMISSIONS.EXPORT]} passThrough>
                {(isPassed: boolean) => (
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
                  </Button>
                )}
              </AuthWrapper>
              <AuthWrapper acceptPermissions={[ODERS_PERMISSIONS.CREATE]} passThrough>
                {(isPassed: boolean) => (
                  <ButtonCreate path={`${UrlConfig.ORDER}/create`} disabled={!isPassed} />
                )}
              </AuthWrapper>
            </Space>
          </Row>
        }
      >
        <Card>
          <ShipmentFilter
            onMenuClick={onMenuClick}
            actions={actions}
            onFilter={onFilter}
            isLoading={isFilter}
            params={params}
            listSource={listSource}
            listStore={listStore}
            accounts={accounts}
            shippers={shippers}
            reasons={reasons}
            deliveryService={deliveryServices}
            onShowColumnSetting={() => setShowSettingColumn(true)}
            onClearFilter={() => onClearFilter()}
            isPushingStatusFailed={true}
          />
          <CustomTable
            isRowSelection
            isLoading={tableLoading}
            showColumnSetting={true}
            scroll={{
              x: (2525 * columnFinal.length) / (columns.length ? columns.length : 1),
            }}
            sticky={{ offsetScroll: 10, offsetHeader: 55 }}
            pagination={{
              pageSize: data.metadata.limit,
              total: data.metadata.total,
              current: data.metadata.page,
              showSizeChanger: true,
              onChange: onPageChange,
              onShowSizeChange: onPageChange,
            }}
            onSelectedChange={(selectedRows) => onSelectedChange(selectedRows)}
            // expandable={{
            //   expandedRowRender: record => <p style={{ margin: 0 }}>test</p>,
            // }}
            onShowColumnSetting={() => setShowSettingColumn(true)}
            dataSource={data.items}
            columns={columnFinal}
            rowKey={(item: ShipmentModel) => item.id}
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
            onOk={(optionExport) => onExport(optionExport)}
            type="shipments"
            total={data.metadata.total}
            exportProgress={exportProgress}
            statusExport={statusExport}
            selected={selectedRowCodes.length ? true : false}
          />
        )}
      </ContentContainer>
    </StyledComponent>
  );
};

export default withRouter(ShipmentsFailedScreen);
