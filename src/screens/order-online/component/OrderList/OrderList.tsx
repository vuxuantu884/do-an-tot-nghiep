import { ExclamationCircleOutlined, PrinterOutlined } from "@ant-design/icons";
import { Button, Card, Modal, Row, Space } from "antd";
import exportIcon from "assets/icon/export.svg";
import importIcon from "assets/icon/import.svg";
import AuthWrapper from "component/authorization/AuthWrapper";
import ContentContainer from "component/container/content.container";
import OrdersFilter from "component/filter/order.filter";
import ButtonCreate from "component/header/ButtonCreate";
import { MenuAction } from "component/table/ActionButton";
import { ICustomTableColumType } from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { HttpStatus } from "config/http-status.config";
import { ODERS_PERMISSIONS } from "config/permissions/order.permission";
import UrlConfig from "config/url.config";
import { ExternalShipperGetListAction, searchAccountPublicAction } from "domain/actions/account/account.action";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import {
  DeliveryServicesGetList,
  getListOrderAction,
  PaymentMethodGetList
} from "domain/actions/order/order.action";
import { getListSourceRequest } from "domain/actions/product/source.action";
import { actionFetchListOrderProcessingStatus } from "domain/actions/settings/order-processing-status.action";
import { AccountResponse, DeliverPartnerResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { StoreResponse } from "model/core/store.model";
import { OrderModel, OrderSearchQuery } from "model/order/order.model";
import {
  OrderProcessingStatusModel,
  OrderProcessingStatusResponseModel
} from "model/response/order-processing-status.response";
import {
  DeliveryServiceResponse,
  OrderResponse
} from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { SourceResponse } from "model/response/order/source.response";
import queryString from "query-string";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { GoPlus } from "react-icons/go";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import ExportModal from "screens/order-online/modal/export.modal";
import { changeOrderStatusToPickedService } from "service/order/order.service";
import { exportFile, getFile } from "service/other/export.service";
import { generateQuery, goToTopPage, handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import { getQueryParamsFromQueryString } from "utils/useQuery";
import OrdersTable from "./ListTable/OrdersTable";
import { StyledComponent } from "./OrderList.styles";

type PropTypes = {
  location: any;
  initQuery: OrderSearchQuery;
  pageTitle: {
    title: string;
    breadcrumb: {
      name: string;
      path?: string;
    }[];
  };
  isHideTab?: boolean;
  isShowOfflineOrder?: boolean;
};

function OrderList(props: PropTypes) {
  const EXPORT_IDs = {
    allOrders: 1,
    ordersOnThisPage: 2,
    selectedOrders: 3,
    ordersFound: 4,
  };

  const ACTION_ID = {
    printOrder: 1,
    printShipment: 4,
    printStockExport: 5,
  };


  const history = useHistory();
  const dispatch = useDispatch();

  const { location, initQuery, pageTitle, isHideTab = false, isShowOfflineOrder = false } = props;
  const queryParamsParsed: any = queryString.parse(
    location.search
  );

  const [tableLoading, setTableLoading] = useState(true);
  const [isFilter, setIsFilter] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  useState<Array<AccountResponse>>();
  let [params, setPrams] = useState<OrderSearchQuery>(initQuery);
  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);
  const [listStore, setStore] = useState<Array<StoreResponse>>();
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [shippers, setShippers] = useState<Array<DeliverPartnerResponse>>([]);
  const [listOrderProcessingStatus, setListOrderProcessingStatus] = useState<
    OrderProcessingStatusModel[]
  >([]);
  const [initListOrderProcessingStatus, setInitListOrderProcessingStatus] = useState<
    OrderProcessingStatusModel[]
  >([]);

  const [listPaymentMethod, setListPaymentMethod] = useState<
    Array<PaymentMethodResponse>
  >([]);
  const [deliveryServices, setDeliveryServices] = useState<
    Array<DeliveryServiceResponse>
  >([]);


  const [data, setData] = useState<PageResponse<OrderModel>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const setSearchResult = useCallback((result: PageResponse<OrderModel> | false) => {
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
        dispatch(getListOrderAction(params, setSearchResult, () => {
          setTableLoading(false);
          setIsFilter(false);
        }));
        resolve();
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, setSearchResult]
  );

  const handleFetchData = useCallback(
    (params) => {
      fetchData(params).catch(() => {
        setTableLoading(false);
        setIsFilter(false);
      });
    },
    [fetchData]
  );

  const [columns, setColumns] = useState<Array<ICustomTableColumType<OrderModel>>>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [selectedRowCodes, setSelectedRowCodes] = useState<string[]>([]);
  const [selectedRow, setSelectedRow] = useState<OrderResponse[]>([]);

  const actions: Array<MenuAction> = useMemo(() => [
    {
      id: ACTION_ID.printShipment,
      name: "In phiếu giao hàng",
      icon: <PrinterOutlined />,
      disabled: selectedRow.length ? false : true,
    },
    {
      id: ACTION_ID.printStockExport,
      name: "In phiếu xuất kho",
      icon: <PrinterOutlined />,
      disabled: selectedRow.length ? false : true,
    },
    {
      id: ACTION_ID.printOrder,
      name: "In hoá đơn",
      icon: <PrinterOutlined />,
      disabled: selectedRow.length ? false : true,
    },
  ], [ACTION_ID.printOrder, ACTION_ID.printShipment, ACTION_ID.printStockExport, selectedRow]);

  const onSelectedChange = useCallback((selectedRows: OrderResponse[], selected?: boolean, changeRow?: any[]) => {
    let selectedRowCopy: OrderResponse[] = [...selectedRow];
    let selectedRowKeysCopy: number[] = [...selectedRowKeys];
    let selectedRowCodesCopy: string[] = [...selectedRowCodes];

    if (selected === true) {
      changeRow?.forEach((row, index) => {
        let indexItem = selectedRow.findIndex((p) => p.id === row.id)
        if (indexItem === -1) {
          selectedRowCopy.push(row);
          selectedRowKeysCopy.push(row.id);
          selectedRowCodesCopy.push(row.code);
        }
      })
    }
    else {
      selectedRow.forEach((row, index) => {
        let indexItem = changeRow?.findIndex((p) => p.id === row.id);
        if (indexItem !== -1) {
          let i = selectedRowCopy.findIndex((p) => p.id === row.id);
          selectedRowCopy.splice(i, 1);
        }
      })

      selectedRowKeys.forEach((row, index) => {
        let indexItemKey = changeRow?.findIndex((p) => p.id === row);
        if (indexItemKey !== -1) {
          let i = selectedRowKeysCopy.findIndex((p) => p === row);
          selectedRowKeysCopy.splice(i, 1);
        }
      })

      selectedRowCodes.forEach((row, index) => {
        let indexItemCode = changeRow?.findIndex((p) => p.code === row);
        if (indexItemCode !== -1) {
          let i = selectedRowCodesCopy.findIndex((p) => p === row);
          selectedRowCodesCopy.splice(i, 1);
        }
      })
    }

    setSelectedRow(selectedRowCopy);
    setSelectedRowKeys(selectedRowKeysCopy);
    setSelectedRowCodes(selectedRowCodesCopy);

    // setSelectedRow(selectedRow);

    // const selectedRowKeys = selectedRow.map((row: any) => row.id);
    // setSelectedRowKeys(selectedRowKeys);

    // const selectedRowCodes = selectedRow.map((row: any) => row.code);
    // setSelectedRowCodes(selectedRowCodes);
  }, [selectedRow, selectedRowCodes, selectedRowKeys]);

  // console.log("selectedRowKeys",selectedRowKeys)

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      history.push(`${location.pathname}?${queryParam}`);
      goToTopPage()
    },
    [history, location.pathname, params]
  );
  const onFilter = useCallback(
    (values) => {
      let newPrams = { ...params, ...values, page: 1 };
      let currentParam = generateQuery(params);
      let queryParam = generateQuery(newPrams);
      if (currentParam === queryParam) {
        handleFetchData(newPrams);
      } else {
        history.push(`${location.pathname}?${queryParam}`);
      }
      setSelectedRow([]);
      setSelectedRowKeys([]);
      setSelectedRowCodes([]);
    },
    [handleFetchData, history, location.pathname, params]
  );
  const onClearFilter = useCallback(() => {
    setPrams(initQuery);
    let queryParam = generateQuery(initQuery);
    history.push(`${location.pathname}?${queryParam}`);
  }, [history, initQuery, location.pathname]);

  const onFilterPhoneCustomer = useCallback((phone: string) => {
    let paramCopy = { ...params, search_term: phone, page: 1  };
    setPrams(paramCopy);
    let queryParam = generateQuery(paramCopy);
    history.push(`${location.pathname}?${queryParam}`);
  }, [history, location.pathname, params]);

  const onMenuClick = useCallback(
    (index: number) => {
      let params = {
        action: "print",
        ids: selectedRowKeys,
        "print-type": index === ACTION_ID.printShipment ? "shipment" : "stock_export",
        "print-dialog": true,
      };
      const queryParam = generateQuery(params);
      switch (index) {
        case ACTION_ID.printShipment:
          let ids: number[] = [];
          selectedRow.forEach((row) =>
            row.fulfillments?.forEach((single) => {
              ids.push(single.id);
            })
          );
          dispatch(showLoading());
          changeOrderStatusToPickedService(ids)
            .then((response) => {
              if (isFetchApiSuccessful(response)) {
                window.location.reload();
              } else {
                handleFetchApiError(response, "In phiếu giao hàng", dispatch)
              }
            })
            .catch((error) => {
              console.log("error", error);
            })
            .finally(() => {
              dispatch(hideLoading());
            });
          const printPreviewUrl = `${process.env.PUBLIC_URL}${UrlConfig.ORDER}/print-preview?${queryParam}`;
          window.open(printPreviewUrl);
          break;
        case ACTION_ID.printStockExport:
          {
            // dispatch(showLoading());
            const printPreviewUrlExport = `${process.env.PUBLIC_URL}${UrlConfig.ORDER}/print-preview?${queryParam}`;
            let ids: number[] = [];
            selectedRow.forEach((row) =>
              row.fulfillments?.forEach((single) => {
                ids.push(single.id);
              })
            );
            window.open(printPreviewUrlExport);
            // không chuyển trạng thái nữa
            // changeMultiOrderStatus(ids, "shipping").then(response => {
            //   if(isFetchApiSuccessful(response)) {
            //   } else {
            //     handleFetchApiError(response, "Chuyển trạng thái nhiều đơn hàng", dispatch)
            //   }
            // }).finally(()=>{
            //   dispatch(hideLoading());
            // })
            break;
          }

        case ACTION_ID.printOrder:

          const printBill = selectedRow.filter((order: any) => order.status === 'finished').map((order: any) => order.id);
          let queryParamOrder = generateQuery({
            action: "print",
            ids: printBill,
            "print-type": "order",
            "print-dialog": true,
          });
          if(selectedRow.length === 1 && selectedRow[0]?.order_return_origin?.id) {
            queryParamOrder = generateQuery({
              action: "print",
              ids: [selectedRow[0]?.order_return_origin?.id],
              "print-type": "order_exchange",
              "print-dialog": true,
            });
          }
          Modal.confirm({
            title: 'In hoá đơn',
            icon: <ExclamationCircleOutlined />,
            content: `Có ${printBill.length} đơn hàng kết thúc. Hệ thống sẽ chỉ in đơn kết thúc. Bạn có muốn tiếp tục?`,
            okText: "Tiếp tục",
            cancelText: "Huỷ",
            onOk() {
              if (printBill.length) {
                const printPreviewOrderUrl = `${process.env.PUBLIC_URL}${UrlConfig.ORDER}/print-preview?${queryParamOrder}`;
                window.open(printPreviewOrderUrl);
              }
            },
            onCancel() {
            },
          });
          break;
        default:
          break;
      }
    },
    [
      ACTION_ID.printOrder,
      ACTION_ID.printShipment,
      ACTION_ID.printStockExport,
      dispatch,
      selectedRow,
      selectedRowKeys,
    ]
  );

  const [listExportFile, setListExportFile] = useState<Array<string>>([]);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [statusExport, setStatusExport] = useState<number>(1);

  useEffect(() => {
    dispatch(
      DeliveryServicesGetList((response: Array<DeliveryServiceResponse>) => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        setDeliveryServices(response);
      })
    );
  }, [dispatch]);

  const onExport = useCallback(
    (optionExport, typeExport) => {
      let newParams: any = { ...params };
      // let hiddenFields = [];
      switch (optionExport) {
        case EXPORT_IDs.allOrders:
          newParams = {};
          break;
        case EXPORT_IDs.ordersOnThisPage:
          break;
        case EXPORT_IDs.selectedOrders:
          newParams = {
            code: selectedRowCodes
          };
          break;
        case EXPORT_IDs.ordersFound:
          delete newParams.page;
          delete newParams.limit;
          break;
        default:
          break;
      }

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
    [
      params,
      selectedRowCodes,
      EXPORT_IDs.allOrders,
      EXPORT_IDs.ordersOnThisPage,
      EXPORT_IDs.selectedOrders,
      EXPORT_IDs.ordersFound,
      listExportFile,
    ]
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

  const setDataAccounts = (data: PageResponse<AccountResponse> | false) => {
    if (!data) {
      return;
    }
    setAccounts(data.items);
  };

  useEffect(() => {
    dispatch(searchAccountPublicAction({ limit: 30 }, setDataAccounts));
    dispatch(ExternalShipperGetListAction((response) => {
      if (response) {
        setShippers(response)
      }
    }));
    dispatch(getListSourceRequest(setListSource));
    dispatch(StoreGetListAction(setStore));
    dispatch(
      PaymentMethodGetList((data) => {
        data.push({
          name: "COD",
          code: "cod",
          id: 0,
        });
        setListPaymentMethod(data);
      })
    );
    const params=  {
      sort_type: "asc",
      sort_column: "display_order",
    }
    dispatch(
      actionFetchListOrderProcessingStatus(
        params,
        (data: OrderProcessingStatusResponseModel) => {
          setListOrderProcessingStatus(data.items);
          setInitListOrderProcessingStatus(data.items);
        }
      )
    );
  }, [dispatch]);

  useEffect(() => {

    let dataQuery: OrderSearchQuery = {
      ...initQuery,
      ...getQueryParamsFromQueryString(queryParamsParsed),
    };

    setPrams(dataQuery);
    handleFetchData(dataQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, handleFetchData, setSearchResult, location.search]);

  return (
    <StyledComponent>
      <ContentContainer
        title={pageTitle.title}
        breadcrumb={pageTitle.breadcrumb}
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
                    onClick={() => { }}
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
              {!isShowOfflineOrder ? (
                <AuthWrapper acceptPermissions={[ODERS_PERMISSIONS.CREATE]} passThrough>
                  {(isPassed: boolean) => (
                    <ButtonCreate
                      path={`${UrlConfig.ORDER}/create`}
                      disabled={!isPassed}
                      child="Thêm mới đơn hàng"
                    />
                  )}
                </AuthWrapper>
              ) : (
                <AuthWrapper acceptPermissions={[ODERS_PERMISSIONS.CREATE]} passThrough>
                  {(isPassed: boolean) => (
                    <a href={process.env.REACT_APP_BASE_POS || ""} target="_blank" rel="noreferrer">
                      <Button
                        type="primary"
                        className="ant-btn-primary"
                        size={"large"}
                        icon={<GoPlus style={{marginRight: "0.2em"}}/>}
                        disabled={!isPassed}
                      >
                        Thêm mới đơn hàng
                      </Button>
                    </a>
                  )}
                </AuthWrapper>
              )}
            </Space>
          </Row>
        }
      >
        <Card>
          <OrdersFilter
            onMenuClick={onMenuClick}
            actions={actions}
            onFilter={onFilter}
            isLoading={isFilter}
            params={params}
            listSource={listSource}
            listStore={listStore}
            accounts={accounts}
            shippers={shippers}
            deliveryService={deliveryServices}
            listPaymentMethod={listPaymentMethod}
            subStatus={listOrderProcessingStatus}
            initSubStatus={initListOrderProcessingStatus}
            onShowColumnSetting={() => setShowSettingColumn(true)}
            onClearFilter={() => onClearFilter()}
            isHideTab={isHideTab}
            isShowOfflineOrder={isShowOfflineOrder}
            setListSource={setListSource}
            setListOrderProcessingStatus={setListOrderProcessingStatus}
          />

          {deliveryServices.length > 0 ? (
            <OrdersTable
              tableLoading={tableLoading}
              data={data}
              columns={columns}
              setColumns={setColumns}
              setData={setData}
              onPageChange={onPageChange}
              onSelectedChange={onSelectedChange}
              setShowSettingColumn={setShowSettingColumn}
              deliveryServices={deliveryServices}
              selectedRowKeys={selectedRowKeys}
              onFilterPhoneCustomer={onFilterPhoneCustomer}
              listStore={listStore}
              isShowOfflineOrder={isShowOfflineOrder}
            />
          ) : "Đang tải dữ liệu..."
          }
        </Card>

        <ModalSettingColumn
          visible={showSettingColumn}
          onCancel={() => setShowSettingColumn(false)}
          onOk={(data) => {
            setShowSettingColumn(false);
            setColumns(data);
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
      </ContentContainer>
    </StyledComponent>
  );
}
export default OrderList;
