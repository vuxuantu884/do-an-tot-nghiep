import { MenuAction } from "component/table/ActionButton";
import {
  actionCancelTicketByIds,
  actionExportInventoryByIds,
  getListInventoryTransferAction,
} from "domain/actions/inventory/stock-transfer/stock-transfer.action";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";

import InventoryFilters from "../../Components/FIlter/InventoryListFilter";
import {
  DataExport,
  InventoryTransferDetailItem,
  InventoryTransferSearchQuery,
  LineItem,
} from "model/inventory/transfer";
import CustomTable from "component/table/CustomTable";
import purify from "dompurify";

import { PageResponse } from "model/base/base-metadata.response";
import { VariantResponse } from "model/product/product.model";
import { getQueryParams, useQuery } from "utils/useQuery";
import WarningRedIcon from "assets/icon/ydWarningRedIcon.svg";

import ModalSettingColumn from "component/table/ModalSettingColumn";
import { Modal, Button, Row, Typography } from "antd";
import { InventoryTransferTabWrapper } from "./styles";
import { STATUS_INVENTORY_TRANSFER, STATUS_INVENTORY_TRANSFER_ARRAY } from "../../../constants";

import confirmedIcon from "assets/icon/cho_chuyen.svg";
import transferringIcon from "assets/icon/dang_chuyen.svg";
import pendingIcon from "assets/icon/cho_xu_ly.svg";
import receivedIcon from "assets/icon/da_nhan.svg";
import canceledIcon from "assets/icon/da_huy.svg";

