import { MenuAction } from "component/table/ActionButton";
import {
  getListInventoryAdjustmentAction,
  InventoryAdjustmentGetPrintContentAction,
  inventoryGetSenderStoreAction,
  updateInventoryAdjustmentAction,
} from "domain/actions/inventory/inventory-adjustment.action";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import InventoryAdjustmentFilters from "../components/InventoryAdjustmentFilter";
import {
  InventoryAdjustmentDetailItem,
  InventoryAdjustmentExportField,
  InventoryAdjustmentSearchQuery,
} from "model/inventoryadjustment";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { PageResponse } from "model/base/base-metadata.response";
import { getQueryParams, useQuery } from "utils/useQuery";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { Button, Card, Space, Tag } from "antd";
import { InventoryAdjustmentWrapper } from "./styles";
import { INVENTORY_ADJUSTMENT_AUDIT_TYPE_ARRAY, STATUS_INVENTORY_ADJUSTMENT } from "../constants";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { HttpStatus } from "config/http-status.config";
import { Link, useHistory } from "react-router-dom";
import UrlConfig from "config/url.config";
import { formatCurrency, generateQuery } from "utils/AppUtils";
import { AccountResponse } from "model/account/account.model";
import { searchAccountPublicAction } from "domain/actions/account/account.action";
import { StoreResponse } from "model/core/store.model";
import { useReactToPrint } from "react-to-print";
import purify from "dompurify";
import { STATUS_INVENTORY_ADJUSTMENT_CONSTANTS } from "screens/inventory-adjustment/constants";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import { exportFile, getFile } from "service/other/import.inventory.service";
import { STATUS_IMPORT_EXPORT } from "screens/inventory-adjustment/DetailInvetoryAdjustment";
import InventoryTransferExportModal from "screens/inventory-adjustment/DetailInvetoryAdjustment/conponents/ExportModal";
import { InventoryAdjustmentPermission } from "config/permissions/inventory-adjustment.permission";
import useAuthorization from "hook/useAuthorization";
import InventoryReportIcon from "assets/icon/inventory-report.svg";
import InventoryReportModal from "../components/InventoryReportModal";
import EditPopover from "../../../inventory-defects/ListInventoryDefect/components/EditPopover";
import { primaryColor } from "utils/global-styles/variables";
import useHandleFilterColumns from "hook/table/useHandleTableColumns";
import { COLUMN_CONFIG_TYPE, OFFSET_HEADER_UNDER_NAVBAR, TYPE_EXPORT } from "utils/Constants";
import useSetTableColumns from "hook/table/useSetTableColumns";
import { ExportModal } from "../../../../component";
import { utils, writeFile } from "xlsx";
import moment from "moment";
import { callApiNative } from "utils/ApiUtils";
import { getListInventoryAdjustmentApi } from "service/inventory/adjustment/index.service";

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

type InventoryAdjustmentProps = {
  isExportConditionRecord: boolean;
  setExportConditionRecord: (value: boolean) => void;
};

let firstLoad = true;

