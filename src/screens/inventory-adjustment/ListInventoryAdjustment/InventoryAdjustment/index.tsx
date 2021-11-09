import {MenuAction} from "component/table/ActionButton";
import {
  InventoryAdjustmentGetPrintContentAction,
  inventoryGetSenderStoreAction,
} from "domain/actions/inventory/inventory-adjustment.action";
import {Fragment, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useDispatch} from "react-redux";
import InventoryAdjustmentFilters from "../components/InventoryAdjustmentFilter";
import {
  InventoryAdjustmentDetailItem,
  InventoryAdjustmentSearchQuery,
} from "model/inventoryadjustment";
import CustomTable, {ICustomTableColumType} from "component/table/CustomTable";
import {PageResponse} from "model/base/base-metadata.response";
import {getQueryParams, useQuery} from "utils/useQuery";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import {Tag, Space, Card} from "antd";
import {InventoryAdjustmentWrapper} from "./styles";
import {
  INVENTORY_ADJUSTMENT_AUDIT_TYPE_ARRAY,
  STATUS_INVENTORY_ADJUSTMENT,
} from "../constants";
import {ConvertUtcToLocalDate, DATE_FORMAT} from "utils/DateUtils";
import {Link} from "react-router-dom";
import UrlConfig from "config/url.config";
import {generateQuery} from "utils/AppUtils";
import {useHistory} from "react-router-dom";
import {AccountResponse} from "model/account/account.model";
import {AccountSearchAction} from "domain/actions/account/account.action";
import {getListInventoryAdjustmentAction} from "domain/actions/inventory/inventory-adjustment.action";
import {StoreResponse} from "model/core/store.model";
import {useReactToPrint} from "react-to-print";
import purify from "dompurify";
import {STATUS_INVENTORY_ADJUSTMENT_CONSTANTS} from "screens/inventory-adjustment/constants";
import CustomFilter from "component/table/custom.filter";

const ACTIONS_INDEX = {
  PRINT: 1,
  EXPORT: 2,
};

const initQuery: InventoryAdjustmentSearchQuery = {
  page: 1,
  limit: 30,
  condition: null,
  adjusted_store_id: null, 
  from_total_variant: null,
  to_total_variant: null,
  from_total_quantity: null,
  to_total_quantity: null,
  from_total_amount: null,
  to_total_amount: null,
  created_name: [], 
  from_created_date: null,
  to_created_date: null,
  from_audited_date: null,
  to_audited_date: null,
  from_adjusted_date: null,
  to_adjusted_date: null,
  status: [],
  audit_type: [],
};

const actions: Array<MenuAction> = [
  {
    id: ACTIONS_INDEX.PRINT,
    name: "In phiếu",
  },
  {
    id: ACTIONS_INDEX.EXPORT,
    name: "Xuất Excel",
  },
];

