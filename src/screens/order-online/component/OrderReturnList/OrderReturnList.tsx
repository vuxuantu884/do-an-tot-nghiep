import { DeleteOutlined, ExportOutlined } from "@ant-design/icons";
import { Button, Card, Radio, Row, Space, Tooltip } from "antd";
import exportIcon from "assets/icon/export.svg";
import AuthWrapper from "component/authorization/AuthWrapper";
import ContentContainer from "component/container/content.container";
import ReturnFilter from "component/filter/return.filter";
import { MenuAction } from "component/table/ActionButton";
import CustomTable, {
  ICustomTableColumType
} from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { HttpStatus } from "config/http-status.config";
import { ODERS_PERMISSIONS } from "config/permissions/order.permission";
import UrlConfig from "config/url.config";
import { searchAccountPublicAction } from "domain/actions/account/account.action";
import { StoreGetListAction } from "domain/actions/core/store.action";
import {
  getListReasonRequest,
  getReturnsAction
} from "domain/actions/order/order.action";
import { getListAllSourceRequest } from "domain/actions/product/source.action";
import useHandleFilterColumns from "hook/table/useHandleTableColumns";
import useSetTableColumns from "hook/table/useSetTableColumns";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { StoreResponse } from "model/core/store.model";
import { OrderTypeModel } from "model/order/order.model";
import { ReturnModel, ReturnSearchQuery } from "model/order/return.model";
import { OrderLineItemResponse } from "model/response/order/order.response";
import { SourceResponse } from "model/response/order/source.response";
import moment from "moment";
import { useCallback, useEffect, useMemo, useState } from "react";
import NumberFormat from "react-number-format";
import { useDispatch } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import ExportModal from "screens/order-online/modal/export.modal";
import { exportFile, getFile } from "service/other/export.service";
import { formatCurrency, generateQuery } from "utils/AppUtils";
import { COLUMN_CONFIG_TYPE } from "utils/Constants";
import { DATE_FORMAT } from "utils/DateUtils";
import { dangerColor } from "utils/global-styles/variables";
import { ORDER_TYPES } from "utils/Order.constants";
import { showError, showSuccess } from "utils/ToastUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import IconPaymentPoint from "../../component/OrderList/ListTable/images/paymentPoint.svg";
import { StyledComponent } from "./OrderReturnList.styles";

type PropTypes = {
  initQuery: ReturnSearchQuery;
  location: any;
  orderType: OrderTypeModel;
}

