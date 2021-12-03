import { Button, Card, Row, Space } from "antd";
import { MenuAction } from "component/table/ActionButton";
import { PageResponse } from "model/base/base-metadata.response";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import { useDispatch } from "react-redux";
import ShipmentFilter from "component/filter/shipment.filter";
import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import {
  Item,
  ShipmentModel,
  ShipmentSearchQuery,
} from "model/order/shipment.model";
import { AccountResponse } from "model/account/account.model";
import importIcon from "assets/icon/import.svg";
import exportIcon from "assets/icon/export.svg";
import UrlConfig from "config/url.config";
import ButtonCreate from "component/header/ButtonCreate";
import ContentContainer from "component/container/content.container";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import {
  DeliveryServicesGetList,
  getListReasonRequest,
  getShipmentsAction,
} from "domain/actions/order/order.action";
import "./scss/index.screen.scss";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { getListSourceRequest } from "domain/actions/product/source.action";
import { SourceResponse } from "model/response/order/source.response";
import { StoreResponse } from "model/core/store.model";
import { StoreGetListAction } from "domain/actions/core/store.action";
import NumberFormat from "react-number-format";
import ShipmentDetailsModal from "./modal/shipment-details.modal";
import { StyledComponent } from "./list-shipments.styles";
import { exportFile, getFile } from "service/other/export.service";
import { HttpStatus } from "config/http-status.config";
import { showError, showSuccess } from "utils/ToastUtils";
import ExportModal from "./modal/export.modal";
import { DeleteOutlined, ExportOutlined } from "@ant-design/icons";
import { DeliveryServiceResponse } from "model/response/order/order.response";
import AuthWrapper from "component/authorization/AuthWrapper";
import { ODERS_PERMISSIONS } from "config/permissions/order.permission";

const ACTION_ID = {
	delete: 1,
	export: 2,
	printShipment: 3,
}

const actions: Array<MenuAction> = [
  {
    id: ACTION_ID.delete,
    name: "Xóa",
    icon:<DeleteOutlined />
  },
  {
    id: ACTION_ID.export,
    name: "Export",
    icon:<ExportOutlined />
  },
	{
    id: ACTION_ID.printShipment,
    name: "In phiếu giao hàng",
    icon:<ExportOutlined />
  },
];

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
  shipper_ids: [],
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
  received_on_min: null,
  received_on_max: null,
  received_predefined: null,
  cancelled_on_min: null,
  cancelled_on_max: null,
  cancelled_on_predefined: null,
  print_status: [],
  pushing_status: [],
  store_ids: [],
  source_ids: [],
  account_codes: [],
  shipping_address: null,
  variant_ids: [],
  note: null,
  customer_note: null,
  tags: [],
  cancel_reason: [],
};