const InventoryAdjustment: React.FC = () => {
  const history = useHistory();
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  const query = useQuery();
  const [stores, setStores] = useState<Array<StoreResponse>>([] as Array<StoreResponse>);
  const [tableLoading, setTableLoading] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Array<number>>([]);
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [selected, setSelected] = useState<Array<InventoryAdjustmentDetailItem>>([]);

  const printElementRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => printElementRef.current,
  });

  const [printContent, setPrintContent] = useState("");

  const dispatch = useDispatch();
  let dataQuery: InventoryAdjustmentSearchQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  let [params, setPrams] = useState<InventoryAdjustmentSearchQuery>(dataQuery);
  const [data, setData] = useState<PageResponse<Array<InventoryAdjustmentDetailItem>>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const pageBreak = "<div class='pageBreak'></div>";
  const printContentCallback = useCallback(
    (printContent) => {
      const textResponse = printContent.map((single: any) => {
        return "<div class='singleOrderPrint'>" + single.html_content + "</div>";
      });
      let textResponseFormatted = textResponse.join(pageBreak);
      let result = textResponseFormatted.replaceAll("<p></p>", "");
      setPrintContent(result);
      handlePrint && handlePrint();
    },
    [handlePrint]
  );

  const ActionComponent = () => {
    let Compoment = () => <span>Mã phiếu</span>;
    if (selected?.length > 0) {
      Compoment = () => (
        <CustomFilter onMenuClick={onMenuClick} menu={actions}>
          <Fragment />
        </CustomFilter>
      );
    }
    return <Compoment />;
  };

  const defaultColumns: Array<ICustomTableColumType<InventoryAdjustmentDetailItem>> = [
    {
      title: <ActionComponent />,
      dataIndex: "code",
      visible: true,
      align: "left",
      fixed: "left",
      render: (value: string, row: InventoryAdjustmentDetailItem) => (
        <>
          <Link
            to={`${UrlConfig.INVENTORY_ADJUSTMENT}/${row.id}`}
            style={{fontWeight: 500}}
          >
            {value}
          </Link>
          <br />
          <span style={{fontSize: "12px"}}>
            Ngày tạo: {ConvertUtcToLocalDate(row.created_date, DATE_FORMAT.DDMMYY_HHmm)}
          </span>
        </>
      ),
    },
    {
      title: "Số SP",
      width: 80,
      dataIndex: "total_variant",
      visible: true,
      align: "right",
    },
    {
      title: "Tổng SL",
      width: 90,
      dataIndex: "total_on_hand",
      visible: true,
      align: "right",
      render: (value: number) => {
        return value && value !== 0 ? value : "";
      },
    },
    {
      title: "Thừa/Thiếu",
      width: 140,
      align: "center",
      visible: true,
      render: (item: InventoryAdjustmentDetailItem) => {
        return (
          <Space>
            {!item.total_excess || item.total_excess === 0 ? null : (
              <div style={{color: "#27AE60"}}>+{item.total_excess}</div>
            )}
            {item.total_excess && item.total_missing ? <Space>/</Space> : null}
            {!item.total_missing || item.total_missing === 0 ? null : (
              <div style={{color: "red"}}>{item.total_missing}</div>
            )}
          </Space>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      visible: true,
      width: 100,
      align: "center",
      render: (item: string) => {
        let textTag = "";
        let classTag = "";
        switch (item) {
          case STATUS_INVENTORY_ADJUSTMENT_CONSTANTS.DRAFT:
            textTag = STATUS_INVENTORY_ADJUSTMENT.DRAFT.name;
            classTag = STATUS_INVENTORY_ADJUSTMENT.DRAFT.status;
            break;
          case STATUS_INVENTORY_ADJUSTMENT_CONSTANTS.AUDITED:
            textTag = STATUS_INVENTORY_ADJUSTMENT.AUDITED.name;
            classTag = STATUS_INVENTORY_ADJUSTMENT.AUDITED.status;
            break;
          case STATUS_INVENTORY_ADJUSTMENT_CONSTANTS.ADJUSTED:
            textTag = STATUS_INVENTORY_ADJUSTMENT.ADJUSTED.name;
            classTag = STATUS_INVENTORY_ADJUSTMENT.ADJUSTED.status;
            break;
          default:
            textTag = STATUS_INVENTORY_ADJUSTMENT.DRAFT.name;
            classTag = STATUS_INVENTORY_ADJUSTMENT.DRAFT.status;
            break;
        }
        return <Tag className={classTag}>{textTag}</Tag>;
      },
    },
    {
      title: "Kho kiểm",
      width: 120,
      dataIndex: "adjusted_store_name",
      visible: true,
    },
    {
      title: "Loại kho kiểm",
      dataIndex: "audit_type",
      render: (item: string) => {
        let text = "Một phần";
        const auditType = INVENTORY_ADJUSTMENT_AUDIT_TYPE_ARRAY.find(
          (e) => e.value === item
        );
        if (auditType && item === auditType?.value) {
          text = auditType.name;
        }

        return <Space>{text}</Space>;
      },
      visible: true,
      width: 120,
    },
    {
      title: "Người tạo",
      width: 140,
      visible: true,
      align: "left",
      render: (item: InventoryAdjustmentDetailItem) => {
        return (
          <div>
            <div>
              <b>{item.created_code ?? ""}</b>
            </div>
            <div>
              <b>{item.created_by}</b>
            </div>
          </div>
        );
      },
    },
    {
      title: "Ngày kiểm",
      width: 100,
      dataIndex: "audited_date",
      visible: true,
      align: "left",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYYY)}</div>,
    },
    {
      title: "Cân tồn kho",
      visible: true,
      render: (item: InventoryAdjustmentDetailItem) => {
        return (
          <div>
            <div>
            <b>{item.adjusted_code ?? ""}</b>
            </div>
            <div>
              <b>{item.adjusted_by}</b>
            </div>
            <div>{ConvertUtcToLocalDate(item.adjusted_date, DATE_FORMAT.DDMMYYY)}</div>
          </div>
        );
      },
    },
  ];

  const [columns, setColumn] =
    useState<Array<ICustomTableColumType<InventoryAdjustmentDetailItem>>>(defaultColumns);

  useEffect(() => {
    setColumn(defaultColumns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      setPrams({...params});
    },
    [params]
  );

  const columnFinal = useMemo(
    () => columns.filter((item) => item.visible === true),
    [columns]
  );

  const setSearchResult = useCallback(
    (result: PageResponse<Array<InventoryAdjustmentDetailItem>> | false) => {
      setTableLoading(true);
      if (!!result) {
        setData(result);
        setTableLoading(false);
      }
    },
    []
  );

  const setDataAccounts = useCallback((data: PageResponse<AccountResponse> | false) => {
    if (!data) {
      return;
    }
    setAccounts(data.items);
  }, []);

  const onFilter = useCallback(
    (values) => {
      let newPrams = {...params, ...values, page: 1};
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.push(`${UrlConfig.INVENTORY_ADJUSTMENT}?${queryParam}`);
    },
    [history, params]
  );

  const printTicketAction = useCallback(
    (index: number) => {
      let params = {
        ids: selectedRowKeys,
      };

      const queryParam = generateQuery(params);
      dispatch(
        InventoryAdjustmentGetPrintContentAction(queryParam, printContentCallback)
      );
    },
    [dispatch, printContentCallback, selectedRowKeys]
  );

  const onMenuClick = useCallback(
    (index: number) => {
      switch (index) {
        case ACTIONS_INDEX.PRINT:
          printTicketAction(index);
          break;
        default:
          break;
      }
    },
    [printTicketAction]
  );
 
  const onClearFilter = useCallback(() => {
    setPrams(initQuery);
    let queryParam = generateQuery(initQuery);
    history.push(`${UrlConfig.INVENTORY_ADJUSTMENT}?${queryParam}`);
  }, [history]);

  const onSelectedChange = useCallback(
    (selectedRow: Array<InventoryAdjustmentDetailItem>) => {
      const selectedRowKeys = selectedRow.map((row) => row.id);
      setSelectedRowKeys(selectedRowKeys);

      setSelected(
        selectedRow.filter(function (el) {
          return el !== undefined;
        })
      );
    },
    []
  );

  //get store
  useEffect(() => {
    dispatch(AccountSearchAction({}, setDataAccounts));
    dispatch(inventoryGetSenderStoreAction({status: "active", simple: true}, setStores));
  }, [dispatch, setDataAccounts]);

  //get list
  useEffect(() => {
    dispatch(getListInventoryAdjustmentAction(params, setSearchResult));
  }, [history, dispatch, params, setSearchResult]);

  return (
    <InventoryAdjustmentWrapper>
      <Card>
        <InventoryAdjustmentFilters
          onShowColumnSetting={() => setShowSettingColumn(true)}
          accounts={accounts}
          params={params}
          stores={stores}
          actions={actions}
          onMenuClick={onMenuClick}
          onFilter={onFilter}
          onClearFilter={() => onClearFilter()}
        />

        <CustomTable
          isRowSelection
          isLoading={tableLoading}
          scroll={{x: 1300}}
          sticky={{offsetScroll: 5, offsetHeader: 55}}
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
          rowKey={(item: InventoryAdjustmentDetailItem) => item.id}
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
        <div style={{display: "none"}}>
          <div className="printContent" ref={printElementRef}>
            <div
              dangerouslySetInnerHTML={{
                __html: purify.sanitize(printContent),
              }}
            ></div>
          </div>
        </div>
      </Card>
    </InventoryAdjustmentWrapper>
  );
};

export default InventoryAdjustment;