const InventoryAdjustment = (props: InventoryAdjustmentProps) => {
  const { isExportConditionRecord, setExportConditionRecord } = props;
  const history = useHistory();
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  const query = useQuery();
  const [stores, setStores] = useState<Array<StoreResponse>>([] as Array<StoreResponse>);
  const [tableLoading, setTableLoading] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Array<number>>([]);
  const [selectedRowData, setSelectedRowData] = useState<Array<InventoryAdjustmentDetailItem>>([]);
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);

  const [showExportModal, setShowExportModal] = useState(false);
  const [statusExport, setStatusExport] = useState<number>(STATUS_IMPORT_EXPORT.DEFAULT);
  const [listExportFile, setListExportFile] = useState<Array<string>>([]);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [inventoryIdSelected, setInventoryIdSelected] = useState<number | null>(null);

  const [conditionExportProgress, setConditionExportProgress] = useState<number>(0);
  const [statusConditionExport, setStatusConditionExport] = useState<number>(0);

  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoadingExport, setIsLoadingExport] = useState<boolean>(false);

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

  //phân quyền
  const [allowPrint] = useAuthorization({
    acceptPermissions: [InventoryAdjustmentPermission.print],
  });
  const [allowExportTicket] = useAuthorization({
    acceptPermissions: [InventoryAdjustmentPermission.export],
  });

  const actions: Array<MenuAction> = [
    {
      id: ACTIONS_INDEX.PRINT,
      name: "In phiếu",
      disabled: !allowPrint,
    },
    {
      id: ACTIONS_INDEX.EXPORT,
      name: "Xuất Excel",
      disabled: !allowExportTicket,
    },
  ];

  const getItemsByCondition = useCallback(
    async (type: string) => {
      let res: any;
      let items: any = [];
      const limit = 50;
      let times = 0;

      setStatusConditionExport(STATUS_IMPORT_EXPORT.CREATE_JOB_SUCCESS);
      switch (type) {
        case TYPE_EXPORT.page:
          res = await callApiNative(
            { isShowLoading: false },
            dispatch,
            getListInventoryAdjustmentApi,
            { ...params, limit: params.limit ?? 50 },
          );
          if (res) {
            items = items.concat(res.items);
          }
          break;
        case TYPE_EXPORT.selected:
          items = selectedRowData;
          break;
        case TYPE_EXPORT.all:
          const roundAll = Math.round(data.metadata.total / limit);
          times = roundAll < data.metadata.total / limit ? roundAll + 1 : roundAll;

          for (let index = 1; index <= times; index++) {
            const res = await callApiNative(
              { isShowLoading: false },
              dispatch,
              getListInventoryAdjustmentApi,
              { ...params, page: index, limit: limit },
            );
            if (res) {
              items = items.concat(res.items);
            }
            const percent = Math.round(Number.parseFloat((index / times).toFixed(2)) * 100);
            setConditionExportProgress(percent);
          }

          break;
        case TYPE_EXPORT.allin:
          if (!totalItems || totalItems === 0) {
            break;
          }
          const roundAllin = Math.round(totalItems / limit);
          times = roundAllin < totalItems / limit ? roundAllin + 1 : roundAllin;

          for (let index = 1; index <= times; index++) {
            const res = await callApiNative(
              { isShowLoading: false },
              dispatch,
              getListInventoryAdjustmentApi,
              { ...params, page: index, limit: limit },
            );
            if (res) {
              items = items.concat(res.items);
            }
            const percent = Math.round(Number.parseFloat((index / times).toFixed(2)) * 100);
            setConditionExportProgress(percent);
          }
          break;
        default:
          break;
      }
      setConditionExportProgress(100);
      return items;
    },
    [dispatch, selectedRowData, params, data, totalItems],
  );

  const convertItemExport = (item: InventoryAdjustmentDetailItem) => {
    let textTag: string;
    switch (item.status) {
      case STATUS_INVENTORY_ADJUSTMENT_CONSTANTS.DRAFT:
        textTag = STATUS_INVENTORY_ADJUSTMENT.DRAFT.name;
        break;
      case STATUS_INVENTORY_ADJUSTMENT_CONSTANTS.AUDITED:
        textTag = STATUS_INVENTORY_ADJUSTMENT.AUDITED.name;
        break;
      case STATUS_INVENTORY_ADJUSTMENT_CONSTANTS.ADJUSTED:
        textTag = STATUS_INVENTORY_ADJUSTMENT.ADJUSTED.name;
        break;
      case STATUS_INVENTORY_ADJUSTMENT_CONSTANTS.CANCELED:
        textTag = STATUS_INVENTORY_ADJUSTMENT.CANCELED.name;
        break;
      default:
        textTag = STATUS_INVENTORY_ADJUSTMENT.DRAFT.name;
        break;
    }

    let auditTypeText = "Một phần";
    const auditType = INVENTORY_ADJUSTMENT_AUDIT_TYPE_ARRAY.find((e) => e.value === item.audit_type);
    if (auditType && item.audit_type === auditType?.value) {
      auditTypeText = auditType.name;
    }

    return {
      [InventoryAdjustmentExportField.code]: item.code,
      [InventoryAdjustmentExportField.adjusted_store_id]: item.adjusted_store_id,
      [InventoryAdjustmentExportField.adjusted_store_name]: item.adjusted_store_name,
      [InventoryAdjustmentExportField.total_variant]: formatCurrency(item.total_variant, "."),
      [InventoryAdjustmentExportField.total_on_hand]: formatCurrency(item.total_on_hand, "."),
      [InventoryAdjustmentExportField.total_excess]: formatCurrency(item.total_excess, "."),
      [InventoryAdjustmentExportField.total_missing]: formatCurrency(item.total_missing, "."),
      [InventoryAdjustmentExportField.status]: textTag,
      [InventoryAdjustmentExportField.audit_type]: auditTypeText,
      [InventoryAdjustmentExportField.note]: item.note && item.note !== "" && item.note.trim().replaceAll("\n", ""),
      [InventoryAdjustmentExportField.created_by]: item.created_by,
      [InventoryAdjustmentExportField.created_name]: item.created_name,
      [InventoryAdjustmentExportField.adjusted_by]: item.adjusted_by,
      [InventoryAdjustmentExportField.adjusted_code]: item.adjusted_code,
      [InventoryAdjustmentExportField.adjusted_date]: ConvertUtcToLocalDate(item.adjusted_date, DATE_FORMAT.DD_MM_YY_HHmmss)
    };
  };

  const actionExport = {
    Ok: async (typeExport: string) => {
      setStatusConditionExport(STATUS_IMPORT_EXPORT.DEFAULT);
      setIsLoadingExport(true);
      let dataExport: any = [];
      if (typeExport === TYPE_EXPORT.selected && selectedRowData && selectedRowData.length === 0) {
        setStatusConditionExport(0);
        showWarning("Bạn chưa chọn bản ghi nào để xuất file");
        setExportConditionRecord(false);
        return;
      }
      const res = await getItemsByCondition(typeExport);
      if (!res || res.length === 0) {
        setStatusConditionExport(0);
        showWarning("Không có bản ghi nào đủ điều kiện");
        return;
      }

      const workbook = utils.book_new();
      for (let i = 0; i < res.length; i++) {
        const e: InventoryAdjustmentDetailItem = res[i];
        const item = convertItemExport(e);
        dataExport.push(item);
      }

      const worksheet = utils.json_to_sheet(dataExport);
      worksheet['!cols'] = [
        { wch: 15 },
        { wch: 10 },
        { wch: 18 },
        { wch: 18 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 10 },
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 18 }
      ];
      utils.book_append_sheet(workbook, worksheet, "data");

      setStatusConditionExport(STATUS_IMPORT_EXPORT.JOB_FINISH);
      setIsLoadingExport(false);
      const today = moment(new Date(), "YYYY/MM/DD");
      const month = today.format("M");
      const day = today.format("D");
      const year = today.format("YYYY");
      writeFile(workbook, `inventory_adjustment_${day}_${month}_${year}.xlsx`);
      setExportConditionRecord(false);
      setConditionExportProgress(0);
      setStatusConditionExport(0);
    },
    Cancel: () => {
      setExportConditionRecord(false);
      setConditionExportProgress(0);
      setStatusConditionExport(0);
    },
  };

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
    [handlePrint],
  );

  const editNote = (note: string, row: InventoryAdjustmentDetailItem) => {
    let newData: any = row;
    newData.note = note;

    if (row?.id) {
      dispatch(
        updateInventoryAdjustmentAction(row.id, newData, (result) => {
          if (result) showSuccess(`Cập nhật ${row?.code} thành công`);
          dispatch(getListInventoryAdjustmentAction(params, setSearchResult));
        }),
      );
    }
  };

  const defaultColumns: Array<ICustomTableColumType<InventoryAdjustmentDetailItem>> = [
    {
      title: "Mã phiếu",
      dataIndex: "code",
      key: "code",
      visible: true,
      align: "left",
      fixed: "left",
      width: 150,
      render: (value: string, row: InventoryAdjustmentDetailItem) => (
        <>
          <Link to={`${UrlConfig.INVENTORY_ADJUSTMENTS}/${row.id}`} style={{ fontWeight: 500 }}>
            {value}
          </Link>
          <br />
          <span style={{ fontSize: "12px" }}>
            Ngày tạo: {ConvertUtcToLocalDate(row.created_date, DATE_FORMAT.DDMMYYY)}
          </span>
          <div>
            {row.status === STATUS_INVENTORY_ADJUSTMENT_CONSTANTS.ADJUSTED && (
              <Button
                size="small"
                onClick={() => {
                  setIsOpenModal(true);
                  setInventoryIdSelected(row.id);
                }}
                className="btn-report"
                icon={
                  <img
                    className="icon-report"
                    src={InventoryReportIcon}
                    alt="inventory-report-icon"
                  />
                }
              >
                Xem báo cáo kiểm
              </Button>
            )}
          </div>
        </>
      ),
    },
    {
      title: "Số SP",
      width: 80,
      dataIndex: "total_variant",
      key: "total_variant",
      visible: true,
      align: "right",
      render: (value: number) => {
        return formatCurrency(value, ".");
      },
    },
    {
      title: "Tổng SL",
      width: 90,
      dataIndex: "total_on_hand",
      key: "total_on_hand",
      visible: true,
      align: "right",
      render: (value: number) => {
        return formatCurrency(value, ".");
      },
    },
    {
      title: "Thừa/Thiếu",
      width: 140,
      key: "ratio",
      align: "center",
      visible: true,
      render: (item: InventoryAdjustmentDetailItem) => {
        return (
          <div className="ellipses-text">
            {!item.total_excess || item.total_excess === 0 ? null : (
              <div style={{ color: "#27AE60" }}>+{formatCurrency(item.total_excess, ".")}</div>
            )}
            {item.total_excess && item.total_missing ? <Space>/</Space> : null}
            {!item.total_missing || item.total_missing === 0 ? null : (
              <div style={{ color: "red" }}>{formatCurrency(item.total_missing, ".")}</div>
            )}
          </div>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      visible: true,
      width: 150,
      align: "center",
      render: (item: string) => {
        let textTag: string;
        let classTag: string;
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
          case STATUS_INVENTORY_ADJUSTMENT_CONSTANTS.CANCELED:
            textTag = STATUS_INVENTORY_ADJUSTMENT.CANCELED.name;
            classTag = STATUS_INVENTORY_ADJUSTMENT.CANCELED.status;
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
      key: "adjusted_store_name",
      visible: true,
    },
    {
      title: "Loại kho kiểm",
      dataIndex: "audit_type",
      key: "audit_type",
      render: (item: string) => {
        let text = "Một phần";
        const auditType = INVENTORY_ADJUSTMENT_AUDIT_TYPE_ARRAY.find((e) => e.value === item);
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
      key: "created_by",
      align: "left",
      render: (value, item: InventoryAdjustmentDetailItem) => {
        return (
          <div>
            {item.created_name ? (
              <div>
                <Link target="_blank" to={`${UrlConfig.ACCOUNTS}/${item.created_by}`}>
                  {item.created_name}
                </Link>
              </div>
            ) : (
              ""
            )}
            <div>{item.created_by ?? ""}</div>
          </div>
        );
      },
    },
    {
      title: "Ngày kiểm",
      width: 100,
      dataIndex: "audited_date",
      key: "audited_date",
      visible: true,
      align: "left",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYYY)}</div>,
    },
    {
      title: "Cân tồn kho",
      key: "balance",
      visible: true,
      render: (item: InventoryAdjustmentDetailItem) => {
        return (
          <div>
            <div>{item.adjusted_code ?? ""}</div>
            <div>{item.adjusted_by ?? ""}</div>
            <div>{ConvertUtcToLocalDate(item.adjusted_date, DATE_FORMAT.DDMMYYY)}</div>
          </div>
        );
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      visible: true,
      align: "left",
      width: "220px",
      render: (item: string, row: InventoryAdjustmentDetailItem) => {
        return (
          <div className="single">
            <EditPopover
              content={item}
              title={`Sửa ghi chú ${row?.code}`}
              color={primaryColor}
              onOk={(newNote) => {
                editNote(newNote, row);
              }}
            />
          </div>
        );
      },
    },
  ];

  const onExport = useCallback(() => {
    exportFile({
      conditions: selectedRowKeys[0].toString(),
      type: "EXPORT_INVENTORY_ADJUSTMENT",
    })
      .then((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          setStatusExport(STATUS_IMPORT_EXPORT.CREATE_JOB_SUCCESS);
          showSuccess("Đã gửi yêu cầu xuất file");
          setListExportFile([...listExportFile, response.data.code]);
        }
      })
      .catch(() => {
        setStatusExport(STATUS_IMPORT_EXPORT.ERROR);
        showError("Có lỗi xảy ra, vui lòng thử lại sau");
      });
  }, [listExportFile, selectedRowKeys]);

  const checkExportFile = useCallback(() => {
    let getFilePromises = listExportFile.map((code) => {
      return getFile(code);
    });
    Promise.all(getFilePromises).then((responses) => {
      responses.forEach((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          if (response.data.percent) {
            setExportProgress(response.data.percent);
          }
          if (response.data && response.data.status === "FINISH") {
            setStatusExport(STATUS_IMPORT_EXPORT.JOB_FINISH);
            const fileCode = response.data.code;
            const newListExportFile = listExportFile.filter((item) => {
              return item !== fileCode;
            });
            var downLoad = document.createElement("a");
            downLoad.href = response.data.url;
            downLoad.download = "download";

            downLoad.click();

            setListExportFile(newListExportFile);
          }
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

  const [columns, setColumn] =
    useState<Array<ICustomTableColumType<InventoryAdjustmentDetailItem>>>(defaultColumns);

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      setPrams({ ...params });
      let queryParam = generateQuery(params);
      history.push(`${UrlConfig.INVENTORY_ADJUSTMENTS}?${queryParam}`);
    },
    [params, history],
  );

  const columnFinal = useMemo(() => columns.filter((item) => item.visible === true), [columns]);

  const setSearchResult = useCallback(
    (result: PageResponse<Array<InventoryAdjustmentDetailItem>> | false) => {
      setTableLoading(true);
      if (!!result) {
        setData(result);
        if (firstLoad) {
          setTotalItems(result.metadata.total);
        }
        firstLoad = false;
        setTableLoading(false);
      }
    },
    [],
  );

  const setDataAccounts = useCallback((data: PageResponse<AccountResponse> | false) => {
    if (!data) {
      return;
    }
    setAccounts((account) => {
      return [...account, ...data.items];
    });
  }, []);

  const onFilter = useCallback(
    (values) => {
      setTableLoading(true);
      let newPrams = { ...params, ...values, page: 1 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.push(`${UrlConfig.INVENTORY_ADJUSTMENTS}?${queryParam}`);
    },
    [history, params],
  );

  const printTicketAction = useCallback(() => {
    let params = {
      ids: selectedRowKeys,
    };

    const queryParam = generateQuery(params);
    dispatch(InventoryAdjustmentGetPrintContentAction(queryParam, printContentCallback));
  }, [dispatch, printContentCallback, selectedRowKeys]);

  const onMenuClick = useCallback(
    (index: number) => {
      if (selectedRowKeys && selectedRowKeys.length === 0) {
        showWarning("Cần chọn ít nhất một phiếu kiểm.");
        return;
      }
      switch (index) {
        case ACTIONS_INDEX.PRINT:
          printTicketAction();
          break;
        case ACTIONS_INDEX.EXPORT:
          if (selectedRowKeys.length > 1) {
            showError("Chỉ chọn 1 phiếu");
          } else if (selectedRowKeys.length === 1) {
            setShowExportModal(true);
            onExport();
          } else {
            showError("Vui lòng chọn 1 phiếu để export");
          }
          break;
        default:
          break;
      }
    },
    [onExport, printTicketAction, selectedRowKeys],
  );

  const onClearFilter = useCallback(() => {
    setPrams(initQuery);
    let queryParam = generateQuery(initQuery);
    history.push(`${UrlConfig.INVENTORY_ADJUSTMENTS}?${queryParam}`);
  }, [history]);

  const onSelectedChange = useCallback(
    (
      selectedRow: Array<InventoryAdjustmentDetailItem>,
      selected: boolean | undefined,
      changeRow: any,
    ) => {
      const newSelectedRowKeys = changeRow.map((row: any) => row.id);

      if (selected) {
        setSelectedRowKeys([...selectedRowKeys, ...newSelectedRowKeys]);
        setSelectedRowData([...selectedRowData, ...changeRow]);
        return;
      }

      const newSelectedRowKeysByDeselected = selectedRowKeys.filter((item) => {
        const findIndex = changeRow.findIndex((row: any) => row.id === item);

        return findIndex === -1;
      });

      const newSelectedRowByDeselected = selectedRowData.filter((item) => {
        const findIndex = changeRow.findIndex((row: any) => row.id === item.id);

        return findIndex === -1;
      });

      setSelectedRowKeys(newSelectedRowKeysByDeselected);
      setSelectedRowData(newSelectedRowByDeselected);
    },
    [selectedRowData, selectedRowKeys],
  );

  //get store
  useEffect(() => {
    dispatch(searchAccountPublicAction({ page: 1 }, setDataAccounts));
    dispatch(inventoryGetSenderStoreAction({ status: "active", simple: true }, setStores));
  }, [dispatch, setDataAccounts]);

  //get list
  useEffect(() => {
    dispatch(getListInventoryAdjustmentAction(params, setSearchResult));
  }, [history, dispatch, params, setSearchResult]);

  const { tableColumnConfigs, onSaveConfigTableColumn } = useHandleFilterColumns(
    COLUMN_CONFIG_TYPE.COLUMN_INVENTORY_ADJUSTMENT,
  );
  useSetTableColumns(
    COLUMN_CONFIG_TYPE.COLUMN_INVENTORY_ADJUSTMENT,
    tableColumnConfigs,
    defaultColumns,
    setColumn,
  );

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
          setAccounts={(data) => {
            setAccounts((account) => {
              return [...data, ...account];
            });
          }}
        />

        <CustomTable
          bordered
          isRowSelection
          isLoading={tableLoading}
          scroll={{ x: "max-content" }}
          sticky={{ offsetScroll: 5, offsetHeader: OFFSET_HEADER_UNDER_NAVBAR }}
          pagination={{
            pageSize: data.metadata.limit,
            total: data.metadata.total,
            current: data.metadata.page,
            showSizeChanger: true,
            onChange: onPageChange,
            onShowSizeChange: onPageChange,
          }}
          selectedRowKey={selectedRowKeys}
          onSelectedChange={(selectedRows, selected, changeRow) =>
            onSelectedChange(selectedRows, selected, changeRow)
          }
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
            onSaveConfigTableColumn(data);
          }}
          data={columns}
        />
        {showExportModal && (
          <InventoryTransferExportModal
            visible={showExportModal}
            onCancel={() => {
              setShowExportModal(false);
              setExportProgress(0);
              setStatusExport(STATUS_IMPORT_EXPORT.DEFAULT);
            }}
            onOk={() => onExport()}
            exportProgress={exportProgress}
            statusExport={statusExport}
          />
        )}
        <div style={{ display: "none" }}>
          <div className="printContent" ref={printElementRef}>
            <div
              dangerouslySetInnerHTML={{
                __html: purify.sanitize(printContent),
              }}
            />
          </div>
        </div>

        {isOpenModal && (
          <InventoryReportModal
            inventoryId={inventoryIdSelected}
            visible={isOpenModal}
            onCancel={() => setIsOpenModal(false)}
          />
        )}

        <ExportModal
          onCancel={actionExport.Cancel}
          onOk={actionExport.Ok}
          isVisible={isExportConditionRecord}
          exportProgress={conditionExportProgress}
          statusExport={statusConditionExport}
          isHideOptionAll
          moduleText="phiếu kiểm"
          isLoading={isLoadingExport}
        />
      </Card>
    </InventoryAdjustmentWrapper>
  );
};

export default InventoryAdjustment;