import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import {
  BarsOutlined,
  CopyOutlined,
  PrinterOutlined,
  ExportOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import UrlConfig, { InventoryTransferTabUrl } from "config/url.config";

import { formatCurrency, generateQuery } from "utils/AppUtils";
import { useHistory } from "react-router-dom";
import { AccountResponse } from "model/account/account.model";

import { showSuccess, showWarning } from "utils/ToastUtils";
import DeleteTicketModal from "screens/inventory/common/DeleteTicketPopup";
import { useReactToPrint } from "react-to-print";

import { PrinterInventoryTransferResponseModel } from "model/response/printer.response";
import { actionFetchPrintFormByInventoryTransferIds } from "domain/actions/printer/printer.action";
import { InventoryTransferPermission } from "config/permissions/inventory-transfer.permission";
import useAuthorization from "hook/useAuthorization";
import { callApiNative } from "utils/ApiUtils";
import { searchAccountPublicApi } from "service/accounts/account.service";
import TransferExport from "../../Components/TransferExport";
import {
  getListInventoryTransferApi,
  updateNoteTransferApi,
} from "service/inventory/transfer/index.service";
import moment from "moment";
import * as XLSX from "xlsx";
import { TransferExportField, TransferExportLineItemField } from "model/inventory/field";
import { ImportStatusWrapper } from "../../../ImportInventory/styles";
import { HttpStatus } from "config/http-status.config";
import { OFFSET_HEADER_UNDER_NAVBAR, STATUS_IMPORT_EXPORT, TYPE_EXPORT } from "utils/Constants";
import CustomPagination from "component/table/CustomPagination";
import queryString from "query-string";
import EditPopover from "../../../../inventory-defects/ListInventoryDefect/components/EditPopover";
import { primaryColor } from "utils/global-styles/variables";
import { StoreResponse } from "model/core/store.model";
import { initQuery } from "../../../helper";
const { Text } = Typography;

let firstLoad = true;

const ACTIONS_INDEX = {
  ADD_FORM_EXCEL: 1,
  WATCH_MANY_TICKET: 2,
  PRINT: 4,
  PRINT_TICKET: 5,
  MAKE_COPY: 7,
  EXPORT: 8,
  CANCEL: 9,
};

type InventoryTransferTabProps = {
  accountStores?: Array<StoreResponse> | null;
  stores?: Array<StoreResponse>;
  accounts?: Array<AccountResponse>;
  defaultAccountProps?: PageResponse<AccountResponse>;
  setAccounts?: (e: any) => any;
  setCountTransferIn?: (e: number) => void;
  setCountTransferOut?: (e: number) => void;
  activeTab?: string;
  vExportTransfer: boolean;
  vExportDetailTransfer: boolean;
  setVExportTransfer: React.Dispatch<React.SetStateAction<boolean>>;
  setVExportDetailTransfer: React.Dispatch<React.SetStateAction<boolean>>;
};

const InventoryTransferTab: React.FC<InventoryTransferTabProps> = (
  props: InventoryTransferTabProps,
) => {
  const {
    accountStores,
    stores,
    accounts,
    setAccounts,
    vExportTransfer,
    setVExportTransfer,
    vExportDetailTransfer,
    setVExportDetailTransfer,
    defaultAccountProps,
    activeTab,
    setCountTransferIn,
    setCountTransferOut,
  } = props;
  const history = useHistory();
  const location = useLocation();
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  const query = useQuery();

  const [loadingBtn, setLoadingBtn] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Array<number>>([]);
  const [selectedRowData, setSelectedRowData] = useState<Array<any>>([]);

  const [isDeleteTicket, setIsDeleteTicket] = useState<boolean>(false);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState<boolean>(false);
  const printElementRef = useRef(null);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [dataUploadError, setDataUploadError] = useState<string[]>([]);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [statusExport, setStatusExport] = useState<number>(0);

  const [printContent, setPrintContent] = useState<string>("");
  const pageBreak = "<div class='pageBreak'></div>";
  const handlePrint = useReactToPrint({
    content: () => printElementRef.current,
  });
  const printContentCallback = useCallback(
    (printContent: Array<PrinterInventoryTransferResponseModel>) => {
      setTableLoading(false);
      if (!printContent || printContent.length === 0) return;
      const textResponse = printContent.map((single) => {
        return "<div class='singleOrderPrint'>" + single.html_content + "</div>";
      });
      let textResponseFormatted = textResponse.join(pageBreak);
      //xóa thẻ p thừa
      let result = textResponseFormatted.replaceAll("<p></p>", "");
      setPrintContent(result);
      handlePrint && handlePrint();
    },
    [handlePrint],
  );

  //phân quyền
  const [allowPrint] = useAuthorization({
    acceptPermissions: [InventoryTransferPermission.print],
  });
  const [allowClone] = useAuthorization({
    acceptPermissions: [InventoryTransferPermission.clone],
  });
  const [allowCancel] = useAuthorization({
    acceptPermissions: [InventoryTransferPermission.cancel],
  });

  let actionsInit: Array<MenuAction> = [
    // {
    //   id: ACTIONS_INDEX.ADD_FORM_EXCEL,
    //   name: "Thêm mới từ Excel",
    //   icon: <ImportOutlined />,
    //   disabled: !allowImportFromExcel,
    // },
    {
      id: ACTIONS_INDEX.WATCH_MANY_TICKET,
      name: "Xem nhiều phiếu",
      icon: <BarsOutlined />,
      disabled: true,
    },
    {
      id: ACTIONS_INDEX.PRINT,
      name: "In vận đơn",
      icon: <PrinterOutlined />,
      disabled: !allowPrint,
    },
    {
      id: ACTIONS_INDEX.PRINT_TICKET,
      name: "In phiếu",
      icon: <PrinterOutlined />,
      disabled: !allowPrint,
    },
    {
      id: ACTIONS_INDEX.MAKE_COPY,
      name: "Tạo bản sao",
      icon: <CopyOutlined />,
      disabled: !allowClone,
    },
    {
      id: ACTIONS_INDEX.EXPORT,
      name: "Xuất kho",
      icon: <ExportOutlined />,
    },
    {
      id: ACTIONS_INDEX.CANCEL,
      name: "Hủy phiếu",
      icon: <CloseCircleOutlined />,
      disabled: !allowCancel,
    },
  ];

  const dispatch = useDispatch();
  let dataQuery: InventoryTransferSearchQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  let [params, setParams] = useState<InventoryTransferSearchQuery>(dataQuery);
  const [actions, setActions] = useState<MenuAction[]>([]);
  const [data, setData] = useState<PageResponse<Array<InventoryTransferDetailItem>>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const updateNote = async (id: number, data: any, itemData: InventoryTransferDetailItem) => {
    const response = await callApiNative(
      { isShowError: true },
      dispatch,
      updateNoteTransferApi,
      id,
      data,
    );

    if (response) showSuccess(`Cập nhật ${itemData?.code} thành công`);
    dispatch(getListInventoryTransferAction(params, setSearchResult));
  };

  const editNote = (note: string, row: InventoryTransferDetailItem) => {
    const newData = {
      version: row?.version,
      note,
    };

    if (row?.id) {
      updateNote(row.id, newData, row).then();
    }
  };

  const editPermission = [InventoryTransferPermission.update];

  const [isHaveEditPermission] = useAuthorization({
    acceptPermissions: editPermission,
    not: false,
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const defaultColumns = [
    {
      title: "Mã phiếu chuyển",
      dataIndex: "code",
      visible: true,
      align: "left",
      fixed: "left",
      width: 150,
      render: (value: string, row: InventoryTransferDetailItem) => (
        <div>
          <Link
            to={`${UrlConfig.INVENTORY_TRANSFERS}/${row.id}`}
            style={{ fontWeight: 600, fontSize: 16 }}
          >
            {value}
          </Link>
          <div>{ConvertUtcToLocalDate(row.created_date, DATE_FORMAT.DDMMYY_HHmm)}</div>
        </div>
      ),
    },
    {
      title: "Kho gửi",
      dataIndex: "from_store_name",
      visible: true,
      align: "left",
      width: 150,
    },
    {
      title: "Kho nhận",
      dataIndex: "to_store_name",
      visible: true,
      align: "left",
      width: 150,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      visible: true,
      align: "left",
      render: (item: string) => {
        let textTag: string;
        let classTag: string;
        let img: any;
        switch (item) {
          // case STATUS_INVENTORY_TRANSFER.REQUESTED.status:
          //   textTag = STATUS_INVENTORY_TRANSFER.REQUESTED.name;
          //   classTag = STATUS_INVENTORY_TRANSFER.REQUESTED.status;
          //   img = confirmedIcon;
          //   break;

          case STATUS_INVENTORY_TRANSFER.TRANSFERRING.status:
            textTag = STATUS_INVENTORY_TRANSFER.TRANSFERRING.name;
            classTag = STATUS_INVENTORY_TRANSFER.TRANSFERRING.status;
            img = transferringIcon;
            break;

          case STATUS_INVENTORY_TRANSFER.PENDING.status:
            textTag = STATUS_INVENTORY_TRANSFER.PENDING.name;
            classTag = STATUS_INVENTORY_TRANSFER.PENDING.status;
            img = pendingIcon;
            break;
          case STATUS_INVENTORY_TRANSFER.RECEIVED.status:
            textTag = STATUS_INVENTORY_TRANSFER.RECEIVED.name;
            classTag = STATUS_INVENTORY_TRANSFER.RECEIVED.status;
            img = receivedIcon;
            break;
          case STATUS_INVENTORY_TRANSFER.CANCELED.status:
            textTag = STATUS_INVENTORY_TRANSFER.CANCELED.name;
            classTag = STATUS_INVENTORY_TRANSFER.CANCELED.status;
            img = canceledIcon;
            break;
          default:
            textTag = STATUS_INVENTORY_TRANSFER.CONFIRM.name;
            classTag = STATUS_INVENTORY_TRANSFER.CONFIRM.status;
            img = confirmedIcon;
            break;
        }
        return (
          <div className="status">
            <div className={classTag}>
              <img className="mr-5" src={img} alt="" />
              <span>{textTag}</span>
            </div>
          </div>
        );
      },
      width: 150,
    },
    {
      titleCustom: "SP",
      title: () => {
        return (
          <>
            <div>SP</div>
            <div>({formatCurrency(0)})</div>
          </>
        );
      },
      dataIndex: "total_sent_variant",
      visible: true,
      align: "right",
      render: (value: number) => {
        return formatCurrency(value, ".");
      },
      width: "100px",
    },
    {
      titleCustom: "SL Gửi",
      title: () => {
        return (
          <>
            <div>SL Gửi</div>
            <div className="t-primary">{formatCurrency(0, ".")}</div>
          </>
        );
      },
      dataIndex: "total_sent_quantity",
      visible: true,
      align: "right",
      render: (value: number) => {
        return formatCurrency(value, ".");
      },
      width: "100px",
    },
    {
      titleCustom: "SL Nhận",
      title: () => {
        return (
          <>
            <div>SL Nhận</div>
            <div className="t-primary">({formatCurrency(0, ".")})</div>
          </>
        );
      },
      visible: true,
      dataIndex: "total_received_quantity",
      align: "right",
      width: 100,
      render: (value: number) => {
        return formatCurrency(value, ".");
      },
    },
    {
      title: "Thành tiền",
      dataIndex: "total_sent_amount",
      visible: true,
      align: "right",
      width: 150,
      render: (value: number) => {
        return formatCurrency(value, ".");
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      visible: true,
      align: "left",
      width: "220px",
      render: (item: string, row: InventoryTransferDetailItem) => {
        return (
          <div className="single">
            <EditPopover
              isHaveEditPermission={isHaveEditPermission}
              maxLength={255}
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
    {
      title: "Ghi chú hệ thống",
      dataIndex: "forward_store_name",
      visible: true,
      align: "left",
      width: "220px",
      render: (item: string, row: InventoryTransferDetailItem) => {
        return row.forward_note ? (
          <div className="single">
            {row.forward_note}
          </div>
        ) : (
          <></>
        );
      },
    },
    {
      title: "Ngày chuyển",
      dataIndex: "transfer_date",
      visible: true,
      align: "left",
      width: "110px",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYY_HHmm)}</div>,
    },
    {
      title: "Ngày nhận",
      dataIndex: "receive_date",
      visible: true,
      align: "left",
      width: "100px",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYY_HHmm)}</div>,
    },
    {
      title: "Ngày hủy",
      dataIndex: "cancel_date",
      visible: true,
      align: "left",
      width: "100px",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYY_HHmm)}</div>,
    },
    {
      title: "Người tạo",
      dataIndex: "created_by",
      visible: true,
      align: "left",
      width: 150,
      render: (value: string, item: InventoryTransferDetailItem) => {
        return (
          <>
            <div>
              <b>{item.created_by ?? ""}</b>
            </div>
            <div>{item.created_name ?? ""}</div>
          </>
        );
      },
    },
  ];

  const [columns, setColumn] = useState<Array<any>>(defaultColumns);

  useEffect(() => {
    setActions(actionsInit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowClone, allowPrint]);

  useEffect(() => {
    if (selectedRowKeys.length === 0) return;

    let newActions = [...actions];
    newActions.forEach((element, index) => {
      if (element.id === ACTIONS_INDEX.MAKE_COPY) {
        newActions[index].disabled = selectedRowKeys.length > 1;
      }
    });

    setActions(newActions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRowKeys]);

  const deleteTicket = async (value: string | undefined) => {
    setLoadingBtn(true);
    const ids = selectedRowData.map((i) => {
      return {
        id: i.id,
        code: i.code
      };
    });
    dispatch(
      actionCancelTicketByIds(
        {
          note: value ? value : "",
          transfers: ids,
        },
        dataCancelCallback,
      ),
    );
  };

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      setParams({ ...params });
      let queryParam = generateQuery({ ...params });
      history.push(`${history.location.pathname}?${queryParam}`);
    },
    [history, params],
  );

  const columnFinal = useMemo(() => columns.filter((item) => item.visible === true), [columns]);

  const setSearchResult = useCallback(
    (result: PageResponse<Array<InventoryTransferDetailItem>> | false) => {
      setTableLoading(false);
      if (!!result) {
        if (result.items.length > 0) {
          let total = 0;
          let totalReceivedQuantity = 0;
          let totalProduct = 0;

          result.items.forEach((item: any) => {
            total = total + item.total_sent_quantity;
            totalProduct = totalProduct + item.total_sent_variant;
            totalReceivedQuantity = totalReceivedQuantity + item.total_received_quantity;
          });

          const newColumns = [...columns];

          for (let i = 0; i < newColumns.length; i++) {
            if (newColumns[i].dataIndex === "total_sent_quantity") {
              newColumns[i] = {
                // eslint-disable-next-line no-loop-func
                title: () => {
                  return (
                    <>
                      <div>SL Gửi</div>
                      <div className="t-primary">{formatCurrency(total, ".")}</div>
                    </>
                  );
                },
                titleCustom: "SL Gửi",
                dataIndex: "total_sent_quantity",
                visible: true,
                align: "right",
                render: (value: number) => {
                  return formatCurrency(value, ".");
                },
                width: 120,
              };
            }
            if (newColumns[i].dataIndex === "total_received_quantity") {
              newColumns[i] = {
                // eslint-disable-next-line no-loop-func
                title: () => {
                  return (
                    <>
                      <div>SL Nhận</div>
                      <div className="t-primary">{formatCurrency(totalReceivedQuantity, ".")}</div>
                    </>
                  );
                },
                titleCustom: "SL Nhận",
                dataIndex: "total_received_quantity",
                visible: true,
                align: "right",
                render: (value: number) => {
                  return formatCurrency(value, ".");
                },
                width: 100,
              };
            }
            if (newColumns[i].dataIndex === "total_sent_variant") {
              newColumns[i] = {
                // eslint-disable-next-line no-loop-func
                title: () => {
                  return (
                    <>
                      <div>SP</div>
                      <div className="t-primary">{formatCurrency(totalProduct, ".")}</div>
                    </>
                  );
                },
                titleCustom: "SP",
                dataIndex: "total_sent_variant",
                visible: true,
                align: "right",
                render: (value: number) => {
                  return formatCurrency(value, ".");
                },
                width: 120,
              };
            }
            if (newColumns[i].dataIndex === "note") {
              newColumns[i] = {
                title: "Ghi chú",
                dataIndex: "note",
                visible: true,
                align: "left",
                width: "220px",
                render: (item: string, row: InventoryTransferDetailItem) => {
                  return (
                    <div className="single">
                      <EditPopover
                        maxLength={255}
                        isHaveEditPermission={isHaveEditPermission}
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
              };
            }
          }

          setColumn(newColumns);
        } else {
          setColumn(defaultColumns);
        }

        setData(result);
        if (activeTab === InventoryTransferTabUrl.LIST_TRANSFERRING_SENDER) {
          setCountTransferOut && setCountTransferOut(result.metadata.total);
        }
        if (activeTab === InventoryTransferTabUrl.LIST_TRANSFERRING_RECEIVE) {
          setCountTransferIn && setCountTransferIn(result.metadata.total);
        }
        if (firstLoad) {
          setTotalItems(result.metadata.total);
        }
        firstLoad = false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columns, defaultColumns, stores],
  );

  const getAccounts = async (codes: string) => {
    const initSelectedResponse = await callApiNative(
      { isShowError: true },
      dispatch,
      searchAccountPublicApi,
      {
        codes,
      },
    );

    setAccounts && setAccounts(initSelectedResponse.items);
  };

  const onFilter = useCallback(
    (values) => {
      let newParams = { ...params, ...values, page: 1 };
      setParams(newParams);
      let queryParam = generateQuery(newParams);
      setTableLoading(true);
      history.push(`${history.location.pathname}?${queryParam}`);
      let codes = "";

      if (newParams.created_by) {
        codes = newParams.created_by;
      }
      if (newParams.updated_by) {
        codes = codes + "," + newParams.updated_by;
      }
      if (newParams.received_by) {
        codes = codes + "," + newParams.received_by;
      }
      if (newParams.transfer_by) {
        codes = codes + "," + newParams.transfer_by;
      }
      if (newParams.cancel_by) {
        codes = codes + "," + newParams.cancel_by;
      }
      getAccounts(codes).then();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [history, params],
  );

  const printTicketAction = useCallback(
    (index: number) => {
      let printType = "";
      if (index === ACTIONS_INDEX.PRINT) {
        printType = "inventory_transfer_bill";
      } else if (index === ACTIONS_INDEX.PRINT_TICKET) {
        printType = "inventory_transfer";
      }
      dispatch(
        actionFetchPrintFormByInventoryTransferIds(
          selectedRowKeys,
          printType,
          printContentCallback,
        ),
      );
    },
    [dispatch, printContentCallback, selectedRowKeys],
  );

  const dataCancelCallback = (data: any) => {
    setLoadingBtn(false);
    setTableLoading(false);
    if (data.code === HttpStatus.SUCCESS) {
      setSelectedRowKeys([]);
      setSelectedRowData([]);
      setIsDeleteTicket(false);
      showSuccess(`Hủy phiếu chuyển thành công`);
      setParams({
        ...params,
      });
      return;
    }

    if (data.code === HttpStatus.BAD_REQUEST) {
      setIsDeleteTicket(false);
      setIsStatusModalVisible(true);
      setParams({
        ...params,
      });
      setSelectedRowKeys([]);
      setSelectedRowData([]);
      setDataUploadError(data.errors);
    }
  };

  const dataExportCallback = (data: any) => {
    setTableLoading(false);
    setSelectedRowKeys([]);
    setSelectedRowData([]);
    if (data.code === HttpStatus.SUCCESS) {
      showSuccess(`Xuất kho thành công`);
      setParams({
        ...params,
      });
      setSelectedRowKeys([]);
      setSelectedRowData([]);
      return;
    }

    if (data.code === HttpStatus.BAD_REQUEST) {
      setIsStatusModalVisible(true);
      setDataUploadError(data.errors);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const exportMultiple = async () => {
    setTableLoading(true);
    const ids = selectedRowData.map((i) => {
      return {
        id: i.id,
        code: i.code
      };
    });
    const queryParamsParsed: any = queryString.parse(location.search);

    let data: DataExport = {
      transfers: ids,
    };
    if (queryParamsParsed.secret) {
      data.secret = queryParamsParsed.secret;
    }
    dispatch(actionExportInventoryByIds(data, dataExportCallback));
  };

  const cancelTicket = () => {
    setIsDeleteTicket(true);
  };

  const onMenuClick = useCallback(
    (index: number) => {
      if (selectedRowKeys && selectedRowKeys.length === 0) {
        showWarning("Cần chọn ít nhất một phiếu chuyển.");
        return;
      }

      // setLoad

      switch (index) {
        case ACTIONS_INDEX.PRINT_TICKET:
          printTicketAction(index);
          break;
        case ACTIONS_INDEX.PRINT:
          printTicketAction(index);
          break;
        // case ACTIONS_INDEX.ADD_FORM_EXCEL:
        //   history.push(`${UrlConfig.INVENTORY_TRANSFERS}/import`);
        //   break;
        case ACTIONS_INDEX.MAKE_COPY:
          history.push(
            `${UrlConfig.INVENTORY_TRANSFERS}/${selectedRowKeys}/update?cloneId=${selectedRowKeys}`,
          );
          break;
        case ACTIONS_INDEX.EXPORT:
          exportMultiple().then();
          break;
        case ACTIONS_INDEX.CANCEL:
          cancelTicket();
          break;
        default:
          break;
      }
    },
    [exportMultiple, history, printTicketAction, selectedRowKeys],
  );

  const onClearFilter = useCallback(() => {
    setParams(initQuery);
    let queryParam = generateQuery(initQuery);
    history.push(`${UrlConfig.INVENTORY_TRANSFERS}#1?${queryParam}`);
  }, [history]);

  const onSelectedChange = useCallback(
    (
      selectedRow: Array<InventoryTransferDetailItem>,
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

  const convertItemExport = (item: InventoryTransferDetailItem) => {
    return {
      [TransferExportField.code]: item.code,
      [TransferExportField.from_store_name]: item.from_store_name,
      [TransferExportField.to_store_name]: item.to_store_name,
      [TransferExportField.status]: STATUS_INVENTORY_TRANSFER_ARRAY.find(
        (e) => e.value === item.status,
      )?.name,
      [TransferExportField.total_variant]: item.total_sent_variant,
      [TransferExportField.total_quantity]: item.total_sent_quantity === 0 ? null : item.total_sent_quantity,
      [TransferExportField.total_amount]: item.total_sent_amount,
      [TransferExportField.created_date]: ConvertUtcToLocalDate(
        item.created_date,
        DATE_FORMAT.DDMMYY_HHmm,
      ),
      [TransferExportField.created_name]: `${item.created_by} - ${item.created_name}`,
      [TransferExportField.transfer_date]: ConvertUtcToLocalDate(
        item.transfer_date,
        DATE_FORMAT.DDMMYY_HHmm,
      ),
      [TransferExportField.receive_date]: ConvertUtcToLocalDate(
        item.receive_date,
        DATE_FORMAT.DDMMYY_HHmm,
      ),
      [TransferExportField.receive_by]: item.receive_date
        ? `${item.updated_by} - ${item.updated_name}`
        : null,
      [TransferExportField.note]: item.note,
    };
  };

  const convertTransferDetailExport = (
    transfer: InventoryTransferDetailItem,
    arrItem: Array<LineItem>,
  ) => {
    let arr = [];
    for (let i = 0; i < arrItem.length; i++) {
      const item = arrItem[i];

      arr.push({
        [TransferExportLineItemField.code]: transfer.code,
        [TransferExportLineItemField.from_store]: `${transfer.from_store_name}`,
        [TransferExportLineItemField.to_store]: `${transfer.to_store_name}`,
        [TransferExportLineItemField.status]: STATUS_INVENTORY_TRANSFER_ARRAY.find(
          (e) => e.value === transfer.status,
        )?.name,
        [TransferExportLineItemField.sku]: item.sku,
        [TransferExportLineItemField.variant_name]: item.variant_name,
        [TransferExportLineItemField.barcode]: item.barcode,
        [TransferExportLineItemField.price]: item.price,
        [TransferExportLineItemField.transfer_quantity]: item.transfer_quantity,
        [TransferExportLineItemField.total_amount]:
          (item.transfer_quantity ?? 0) * (item.price ?? 0),
        [TransferExportLineItemField.real_quantity]:
          item.real_quantity === 0 ? null : item.real_quantity,
        [TransferExportField.created_date]: ConvertUtcToLocalDate(
          item.created_date,
          DATE_FORMAT.DDMMYY_HHmm,
        ),
        [TransferExportField.created_name]: `${item.created_by} - ${item.created_name}`,
        [TransferExportField.transfer_date]: ConvertUtcToLocalDate(
          transfer.transfer_date,
          DATE_FORMAT.DDMMYY_HHmm,
        ),
        [TransferExportField.receive_date]: ConvertUtcToLocalDate(
          transfer.receive_date,
          DATE_FORMAT.DDMMYY_HHmm,
        ),
        [TransferExportField.receive_by]: transfer.receive_date
          ? `${item.updated_by} - ${item.updated_name}`
          : null,
        [TransferExportField.note]: transfer.note,
      });
    }
    return arr;
  };

  const getItemsByCondition = useCallback(
    async (type: string) => {
      let res: any;
      let items: Array<InventoryTransferDetailItem> = [];
      const limit = 50;
      let times = 0;

      setStatusExport(STATUS_IMPORT_EXPORT.CREATE_JOB_SUCCESS);
      switch (type) {
        case TYPE_EXPORT.page:
          res = await callApiNative(
            { isShowLoading: false },
            dispatch,
            getListInventoryTransferApi,
            { ...params, simple: false, limit: params.limit ?? 50 },
          );
          if (res) {
            items = items.concat(res.items);
          }
          break;
        case TYPE_EXPORT.selected:
          res = await callApiNative(
            { isShowLoading: false },
            dispatch,
            getListInventoryTransferApi,
            { ...params, simple: false, limit: params.limit ?? 50 },
          );
          if (res) {
            for (let index = 0; index < selectedRowData.length; index++) {
              const transfer = res.items.find(
                (e: InventoryTransferDetailItem) => e.code === selectedRowData[index].code,
              );
              if (transfer) {
                items.push(transfer);
              }
            }
          }
          break;
        case TYPE_EXPORT.all:
          const roundAll = Math.round(data.metadata.total / limit);
          times = roundAll < data.metadata.total / limit ? roundAll + 1 : roundAll;

          for (let index = 1; index <= times; index++) {
            const res = await callApiNative(
              { isShowLoading: false },
              dispatch,
              getListInventoryTransferApi,
              { ...params, simple: false, page: index, limit: limit },
            );
            if (res) {
              items = items.concat(res.items);
            }
            const percent = Math.round(Number.parseFloat((index / times).toFixed(2)) * 100);
            setExportProgress(percent);
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
              getListInventoryTransferApi,
              { ...params, simple: false, page: index, limit: limit },
            );
            if (res) {
              items = items.concat(res.items);
            }
            const percent = Math.round(Number.parseFloat((index / times).toFixed(2)) * 100);
            setExportProgress(percent);
          }
          break;
        default:
          break;
      }
      setExportProgress(100);
      return items;
    },
    [dispatch, selectedRowData, params, data, totalItems],
  );

  const actionExport = {
    Ok: async (typeExport: string) => {
      setStatusExport(STATUS_IMPORT_EXPORT.DEFAULT);
      let dataExport: any = [];
      if (typeExport === TYPE_EXPORT.selected && selectedRowData && selectedRowData.length === 0) {
        setStatusExport(0);
        showWarning("Bạn chưa chọn phiếu chuyển nào để xuất file");
        setVExportTransfer(false);
        setVExportDetailTransfer(false);
        return;
      }
      const res = await getItemsByCondition(typeExport);
      if (res && res.length === 0) {
        setStatusExport(0);
        showWarning("Không có phiếu chuyển nào đủ điều kiện");
        return;
      }

      const workbook = XLSX.utils.book_new();

      if (vExportDetailTransfer) {
        let item: any = [];
        for (let i = 0; i < res.length; i++) {
          if (!res[i] || res[i].line_items?.length === 0) continue;

          if (workbook.Sheets[`${res[i].code}`]) {
            continue;
          }
          item = item.concat(convertTransferDetailExport(res[i], res[i].line_items));
        }
        const ws = XLSX.utils.json_to_sheet(item);

        XLSX.utils.book_append_sheet(workbook, ws, "data");
      } else {
        for (let i = 0; i < res.length; i++) {
          const e = res[i];
          const item = convertItemExport(e);
          dataExport.push(item);
        }

        let worksheet = XLSX.utils.json_to_sheet(dataExport);
        XLSX.utils.book_append_sheet(workbook, worksheet, "data");
      }

      setStatusExport(STATUS_IMPORT_EXPORT.JOB_FINISH);
      const today = moment(new Date(), "YYYY/MM/DD");
      const month = today.format("M");
      const day = today.format("D");
      const year = today.format("YYYY");
      XLSX.writeFile(
        workbook,
        `${vExportDetailTransfer ? "transfer_detail" : "transfer"}_${day}_${month}_${year}.xlsx`,
      );
      setVExportTransfer(false);
      setVExportDetailTransfer(false);
      setExportProgress(0);
      setStatusExport(0);
    },
    Cancel: () => {
      setVExportTransfer(false);
      setVExportDetailTransfer(false);
      setExportProgress(0);
      setStatusExport(0);
    },
  };

  useEffect(() => {
    setTableLoading(true);
    if (activeTab === "") return;
    if (!accountStores) return;
    if (stores?.length === 0) return;

    let status: string[] = [];
    switch (activeTab) {
      case InventoryTransferTabUrl.LIST_TRANSFERRING_SENDER:
        status = [
          STATUS_INVENTORY_TRANSFER.TRANSFERRING.status,
          STATUS_INVENTORY_TRANSFER.CONFIRM.status,
        ];
        break;
      case InventoryTransferTabUrl.LIST_TRANSFERRING_RECEIVE:
        status = [STATUS_INVENTORY_TRANSFER.TRANSFERRING.status];
        break;
      default:
        break;
    }

    let newParams = {
      ...params,
      status: params.status.length > 0 ? params.status : status,
    };

    let accountStoreSelected =
      accountStores && accountStores.length > 0 ? accountStores.map((i) => i.id).join(",") : null;

    switch (activeTab) {
      case InventoryTransferTabUrl.LIST_TRANSFERRING_SENDER:
        newParams = {
          ...newParams,
          from_store_id: params.from_store_id
            ? (Array.isArray(params.from_store_id) && params.from_store_id.length) > 0
              ? params.from_store_id
              : accountStoreSelected
            : accountStoreSelected || null,
        };
        break;
      case InventoryTransferTabUrl.LIST_TRANSFERRING_RECEIVE:
        newParams = {
          ...newParams,
          to_store_id: params.to_store_id
            ? (Array.isArray(params.to_store_id) && params.to_store_id.length) > 0
              ? params.to_store_id
              : accountStoreSelected
            : accountStoreSelected || null,
        };
        break;
      default:
        break;
    }

    let queryParam = generateQuery(newParams);
    history.push(`${history.location.pathname}?${queryParam}`);

    dispatch(getListInventoryTransferAction(newParams, setSearchResult));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, activeTab, params, accountStores, stores]);

  return (
    <InventoryTransferTabWrapper>
      <div style={{ display: "none" }}>
        <div className="printContent" ref={printElementRef}>
          <div
            dangerouslySetInnerHTML={{
              __html: purify.sanitize(printContent),
            }}
          />
        </div>
      </div>
      <InventoryFilters
        isLoadingAction={tableLoading}
        activeTab={activeTab}
        accounts={accounts}
        defaultAccountProps={defaultAccountProps}
        params={params}
        stores={stores}
        accountStores={accountStores}
        actions={actions}
        onMenuClick={onMenuClick}
        onShowColumnSetting={() => setShowSettingColumn(true)}
        onFilter={onFilter}
        onClearFilter={() => onClearFilter()}
      />
      <CustomPagination
        pagination={{
          showSizeChanger: true,
          pageSize: data.metadata.limit,
          current: data.metadata.page,
          total: data.metadata.total,
          onChange: onPageChange,
          onShowSizeChange: onPageChange,
        }}
      />
      <CustomTable
        bordered
        isRowSelection
        selectedRowKey={selectedRowKeys}
        isLoading={tableLoading}
        scroll={{ x: 1000 }}
        sticky={{ offsetScroll: 5, offsetHeader: OFFSET_HEADER_UNDER_NAVBAR }}
        pagination={false}
        onSelectedChange={(selectedRows, selected, changeRow) =>
          onSelectedChange(selectedRows, selected, changeRow)
        }
        onShowColumnSetting={() => setShowSettingColumn(true)}
        dataSource={data.items}
        columns={columnFinal}
        rowKey={(item: VariantResponse) => item.id}
      />

      {isDeleteTicket && (
        <DeleteTicketModal
          onOk={deleteTicket}
          loading={loadingBtn}
          onCancel={() => setIsDeleteTicket(false)}
          visible={isDeleteTicket}
          icon={WarningRedIcon}
          isMultiple
          textStore={selectedRowData[0]?.from_store_name}
          okText="Đồng ý"
          cancelText="Thoát"
          title={`Bạn chắc chắn Hủy những phiếu chuyển hàng: ${selectedRowData
            .map((i) => i.code)
            .join(", ")}`}
        />
      )}
      <ModalSettingColumn
        visible={showSettingColumn}
        onCancel={() => setShowSettingColumn(false)}
        onOk={(data) => {
          setShowSettingColumn(false);
          setColumn(data);
        }}
        data={columns}
      />
      <TransferExport
        onCancel={actionExport.Cancel}
        onOk={actionExport.Ok}
        title={vExportTransfer ? "Xuất file chuyển kho danh sách" : "Xuất file chuyển kho chi tiết"}
        visible={vExportTransfer || vExportDetailTransfer}
        exportProgress={exportProgress}
        statusExport={statusExport}
      />

      {isStatusModalVisible && (
        <Modal
          title="Thao tác"
          visible={isStatusModalVisible}
          centered
          onCancel={() => {
            setIsStatusModalVisible(false);
          }}
          footer={[
            <Button
              key="back"
              onClick={() => {
                setIsStatusModalVisible(false);
              }}
            >
              Huỷ
            </Button>,
          ]}
        >
          <ImportStatusWrapper>
            <Row className="import-info" style={{ marginTop: 0 }}>
              <div className="title">
                <b>Chi tiết: </b>
              </div>
              <div className="content">
                <ul>
                  {dataUploadError ? (
                    dataUploadError.map((item) => {
                      return (
                        <li>
                          <span className="danger">&#8226;</span>
                          <Text type="danger">{item}</Text>
                        </li>
                      );
                    })
                  ) : (
                    <li>
                      <span className="success">&#8226;</span>
                      <Text type="success">Thành công</Text>
                    </li>
                  )}
                </ul>
              </div>
            </Row>
          </ImportStatusWrapper>
        </Modal>
      )}
    </InventoryTransferTabWrapper>
  );
};

export default InventoryTransferTab;
