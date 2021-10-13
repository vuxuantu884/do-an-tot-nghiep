import { Button, Card, Row, Space } from "antd";
import { MenuAction } from "component/table/ActionButton";
import { PageResponse } from "model/base/base-metadata.response";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import { useDispatch } from "react-redux";
import ReturnFilter from "component/filter/return.filter";
import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import { ReturnModel, ReturnSearchQuery } from "model/order/return.model";
import { AccountResponse } from "model/account/account.model";
import exportIcon from "assets/icon/export.svg";
import UrlConfig from "config/url.config";
import ContentContainer from "component/container/content.container";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import {
  getListReasonRequest,
  getReturnsAction,
} from "domain/actions/order/order.action";
import "./scss/index.screen.scss";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { getListSourceRequest } from "domain/actions/product/source.action";
import { SourceResponse } from "model/response/order/source.response";
import { StoreResponse } from "model/core/store.model";
import { StoreGetListAction } from "domain/actions/core/store.action";
import NumberFormat from "react-number-format";
import { exportFile, getFile } from "service/other/export.service";
import { HttpStatus } from "config/http-status.config";
import { showError, showSuccess } from "utils/ToastUtils";
import ExportModal from "./modal/export.modal";

const actions: Array<MenuAction> = [
  {
    id: 1,
    name: "Xóa",
  },
  {
    id: 2,
    name: "Export",
  },
];

const initQuery: ReturnSearchQuery = {
  page: 1,
  limit: 30,
  sort_type: null,
  sort_column: null,
  search_term: null,
  created_on_min: null,
  created_on_max: null,
  // created_on_predefined: null,
  received_on_min: null,
  received_on_max: null,
  received_predefined: null,
  payment_status: [],
  assignee_code: [],
  price_min: null,
  price_max: null,
  store_ids: [],
  is_received: [],
  account_codes: [],
  reason_ids: [],
};

const ListOrderScreen: React.FC = () => {
  const query = useQuery();
  const history = useHistory();
  const dispatch = useDispatch();

  const [tableLoading, setTableLoading] = useState(true);
  const isFirstLoad = useRef(true);
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

  const [columns, setColumn] = useState<
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
              ? ConvertUtcToLocalDate(record.created_date)
              : ""}
          </div>
        </div>
      ),
      visible: true,
      fixed: "left",
      // width: "10%",
    },
    {
      title: "Mã đơn hàng",
      render: (record: ReturnModel) => (
        <Link target="_blank" to={`${UrlConfig.ORDER}/${record.order_id}`}>
          {record.code_order}
        </Link>
      ),
      visible: true,
      // width: "10%",
    },
    {
      title: "Người nhận",
      render: (record: any) => (
        <div className="customer">
          <div className="name p-b-3" style={{ color: "#2A2A86" }}>
            <Link
              target="_blank"
              to={`${UrlConfig.CUSTOMER}/${record.customer_id}`}
            >
              {record.customer_name}
            </Link>
          </div>
          <div className="p-b-3">{record.customer_phone_number}</div>
          <div className="p-b-3">{record.customer_email}</div>
        </div>
      ),
      key: "customer",
      visible: true,
      // width: "20%",
    },
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
      // width: "10%",
    },
    {
      title: "Hoàn tiền",
      //dataIndex: "total_amount",
      render: (record: any) => {
        let processIcon = null;
        switch (record.payment_status) {
          case "unpaid":
            processIcon = "icon-blank";
            break;
          default:
            processIcon = "icon-full";
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
    },

    {
      title: "Tổng tiền",
      render: (record: any) => (
        <>
          <span>
            <NumberFormat
              value={record.total_amount}
              className="foo"
              displayType={"text"}
              thousandSeparator={true}
            />
          </span>
        </>
      ),
      key: "total_amount",
      visible: true,
      align: "center",
    },

    {
      title: "Ngày nhận hàng",
      dataIndex: "receive_date",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
      key: "total_amount",
      visible: true,
      align: "center",
    },
    {
      title: "Lý do trả",
      dataIndex: "reason",
      key: "reason",
      visible: true,
      align: "center",
    },
  ]);

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setPrams({ ...params });
      history.replace(`${UrlConfig.ORDERS_RETURN}?${queryParam}`);
    },
    [history, params]
  );
  const onFilter = useCallback(
    (values) => {
      console.log("values filter 1", values);
      let newPrams = { ...params, ...values, page: 1 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.push(`${UrlConfig.ORDERS_RETURN}?${queryParam}`);
    },
    [history, params]
  );

  const onClearFilter = useCallback(
    () => {
      setPrams(initQuery);
      let queryParam = generateQuery(initQuery);
      history.push(`${UrlConfig.ORDERS_RETURN}?${queryParam}`);
    },
    [history]
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

  const onExport = useCallback((optionExport, typeExport) => {
    let newParams:any = {...params};
    // let hiddenFields = [];
    console.log('selectedRowCodes', selectedRowCodes);
    switch (optionExport) {
      case 1: newParams = {}
        break
      case 2: break
      case 3:
        newParams.code_order_return = selectedRowCodes;
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
  const onMenuClick = useCallback((index: number) => {}, []);

  const setSearchResult = useCallback(
    (result: PageResponse<ReturnModel> | false) => {
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
    dispatch(getReturnsAction(params, setSearchResult));
  }, [dispatch, params, setSearchResult]);

  useEffect(() => {
    dispatch(AccountSearchAction({}, setDataAccounts));
    dispatch(getListSourceRequest(setListSource));
    dispatch(StoreGetListAction(setStore));
    dispatch(getListReasonRequest(setReasons));
  }, [dispatch, setDataAccounts]);

  return (
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
            <Button
              type="default"
              className="light"
              size="large"
              icon={<img src={exportIcon} style={{ marginRight: 8 }} alt="" />}
              // onClick={onExport}
              onClick={() => {
                setShowExportModal(true);
              }}
            >
              Xuất file
            </Button>
            {/* <ButtonCreate path={`${UrlConfig.ORDER}/create`} /> */}
          </Space>
        </Row>
      }
    >
      <Card>
        <div className="padding-20">
          <ReturnFilter
            onMenuClick={onMenuClick}
            actions={actions}
            onFilter={onFilter}
            isLoading={tableLoading}
            params={params}
            listSource={listSource}
            listStore={listStore}
            accounts={accounts}
            reasons={reasons}
            onShowColumnSetting={() => setShowSettingColumn(true)}
            onClearFilter={() => onClearFilter()}
          />
          <CustomTable
            isRowSelection
            isLoading={tableLoading}
            showColumnSetting={true}
            scroll={{ x: 200 }}
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
      {showExportModal && <ExportModal
          visible={showExportModal}
          onCancel={() => {
            setShowExportModal(false)
            setExportProgress(0)
            setStatusExport(1)
          }}
          onOk={(optionExport, typeExport) => onExport(optionExport, typeExport)}
          type="returns"
          total={data.metadata.total}
          exportProgress={exportProgress}
          statusExport={statusExport}
          selected={selectedRowCodes.length ? true : false}
        />}
    </ContentContainer>
  );
};

export default ListOrderScreen;