const ListOrderScreen: React.FC = () => {
  const query = useQuery();
  const history = useHistory();
  const dispatch = useDispatch();

  const [tableLoading, setTableLoading] = useState(true);
  const [isFilter, setIsFilter] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [details, setDetails] = useState(false);
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  useState<Array<AccountResponse>>();
  let dataQuery: ShipmentSearchQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  let [params, setPrams] = useState<ShipmentSearchQuery>(dataQuery);
  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);
  const [listStore, setStore] = useState<Array<StoreResponse>>();
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [reasons, setReasons] = useState<Array<{ id: number; name: string }>>(
    []
  );
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
  const [data, setData] = useState<PageResponse<ShipmentModel>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const status_order = [
    {name: "Chưa giao", value: "unshipped"},
    {name: "Đã lấy hàng", value: "picked"},
    {name: "Giao một phần", value: "partial"},
    {name: "Đã đóng gói", value: "packed"},
    {name: "Đang giao", value: "shipping"},
    {name: "Đã giao", value: "shipped"},
    {name: "Đang trả lại", value: "returning"},
    {name: "Đã trả lại", value: "returned"},
    {name: "Đã hủy", value: "cancelled"}
  ];

  const shipmentDetailModal = useCallback((record: any) => {
    setShowDetails(true);
    setDetails(record);
  }, []);
  const [columns, setColumn] = useState<
    Array<ICustomTableColumType<ShipmentModel>>
  >([
    {
      title: "Mã đơn giao",
      render: (record: ShipmentModel) => (
        <div>
          <div
            onClick={() => shipmentDetailModal(record)}
            className="name p-b-3"
            style={{ color: "#2A2A86" }}
          >
            {record.code}
          </div>
          <div>
            {record.created_date
              ? ConvertUtcToLocalDate(record.created_date)
              : ""}
          </div>
        </div>
      ),
      visible: true,
      fixed: "left",
      width: "120px",
    },
    {
      title: "Mã vận đơn",
      dataIndex: "shipment",
      render: (shipment: any) => shipment?.tracking_code,
      visible: true,
      width: "120px",
    },
    {
      title: "Người nhận",
      render: (record: any) =>
        (
          <div className="customer">
            <div className="name p-b-3" style={{ color: "#2A2A86" }}>
              {record.customer}
            </div>
            {record.shipment && record.shipment.shipping_address && (<div>
              <div className="p-b-3">{record.shipment.shipping_address.phone}</div>
              <div className="p-b-3">{record.shipment.shipping_address.full_address}</div>
            </div>)}
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
                      <Link to={`${UrlConfig.PRODUCT}/${item.variant_id}`}>
                        {item.variant}
                      </Link>
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
      title: "Tiền COD",
      dataIndex: "shipment",
      render: (value?) => (
        <NumberFormat
          value={value?.cod}
          className="foo"
          displayType={"text"}
          thousandSeparator={true}
        />
      ),
      key: "cod",
      visible: true,
      align: "center",
    },
    {
      title: "HT Vận Chuyển",
      render: (record: any) => {
        switch (record.shipment?.delivery_service_provider_type) {
          case "external_service":
            const service_id = record.shipment.delivery_service_provider_id;
            const service = delivery_services.find((service) => service.id === service_id);
            return (
              service && (
                <img
                  src={service.logo ? service.logo : ""}
                  alt=""
                  style={{ width: "100%" }}
                />
              )
            );
          case "Shipper":
            return `Đối tác - ${record.shipment.shipper_code} - ${record.shipment.shipper_name}`;
          case "pick_at_store":
            return `Nhận tại - ${record.store}`;
          default: return ""
        }
      },
      key: "shipment.type",
      visible: true,
      width: 140,
      align: "center",
    },
    {
      title: "Trạng thái giao vận",
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
      width: 180,
    },

    {
      title: "Tổng SL sản phẩm",
      dataIndex: "items",
      render: (items?) => items?.length,
      key: "total_quantity",
      visible: true,
      align: "center",
    },
    {
      title: "Nhân viên tạo đơn giao",
      render: (record) => <div>{`${record.account? record.account : ''} - ${record.account_code}`}</div>,
      key: "account_code",
      visible: true,
      align: "center",
    },
    {
      title: "Ghi chú",
      dataIndex: "shipment.note_to_shipper",
      key: "note_to_shipper",
      visible: true,
    },
    {
      title: "Lý do huỷ giao",
      dataIndex: "shipment.cancel_reason",
      // render: (shipment?: any) => <div>{shipment?.cancel_reason}</div>,
      key: "cancel_date",
      visible: true,
    },
    {
      title: "Phí trả đối tác",
      dataIndex: "shipment",
      render: (shipment?) => (
        <NumberFormat
          value={shipment?.shipping_fee_paid_to_three_pls}
          className="foo"
          displayType={"text"}
          thousandSeparator={true}
        />
      ),
      key: "shipping_fee_paid_to_three_pls",
      visible: true,
      align: "center",
    },
    // {
    //   title: "Khách đã trả",
    //   dataIndex: "total",
    //   key: "total",
    //   visible: true,
    // },

    {
      title: "Ngày giao hàng",
      dataIndex: "shipment",
      render: (shipment: any) => <div>{ConvertUtcToLocalDate(shipment.received_date)}</div>,
      key: "shipped_on",
      visible: true,
      align: "center",
    },
    
    {
      title: "Ngày tạo đơn",
      dataIndex: "shipment.created_date",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
      key: "shipped_on",
      visible: true,
    },
    {
      title: "Ngày hoàn tất đơn",
      dataIndex: "shipment.finished_order_on",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
      key: "finishedOrderOn",
      visible: true,
    },
    {
      title: "Ngày huỷ đơn",
      dataIndex: "shipment.cancel_date",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
      key: "cancel_date",
      visible: true,
    },
    {
      title: "Tỉnh thành",
      dataIndex: "shipment.shipping_address.city",
      key: "city",
      visible: true,
    },
    {
      title: "Quận huyện",
      dataIndex: "shipment.shipping_address.district",
      key: "district",
      visible: true,
    },
    {
      title: "Trạng thái đối soát",
      dataIndex: "shipment.reference_status",
      key: "reference_status",
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
    [history, params]
  );
  const onFilter = useCallback(
    (values) => {
      let newPrams = { ...params, ...values, page: 1 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      setIsFilter(true) 
      history.push(`${UrlConfig.SHIPMENTS}?${queryParam}`);
    },
    [history, params]
  );

  const onClearFilter = useCallback(
    () => {
      setPrams(initQuery);
      let queryParam = generateQuery(initQuery);
      history.push(`${UrlConfig.SHIPMENTS}?${queryParam}`);
    },
    [history]
  );
  const [showExportModal, setShowExportModal] = useState(false);
  const [listExportFile, setListExportFile] = useState<Array<string>>([]);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [statusExport, setStatusExport] = useState<number>(1);

  const [selectedRowCodes, setSelectedRowCodes] = useState([]);
  const [selectedRow, setSelectedRow] = useState([]);
	
  const onSelectedChange = useCallback((selectedRow) => {
    const selectedRowCodes = selectedRow.map((row: any) => row.code);
    setSelectedRowCodes(selectedRowCodes);
		setSelectedRow(selectedRow);
  }, []);

  const onExport = useCallback((optionExport, typeExport) => {
    let newParams:any = {...params};
    // let hiddenFields = [];
    console.log('selectedRowCodes', selectedRowCodes);
    switch (optionExport) {
      case 1: newParams = {}
        break
      case 2: break
      case 3:
        newParams.fulfillment_code = selectedRowCodes;
        console.log('newParams', newParams);
        break
      case 4:
        delete newParams.page
        delete newParams.limit
        break
      default: break  
    }
    // console.log('newParams', newParams);
    
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
      type: "EXPORT_FULFILMENT",
    })
      .then((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          setStatusExport(2)
          showSuccess("Đã gửi yêu cầu xuất file");
          setListExportFile([...listExportFile, response.data.code]);
        }
      })
      .catch((error) => {
        setStatusExport(4)
        console.log("orders export file error", error);
        showError("Có lỗi xảy ra, vui lòng thử lại sau");
      });
  }, [params, selectedRowCodes, listExportFile]);
  const checkExportFile = useCallback(() => {
    console.log('start check status');
    
    let getFilePromises = listExportFile.map((code) => {
      return getFile(code);
    });
    Promise.all(getFilePromises).then((responses) => {
      
      responses.forEach((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          if (exportProgress < 95) {
            setExportProgress(exportProgress + 3)
          }
          if (response.data && response.data.status === "FINISH") {
            setStatusExport(3)
            console.log('finishhh');
            setExportProgress(100)
            const fileCode = response.data.code
            const newListExportFile = listExportFile.filter((item) => {
              return item !== fileCode;
            });
            window.open(response.data.url);
            setListExportFile(newListExportFile);
          }
        }
      });
    });
  }, [exportProgress, listExportFile]);

  useEffect(() => {
    if (listExportFile.length === 0 || statusExport === 3) return;
    checkExportFile();
    
    const getFileInterval = setInterval(checkExportFile, 3000);
    return () => clearInterval(getFileInterval);
  }, [listExportFile, checkExportFile, statusExport]);

  const onMenuClick = useCallback((index: number) => {
		switch (index) {
			case ACTION_ID.printShipment:
				console.log('selectedRow', selectedRow)
				let params = {
					action: "print",
					ids: selectedRow.map((single:ShipmentModel) => single.order_id),
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
	}, [selectedRow]);

  const setSearchResult = useCallback(
    (result: PageResponse<ShipmentModel> | false) => {
      setTableLoading(false);
      setIsFilter(false);
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

  const setDataAccounts = (data: PageResponse<AccountResponse> | false) => {
      if (!data) {
        return;
      }
      setAccounts(data.items);
    };

  useEffect(() => {
    setTableLoading(true);
    dispatch(getShipmentsAction(params, setSearchResult));
  }, [dispatch, params, setSearchResult]);

  useEffect(() => {
    dispatch(AccountSearchAction({}, setDataAccounts));
    dispatch(getListSourceRequest(setListSource));
    dispatch(StoreGetListAction(setStore));
    dispatch(getListReasonRequest(setReasons));
  }, [dispatch]);

  return (
    <StyledComponent>
      <ContentContainer
        title="Danh sách đơn giao hàng"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: UrlConfig.HOME,
          },
          {
            name: "Danh sách đơn giao hàng",
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
                  onClick={() => {}}
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
                    console.log("export");
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
            reasons={reasons}
            deliveryService={deliveryServices}
            onShowColumnSetting={() => setShowSettingColumn(true)}
            onClearFilter={() => onClearFilter()}
          />
          <CustomTable
            isRowSelection
            isLoading={tableLoading}
            showColumnSetting={true}
            scroll={{ x: 3630 * columnFinal.length/(columns.length ? columns.length : 1)}}
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
        <ShipmentDetailsModal
          visible={showDetails}
          onOk={() => {
            setShowDetails(false);
          }}
          shipmentDetails={details}
        />
        {showExportModal && <ExportModal
          visible={showExportModal}
          onCancel={() => {
            setShowExportModal(false)
            setExportProgress(0)
            setStatusExport(1)
          }}
          onOk={(optionExport, typeExport) => onExport(optionExport, typeExport)}
          type="shipments"
          total={data.metadata.total}
          exportProgress={exportProgress}
          statusExport={statusExport}
          selected={selectedRowCodes.length ? true : false}
        />}
      </ContentContainer>
    </StyledComponent>
  );
};

export default ListOrderScreen;