function OrderReturnList(props: PropTypes) {
  const {initQuery, location, orderType} = props;
  const query = useQuery();
  const history = useHistory();
  const dispatch = useDispatch();

  const [tableLoading, setTableLoading] = useState(true);
  const [isFilter, setIsFilter] = useState(false);
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  useState<Array<AccountResponse>>();
  let dataQuery: ReturnSearchQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  let [params, setPrams] = useState<ReturnSearchQuery>(dataQuery);
  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);
  const [listStore, setStore] = useState<Array<StoreResponse>>();
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [reasons, setReasons] = useState<Array<{ id: number; name: string }>>(
    []
  );

  const [data, setData] = useState<PageResponse<ReturnModel>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const [columns, setColumns] = useState<
    Array<ICustomTableColumType<ReturnModel>>
  >([
    {
      title: "Mã đơn trả hàng",
      render: (record: ReturnModel) => (
        <div>
          <div className="name p-b-3" style={{ color: "#2A2A86" }}>
            <Link
              target="_blank"
              to={`${UrlConfig.ORDERS_RETURN}/${record.id}`}
            >
              {record.code_order_return}
            </Link>
          </div>
          <div>
            {record.created_date
              ? moment(record.created_date).format(DATE_FORMAT.fullDate)
              : ""}
          </div>
        </div>
      ),
      visible: true,
      fixed: "left",
      width: 140,
    },
    {
      title: "Mã đơn hàng",
      render: (record: ReturnModel) => (
        <Link target="_blank" to={`${UrlConfig.ORDER}/${record.order_id}`}>
          {record.code_order}
        </Link>
      ),
      visible: true,
      width: 140,
    },
    {
      title: "Người nhận",
      render: (record: any) => (
        <div className="customer">
          <div className="name p-b-3" style={{ color: "#2A2A86" }}>
            <Link
              target="_blank"
              to={`${UrlConfig.ACCOUNTS}/${record.account_code}`}
            >
              {record.account_code} - {record.account}
            </Link>
          </div>
          {/* <div className="p-b-3">{record.account_code}</div> */}
          {/* <div className="p-b-3">{record.customer_email}</div> */}
        </div>
      ),
      key: "customer",
      visible: true,
      width: 160,
    },
    {
      title: (
        <div className="productNameQuantityPriceHeader">
          <span className="productNameWidth">
            Sản phẩm
            <span className="separator">, </span>
          </span>
          <span className="quantity quantityWidth">
            <span>
              SL
              <span className="separator">, </span>
            </span>
          </span>
          <span className="price priceWidth">
            <span>Giá </span>
          </span>

        </div>
      ),
      dataIndex: "items",
      key: "productNameQuantityPrice",
      className: "productNameQuantityPrice",
      render: (record: Array<OrderLineItemResponse>) => {
        return (
          <div className="items">
            {record.map((item, i) => {
              return (
                <div className="item custom-td" key={i}>
                  <div className="product productNameWidth 2">
                    <div className="inner">
                      <Link
                        to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.variant_id}`}>
                        {item.sku}
                      </Link>
                      <br />
                      <div className="productNameText textSmall" title={item.variant}>
                        {item.variant}
                      </div>
                    </div>
                  </div>
                  <div className="quantity quantityWidth">
                    <NumberFormat
                      value={item.quantity}
                      displayType={"text"}
                      thousandSeparator={true}
                    />
                  </div>
                  <div className="price priceWidth">
                    <div>
                      <Tooltip title="Giá sản phẩm">
                        <span>{formatCurrency(item.price)}</span>
                      </Tooltip>

                      {item?.discount_items && item.discount_items[0]?.value ? (
                        <Tooltip title="Khuyến mại sản phẩm">
                          <div className="itemDiscount" style={{ color: dangerColor }}>
                            <span> - {formatCurrency(item.discount_items[0].value)}</span>
                          </div>
                        </Tooltip>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      },
      visible: true,
      align: "left",
      width: 350,
    },
    {
      title: "Kho cửa hàng",
      dataIndex: "store",
      key: "store",
      visible: true,
      width: 140,
    },
    {
      title: "Nguồn",
      dataIndex: "source",
      key: "source",
      visible: true,
      width: 100,
    },
    // {orderType === ORDER_TYPES.offline ? null : (
    //   <div className="textSmall single">
    //     <Tooltip title="Nguồn">{i.source}</Tooltip>
    //   </div>
    // )}
    {
      title: "Trạng thái nhận hàng",
      dataIndex: "received",
      key: "received",
      render: (value: boolean) => {
        let processIcon = null;
        switch (value) {
          case true:
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
      width: 140,
    },
    {
      title: "Hoàn tiền",
      //dataIndex: "total_amount",
      render: (record: any) => {
        if(!record?.payment_status) {
          return null
        }
        let processIcon = "";
        switch (record.payment_status) {
          case "unpaid":
            processIcon = "icon-blank";
            break;
          case "paid":
            processIcon = "icon-full";
            break;
          case "partial_paid":
            processIcon = "icon-full";
            break;
          default:
            break;
        }
        return (
          <div className="text-center">
            <div className={processIcon} />
          </div>
        );
      },
      key: "total_amount",
      visible: true,
      align: "center",
      width: 140,
    },

    {
      title: "Tổng tiền",
      width: 140,
      render: (record: any) => (
        <>
          <Tooltip title="Tổng thanh toán">
            <NumberFormat
              value={record.total}
              className="foo"
              displayType={"text"}
              thousandSeparator={true}
              style={{ fontWeight: 500, color: "#27ae60"}}
            />
          </Tooltip>

          {record.point_refund  && record.total ? (
            <>
              <br />
              <Tooltip title="Hoàn điểm">
                <span>
                  <img src={IconPaymentPoint} alt="" />
                  <NumberFormat
                    value={record.point_refund}
                    className="foo"
                    displayType={"text"}
                    thousandSeparator={true}
                    style={{ fontWeight: 500, color: "#fcaf17", paddingLeft: 5 }}
                  />
                </span>
              </Tooltip>
              <br />
              <Tooltip title="Thu người nhận">
                <span style={{ fontWeight: 500 }}>
                  <NumberFormat
                    value={record.total}
                    className="foo"
                    displayType={"text"}
                    thousandSeparator={true}
                  />
                </span>
              </Tooltip>
            </>
          ) : null}
        </>
      ),
      key: "total_amount",
      visible: true,
      align: "center",
    },

    {
      title: "Ngày nhận hàng",
      dataIndex: "receive_date",
      render: (value: string) => <div>{moment(value).format(DATE_FORMAT.fullDate)}</div>,
      key: "total_amount",
      visible: true,
      align: "center",
      width: 130,
    },
    {
      title: "Lý do trả",
      dataIndex: "reason",
      key: "reason",
      visible: true,
      align: "center",
      width: 160,
      render:(value: any, record: ReturnModel, index: number)=><div>{record?.return_reason?.name}</div>
    },
  ]);

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setPrams({ ...params });
      history.replace(`${location.pathname}?${queryParam}`);
    },
    [history, location.pathname, params]
  );
  const onFilter = useCallback(
    (values) => {
      let newPrams = { ...params, ...values, page: 1 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      setIsFilter(true) 
      history.push(`${location.pathname}?${queryParam}`);
    },
    [history, location.pathname, params]
  );

  const onClearFilter = useCallback(
    () => {
      setPrams(initQuery);
      let queryParam = generateQuery(initQuery);
      history.push(`${UrlConfig.ORDERS_RETURN}?${queryParam}`);
    },
    [history, initQuery]
  );
  const [showExportModal, setShowExportModal] = useState(false);
  const [listExportFile, setListExportFile] = useState<Array<string>>([]);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [statusExport, setStatusExport] = useState<number>(1);

  const [selectedRowCodes, setSelectedRowCodes] = useState([]);
  const onSelectedChange = useCallback((selectedRow) => {
    const selectedRowCodes = selectedRow.map((row: any) => row.code);
    setSelectedRowCodes(selectedRowCodes);
  }, []);

  const actions: Array<MenuAction> = useMemo(() => [
    {
      id: 1,
      name: "Xóa",
      icon:<DeleteOutlined />,
      disabled: selectedRowCodes.length ? false : true,
    },
    {
      id: 2,
      name: "Export",
      icon:<ExportOutlined />,
      disabled: selectedRowCodes.length ? false : true,
    },
  ], [selectedRowCodes]);

  const onExport = useCallback((optionExport) => {
    let newParams:any = {...params};
    // let hiddenFields = [];
    switch (optionExport) {
      case 1: newParams = {}
        break
      case 2: break
      case 3:
        newParams = {
          code_order_return: selectedRowCodes
        };
        break
      case 4:
        delete newParams.page
        delete newParams.limit
        break
      default: break  
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
      type: "TYPE_EXPORT_ORDER_RETURN",
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
    
    let getFilePromises = listExportFile.map((code) => {
      return getFile(code);
    });
    Promise.all(getFilePromises).then((responses) => {
      
      responses.forEach((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          setExportProgress(Math.round(response.data.num_of_record/response.data.total * 10000) / 100);
          if (response.data && response.data.status === "FINISH") {
            setStatusExport(3)
            setExportProgress(100)
            const fileCode = response.data.code
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

  // cột column
  const columnConfigType = orderType === ORDER_TYPES.offline ? COLUMN_CONFIG_TYPE.orderReturnOffline : COLUMN_CONFIG_TYPE.orderReturnOnline
  const {tableColumnConfigs, onSaveConfigTableColumn} = useHandleFilterColumns(columnConfigType)
  //cột của bảng
  useSetTableColumns(columnConfigType, tableColumnConfigs, columns, setColumns)

  useEffect(() => {
    if (listExportFile.length === 0 || statusExport === 3 || statusExport === 4) return;
    checkExportFile();
    
    const getFileInterval = setInterval(checkExportFile, 3000);
    return () => clearInterval(getFileInterval);
  }, [listExportFile, checkExportFile, statusExport]);
  const onMenuClick = useCallback((index: number) => {}, []);

  const setSearchResult = useCallback(
    (result: PageResponse<ReturnModel> | false) => {
      setTableLoading(false);
      setIsFilter(false) 
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

  const onChangeOrderOptions = useCallback(
    (e) => {
      onFilter && onFilter({ ...params, is_online: e.target.value });
    },
    [onFilter, params]
  );

  useEffect(() => {
    setTableLoading(true);
    dispatch(getReturnsAction(params, setSearchResult));
  }, [dispatch, params, setSearchResult]);

  useEffect(() => {
    dispatch(searchAccountPublicAction({limit: 30}, setDataAccounts));
    dispatch(getListAllSourceRequest(setListSource));
    dispatch(StoreGetListAction(setStore));
    dispatch(getListReasonRequest(setReasons));
  }, [dispatch]);

  return (
    <StyledComponent>
      <ContentContainer
        title="Danh sách đơn trả hàng"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: UrlConfig.HOME,
          },
          {
            name: "Danh sách đơn trả hàng",
          },
        ]}
        extra={
          <Row>
            <Space>
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
            </Space>
          </Row>
        }
      >
        <Card className="return-card">
          {/* hiện tại không dùng tab */}
          {false ? (
            <div className="order-options">
              <Radio.Group onChange={(e) => onChangeOrderOptions(e)} value={params.is_online}>
                <Radio.Button value={null}>Tất cả đơn trả hàng</Radio.Button>
                <Radio.Button value="true">Trả hàng online</Radio.Button>
                <Radio.Button value="false">Trả hàng offline</Radio.Button>
              </Radio.Group>
            </div>
          ) : null}
          <ReturnFilter
            onMenuClick={onMenuClick}
            actions={actions}
            onFilter={onFilter}
            isLoading={isFilter}
            params={params}
            listSource={listSource}
            listStore={listStore}
            accounts={accounts}
            reasons={reasons}
            onShowColumnSetting={() => setShowSettingColumn(true)}
            onClearFilter={() => onClearFilter()}
            orderType={orderType}
          />
          <CustomTable
            isRowSelection
            isLoading={tableLoading}
            showColumnSetting={true}
            scroll={{ x: 1600 * columnFinal.length/(columns.length ? columns.length : 1)}}
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
            rowKey={(item: ReturnModel) => item.id}
            className="order-list"
          />
        </Card>

        <ModalSettingColumn
          visible={showSettingColumn}
          onCancel={() => setShowSettingColumn(false)}
          onOk={(data) => {
            setShowSettingColumn(false);
            setColumns(data);
            onSaveConfigTableColumn(data );
          }}
          data={columns}
        />
        {showExportModal && <ExportModal
            visible={showExportModal}
            onCancel={() => {
              setShowExportModal(false)
              setExportProgress(0)
              setStatusExport(1)
            }}
            onOk={(optionExport) => onExport(optionExport)}
            type="returns"
            total={data.metadata.total}
            exportProgress={exportProgress}
            statusExport={statusExport}
            selected={selectedRowCodes.length ? true : false}
          />}
      </ContentContainer>
    </StyledComponent>
  );
};

export default OrderReturnList;
