import { Modal, Radio, Row, Space } from "antd";
import PurchaseOrderFilter from "component/filter/purchase-order.filter";
import { MenuAction } from "component/table/ActionButton";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { TagStatusType } from "component/tag/tag-status";
import { HttpStatus } from "config/http-status.config";
import { PurchaseOrderPermission } from "config/permissions/purchase-order.permission";
import UrlConfig from "config/url.config";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { hideLoading } from "domain/actions/loading.action";
import {
  createConfigPoAction,
  PODeleteAction,
  PoSearchAction,
  PoUpdateNoteAction,
  updateConfigPoAction
} from "domain/actions/po/po.action";
import useAuthorization from "hook/useAuthorization";
import { PageResponse } from "model/base/base-metadata.response";
import { StoreResponse } from "model/core/store.model";
import { FilterConfig, FilterConfigRequest } from "model/other";
import {
  POProgressResult,
  PurchaseOrder,
  PurchaseOrderPrint,
  PurchaseOrderQuery
} from "model/purchase-order/purchase-order.model";
import { PurchaseProcument } from "model/purchase-order/purchase-procument";
import { RootReducerType } from "model/reducers/RootReducerType";
import moment from "moment";
import { lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import NumberFormat from "react-number-format";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { exportFile, getFile } from "service/other/export.service";
import { getPrintContent, getPurchaseOrderConfigService, updatePurchaseOrderStatusWaitingApproval } from "service/purchase-order/purchase-order.service";
import { formatCurrency, generateQuery } from "utils/AppUtils";
import { COLUMN_CONFIG_TYPE, PoPaymentStatus, POStatus, ProcumentStatus, ArrPoStatus } from "utils/Constants";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import "./purchase-order-list.scss";
import { PurchaseOrderListContainer } from "./purchase-order-list.style";
import EditNote from "../order-online/component/edit-note";
import TextStatus from "component/tag/text-status";
import statusDraft from 'assets/icon/status-draft-new.svg'
import statusWaitingApproval from 'assets/icon/status-waiting-approval-new.svg'
import statusFinalized from 'assets/icon/status-finalized-new.svg'
import statusStored from 'assets/icon/status-stored-new.svg'
import statusFinished from 'assets/icon/status-finished-new.svg'
import statusCompleted from 'assets/icon/status-completed-new.svg'
import statusCancelled from 'assets/icon/status-cancelled-new.svg'
import { CloseCircleOutlined, PrinterOutlined } from "@ant-design/icons";
import { callApiNative } from "utils/ApiUtils";
import { useReactToPrint } from "react-to-print";
import purify from "dompurify";
import { PrintTypePo } from "./helper";
import POProgressModal from "./POProgressModal";

const ModalDeleteConfirm = lazy(() => import("component/modal/ModalDeleteConfirm"))
const ModalSettingColumn = lazy(() => import("component/table/ModalSettingColumn"))
const ExportModal = lazy(() => import("screens/purchase-order/modal/export.modal"))

const actionsDefault: Array<MenuAction> = [
  {
    id: 1,
    name: "Chờ duyệt",
    icon: <img width={18} height={18} src={statusWaitingApproval} alt="" style={{ marginRight: 3, marginBottom: 2 }} />
  },
  {
    id: 2,
    name: "In đơn",
    icon: <PrinterOutlined />
  },
  {
    id: 3,
    name: "Xóa",
    icon: <CloseCircleOutlined />,
  },
];
interface PurchaseOrderListScreenProps {
  showExportModal: boolean
  setShowExportModal: (param: boolean) => void;
  setError: (param: boolean) => void;
}

const PurchaseOrderListScreen: React.FC<PurchaseOrderListScreenProps> = (props: PurchaseOrderListScreenProps) => {
  const {showExportModal, setShowExportModal, setError} = props
  const query = useQuery();
  const history = useHistory();
  const dispatch = useDispatch();
  const isFirstLoad = useRef(true);
  const [tableLoading, setTableLoading] = useState(true);
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  const [isConfirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [selected, setSelected] = useState<Array<PurchaseOrder>>([]);
  const [listStore, setListStore] = useState<Array<StoreResponse>>([]);
  const [listExportFile, setListExportFile] = useState<Array<string>>([]);
  const userReducer = useSelector((state: RootReducerType) => state.userReducer);
  const {account} = userReducer;
  const [lstConfig, setLstConfig] = useState<Array<FilterConfig>>([]);
  const [showPrintConfirm, setShowPrintConfirm] = useState<boolean>(false)
  const [printContent, setPrintContent] = useState<string>("");
  const [poPrintType, setPOPrintType] = useState<string>(PrintTypePo.PURCHASE_ORDER_FGG)
  const [showWaitingConfirm, setShowWaitingConfirm] = useState<boolean>(false)
  const [showPoProgress, setShowPOProgress] = useState<boolean>(false)
  const [dataProgress, setDataProgress] = useState<POProgressResult>()

  let initQuery: PurchaseOrderQuery = {};

  let dataQuery: PurchaseOrderQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  let [params, setPrams] = useState<PurchaseOrderQuery>(dataQuery);
  const [data, setData] = useState<PageResponse<PurchaseOrder>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const printElementRef = useRef(null);

  const onExport = useCallback(() => {
    let queryParams = generateQuery(params);
    exportFile({
      conditions: queryParams,
      type: "EXPORT_PURCHASE_ORDER",
    })
      .then((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          showSuccess("Đã gửi yêu cầu xuất file");
          setListExportFile([...listExportFile, response.data.code]);
        }
      })
      .catch((error) => {
        console.log("purchase order export file error", error);
        showError("Có lỗi xảy ra, vui lòng thử lại sau");
      });
  }, [params, listExportFile]);
  const checkExportFile = useCallback(() => {
    let getFilePromises = listExportFile.map((code) => {
      return getFile(code);
    });
    Promise.all(getFilePromises).then((responses) => {
      responses.forEach((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          if (response.data && response.data.status === "FINISH") {
            let fileCode = response.data.code,
              newListExportFile = listExportFile.filter((item) => {
                return item !== fileCode;
              });
            window.open(response.data.url);
            setListExportFile(newListExportFile);
          }
        }
      });
    });
  }, [listExportFile]);
  useEffect(() => {
    if (listExportFile.length === 0) return;
    checkExportFile();
    const getFileInterval = setInterval(checkExportFile, 3000);
    return () => clearInterval(getFileInterval);
  }, [listExportFile, checkExportFile]);
  const onMenuClick = useCallback((index: number) => {
    if (selected && selected.length === 0) {
      showWarning("Bạn chưa chọn đơn đặt hàng nào")
      return
    }
    switch (index) {
      case 1:
        setShowWaitingConfirm(true)
        break;
      case 2:
        setShowPrintConfirm(true)
        break;
      case 3:
        setConfirmDelete(true);
        // onDelete();
        break;
    }
  }, [selected]);

  const [canDeletePO] = useAuthorization({
    acceptPermissions: [PurchaseOrderPermission.delete],
  });
  const [canPrintPO] = useAuthorization({
    acceptPermissions: [PurchaseOrderPermission.print],
  });
  const [canUpdatePO] = useAuthorization({
    acceptPermissions: [PurchaseOrderPermission.update]
  })
  const actions = useMemo(() => {
    return actionsDefault.filter((item) => {
      if (item.id === 3) {
        return canDeletePO;
      }
      if (item.id === 2) {
        return canPrintPO
      }
      if (item.id === 1) {
        return canUpdatePO
      }
      return false;
    });
  }, [canDeletePO, canPrintPO, canUpdatePO]);

  const onUpdateCall = (result: PurchaseOrder | null) => {
    if (result !== null) {
      showSuccess("Cập nhật nhập hàng thành công");
      dispatch(PoSearchAction({}, setSearchResult))
    }
    setTableLoading(false);
  }

  const onEditPurchaseOrder = (item: Pick<PurchaseOrder, "id" | "note" | "supplier_note">, value: string, name: "note" | "supplier_note") => {
    setTableLoading(true)
    dispatch(PoUpdateNoteAction(item.id, {
      note: name === "note" ? value : item.note,
      supplier_note: name === "supplier_note" ? value : item.supplier_note
    }, onUpdateCall)
    );
  }

  const defaultColumns: Array<ICustomTableColumType<PurchaseOrder>> = useMemo(() => {
    return [
      {
        title: "ID đơn đặt hàng",
        dataIndex: "code",
        render: (value: string, i: PurchaseOrder) => {
          return (
            <>
              <Link to={`${UrlConfig.PURCHASE_ORDERS}/${i.id}`} style={{fontWeight: 500}}>
                {value}
              </Link>
              <br />
              <span style={{fontSize: "12px"}}>
                Ngày tạo: {ConvertUtcToLocalDate(i.created_date, "DD/MM/yy hh:mm")}
              </span>
            </>
          );
        },
        visible: true,
        fixed: "left",
      },
      {
        title: "Mã tham chiếu",
        dataIndex: "reference",
        visible: true,
        fixed: "left",
      },
      {
        title: "Nhà cung cấp",
        dataIndex: "supplier",
        visible: true,
        render: (value, row) => {
          return (
            <Link
              to={`${UrlConfig.SUPPLIERS}/${row.supplier_id}`}
              className="link-underline"
              target="_blank"
            >
              {value}
            </Link>
          )
        }
      },
      {
        title: "Merchandiser",
        dataIndex: 'merchandiser',
        render: (value, row: PurchaseOrder) => {
          if (!row || !row.merchandiser_code || !row.merchandiser) return "";
          return (
            <Link
              to={`${UrlConfig.ACCOUNTS}/${row.merchandiser_code}`}
              className="link-underline"
              target="_blank"
            >
              {`${row.merchandiser_code} - ${row.merchandiser}`}
            </Link>
          )
        },
        visible: true,
      },
      {
        title: "Trạng thái đơn",
        width: 150,
        dataIndex: "status",
        align: "center",
        render: (value: string, record) => {
          let type = TagStatusType.normal;
          let icon = "";
          let isFinishedStored = false
          if (!value) {
            return "";
          }
          switch (record.status) {
            case POStatus.FINALIZED:
              type = TagStatusType.primary;
              icon = statusFinalized
              break;
            case POStatus.STORED:
              if(record.receive_status === ProcumentStatus.FINISHED) {
                type = TagStatusType.success;
                icon = statusFinished
                isFinishedStored = true
              } else {
                type = TagStatusType.warning;
                icon = statusStored
              }
              break;
            case POStatus.CANCELLED:
              if (record.receive_status === ProcumentStatus.FINISHED) {
                isFinishedStored = false
              }
              type = TagStatusType.danger;
              icon = statusCancelled
              break;
            case POStatus.FINISHED:
              if (record.receive_status === ProcumentStatus.FINISHED) {
                isFinishedStored = false
              }
              type = TagStatusType.success;
              icon = statusCompleted
              break;
            case POStatus.COMPLETED:
              if (record.receive_status === ProcumentStatus.FINISHED) {
                isFinishedStored = false
              }
              type = TagStatusType.success;
              icon = statusCompleted
              break;
            case POStatus.WAITING_APPROVAL:
              type = TagStatusType.secondary;
              icon = statusWaitingApproval
              break;
            case POStatus.DRAFT:
              type = TagStatusType.secondary;
              icon = statusDraft
              break;
          }
          return <TextStatus icon={icon} type={type}>{isFinishedStored ? 'Kết thúc nhập kho' : ArrPoStatus.find(e => e.key === value)?.value}</TextStatus>
        },
        visible: true,
      },
      {
        title: "Nhập kho",
        dataIndex: "receive_status",
        align: "center",
        render: (value: string) => {
          let processIcon = null;

          switch (value) {
            case ProcumentStatus.NOT_RECEIVED:
            case null:
              processIcon = "icon-blank";
              break;
            case ProcumentStatus.PARTIAL_RECEIVED:
              processIcon = "icon-partial";
              break;
            case ProcumentStatus.RECEIVED:
            case ProcumentStatus.FINISHED:
              processIcon = "icon-full";
              break;
          }
          if (processIcon)
            return (
              <div className="text-center">
                <div className={processIcon} />
              </div>
            );
          return (
            <div className="text-center">
              <div className="icon-blank" />
            </div>
          );
        },
        visible: true,
        width: 120,
      },
      {
        title: "Ngày chốt công nợ",
        dataIndex: "ap_closing_date",
        width: 120,
        visible: true,
        render: (date: string, row: PurchaseOrder) => {
          return date ? ConvertUtcToLocalDate(date, DATE_FORMAT.DDMMYYY) : "";
        }
      },
      {
        title: "Thanh toán",
        align: "center",
        dataIndex: "financial_status",
        render: (value: string) => {
          let processIcon = null;
          switch (value) {
            case PoPaymentStatus.UNPAID:
            case null:
              processIcon = "icon-blank";
              break;
            case PoPaymentStatus.PARTIAL_PAID:
              processIcon = "icon-partial";
              break;
            case PoPaymentStatus.PAID:
            case PoPaymentStatus.FINISHED:
              processIcon = "icon-full";
              break;
          }
          if (processIcon)
            return (
              <div className="text-center">
                <div className={processIcon} />
              </div>
            );
          return (
            <div className="text-center">
              <div className="icon-blank" />
            </div>
          );
        },
        visible: true,
        width: 100,
      },
      {
        title: "Tổng SLSP",
        width: 100,
        dataIndex: "planned_quantity",
        render: (value, row: PurchaseOrder) => {
          return <div>{formatCurrency(value,",")}</div>;
        },
        visible: true,
        align: "right"
      },
      {
        title: "Tổng tiền",
        dataIndex: "total",
        render: (value: number) => (
          <NumberFormat
            value={value}
            className="foo"
            displayType={"text"}
            thousandSeparator={true}
          />
        ),
        visible: true,
        align: "right"
      },
      {
        title: "QC",
        dataIndex: 'qc',
        render: (value,row: PurchaseOrder) => {
          if (!row || !row.qc_code || !row.qc) return;
          return (
            <Link
              to={`${UrlConfig.ACCOUNTS}/${row.qc_code}`}
              className="link-underline"
              target="_blank"
            >
              {`${row.qc_code} - ${row.qc}`}
            </Link>
          )
        },
        visible: true,
      },
      {
        title: "Thiết kế",
        dataIndex: 'designer',
        render: (value,row: PurchaseOrder) => {
          if (!row || !row.designer_code || !row.designer) return;
          return (
            <Link
              to={`${UrlConfig.ACCOUNTS}/${row.designer_code}`}
              className="link-underline"
              target="_blank"
            >
              {value}
            </Link>
          )
        },
        visible: true,
      },
      {
        title: "Ngày duyệt đơn",
        width: 120,
        dataIndex: "activated_date",
        render: (value: string) => {
          return <div>{ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYYY)}</div>;
        },
        visible: true,
      },
      {
        title: "Ngày nhận hàng dự kiến",
        dataIndex: "procurements",
        render: (value: Array<PurchaseProcument>) => {
          let display = "";
          if (value && value.length > 0) {
            value.sort((a, b) =>
              moment(a.expect_receipt_date).diff(moment(b.expect_receipt_date))
            );
            display = ConvertUtcToLocalDate(value[value.length - 1].expect_receipt_date,DATE_FORMAT.DDMMYYY);
          }
          return <div>{display}</div>;
        },
        visible: true,
        width: 120,
      },
      {
        title: "Ngày hoàn thành đơn",
        dataIndex: "completed_date",
        render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
        visible: true,
        width: 120,
      },
      {
        title: "Ngày hủy đơn",
        dataIndex: "cancelled_date",
        render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
        visible: true,
        width: 120,
      },
      {
        title: "Ghi chú nội bộ",
        dataIndex: "note",
        visible: true,
        render: (value, item: PurchaseOrder)=>{
          return (
            <div className="note">
              <EditNote note={value} onOk={(value) => onEditPurchaseOrder(item, value, 'note')} />
            </div>
          )
        }
      },
      {
        title: "Ghi chú nhà cung cấp",
        dataIndex: "supplier_note",
        visible: true,
        render: (value, item: PurchaseOrder)=>{
          return (
            <div className="note">
              <EditNote note={value} onOk={(value) => onEditPurchaseOrder(item, value, 'supplier_note')} />
            </div>
          )
        },
        width: 200,
      },
      {
        title: "Tag",
        dataIndex: "tags",
        render: (value: string) => {
          return <div className="txt-muted">{value}</div>;
        },
        visible: true,
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [columns, setColumn] =
    useState<Array<ICustomTableColumType<PurchaseOrder>>>(defaultColumns);

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setPrams({...params});
      history.replace(`${UrlConfig.PURCHASE_ORDERS}?${queryParam}`);
    },
    [history, params]
  );

  const onFilter = useCallback(
    (values) => {
      let newPrams = {...params, ...values, page: 1};
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.push(`${UrlConfig.PURCHASE_ORDERS}?${queryParam}`);
    },
    [history, params]
  );
  const columnFinal = useMemo(
    () => columns.filter((item) => item.visible === true),
    [columns]
  );

  const setSearchResult = useCallback((result: PageResponse<PurchaseOrder> | false) => {
    setTableLoading(false);
    if (!!result) {
      setData(result);
    } else {
      setError(true);
    }
  }, [setError]);

  const getConfigColumnPo = useCallback(()=>{
    if (account && account.code) {
      getPurchaseOrderConfigService(account.code)
        .then((res) => {
          switch (res.code) {
            case HttpStatus.SUCCESS:
              if (res) {
                setLstConfig(res.data);
                if (res.data && res.data.length > 0) {
                  const userConfigColumn = res.data.find(e=>e.type === COLUMN_CONFIG_TYPE.COLUMN_PO);

                   if (userConfigColumn){
                      let cf = JSON.parse(userConfigColumn.json_content) as Array<ICustomTableColumType<PurchaseOrder>>;
                      cf.forEach(e => {
                        e.render = defaultColumns.find(p=>p.dataIndex === e.dataIndex)?.render;
                      });
                      setColumn(cf);
                   }
                }
               }
              break;
            case HttpStatus.UNAUTHORIZED:
              dispatch(unauthorizedAction());
              break;
            default:
              res.errors.forEach((e: any) => showError(e));
              break;
          }
        })
        .catch((error) => {
          console.log("error", error);
        })
        .finally(() => {
          dispatch(hideLoading());
        });
    }
  },[account, dispatch, defaultColumns]);

  useEffect(()=>{
    getConfigColumnPo();
  },[getConfigColumnPo]);

  useEffect(() => {
    if (isFirstLoad.current) {
      dispatch(StoreGetListAction(setListStore));
    }
    isFirstLoad.current = false;
    dispatch(PoSearchAction(params, setSearchResult));
  }, [dispatch, params, setSearchResult]);

  const onSelect = useCallback((selectedRow: Array<PurchaseOrder>) => {
    setSelected(
      selectedRow.filter(function (el) {
        return el !== undefined;
      })
    );
  }, []);

  const deleteCallback = useCallback((result: POProgressResult) => {
    setShowPOProgress(true)
    setDataProgress(result)
  }, []);

  const onDelete = useCallback(() => {
    if (selected.length === 0) {
      showWarning("Vui lòng chọn đơn đặt hàng cần xóa");
      return;
    }
    const ids = selected.map(((item: PurchaseOrder) => item.id)).join(',')
    dispatch(PODeleteAction(ids, deleteCallback));
  }, [deleteCallback, dispatch, selected]);

  const onSaveConfigColumn = useCallback((data: Array<ICustomTableColumType<PurchaseOrder>>) => {
    console.log('data', data)
      let config = lstConfig.find(e=>e.type === COLUMN_CONFIG_TYPE.COLUMN_PO) as FilterConfigRequest;
      if (!config) config = {} as FilterConfigRequest;

      const json_content = JSON.stringify(data);
      config.type = COLUMN_CONFIG_TYPE.COLUMN_PO;
      config.json_content = json_content;
      config.name= `${account?.code}_config_column_po`;
      if (config && config.id && config.id !== null) {
        dispatch(updateConfigPoAction(config));
      }else{
        dispatch(createConfigPoAction(config));
    }

  }, [dispatch, account?.code, lstConfig]);

  const handlePrint = useReactToPrint({
    content: () => printElementRef.current,
  });

  const printContentCallback = useCallback(
    (printContent: Array<PurchaseOrderPrint>) => {
      const pageBreak = "<div class='pageBreak'></div>";
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
    [handlePrint]
  );

  const actionPrint = useCallback(
    async (ids: string, printType: string) => {
      const res = await callApiNative(
        { isShowLoading: true },
        dispatch,
        getPrintContent,
        ids,
        printType
      );
      if (res && res.data && res.data.message) {
        showError(res.data.message);
      } else {
        printContentCallback(res);
        handlePrint && handlePrint();
      }
    },
    [dispatch, handlePrint, printContentCallback]
  );

  const onCloseProgressModal = () => {
    setShowPOProgress(false)
    setTableLoading(true);
    dispatch(PoSearchAction(params, setSearchResult));
  }

  const onUpdatePOStatusWaitingApproval = async () => {
    setShowWaitingConfirm(false)
    const ids = selected.map((item: PurchaseOrder) => item.id).join(",")
    const res = await callApiNative({ isShowError: true }, dispatch, updatePurchaseOrderStatusWaitingApproval, ids)
    if (res) {
      setDataProgress(res)
      setShowPOProgress(true)
    }
  }

  return (
    <PurchaseOrderListContainer>
          <div className="purchase-order-list margin-top-20">
            <PurchaseOrderFilter
              openSetting={() => setShowSettingColumn(true)}
              params={params}
              onMenuClick={onMenuClick}
              actions={actions}
              onFilter={onFilter}
              listStore={listStore}
            />
            <CustomTable
              className="small-padding"
              bordered
              isRowSelection
              isLoading={tableLoading}
              showColumnSetting={true}
              scroll={{x: 3000}}
              sticky={{offsetScroll: 10, offsetHeader: 55}}
              pagination={{
                pageSize: data.metadata.limit,
                total: data.metadata.total,
                current: data.metadata.page,
                showSizeChanger: true,
                onChange: onPageChange,
                onShowSizeChange: onPageChange,
              }}
              onShowColumnSetting={() => setShowSettingColumn(true)}
              onSelectedChange={onSelect}
              dataSource={data.items}
              columns={columnFinal}
              rowKey={(item: PurchaseOrder) => item.id}
            />
          </div>
        <ExportModal
          visible={showExportModal}
          onCancel={() => setShowExportModal(false)}
          onOk={() => {
            setShowExportModal(false);
            onExport();
          }}
        />
        <ModalSettingColumn
          visible={showSettingColumn}
          onCancel={() => setShowSettingColumn(false)}
          onOk={(data) => {
            setShowSettingColumn(false);
            //save config column
            onSaveConfigColumn(data);
            setColumn(data);
          }}
          data={defaultColumns}
          isSetDefaultColumn
        />
        <Modal
          width={500}
          centered
          visible={showPrintConfirm}
          onCancel={() => setShowPrintConfirm(false)}
          onOk={() => {
            setShowPrintConfirm(false);
            const ids = selected.map((item: PurchaseOrder) => item.id).join(",")
            actionPrint(ids, poPrintType)
          }}
          cancelText={`Hủy`}
          okText={`Đồng ý`}
        >
          <Row align="top">
            <PrinterOutlined
              style={{
                fontSize: 40,
                background: "#2A2A86",
                color: "white",
                borderRadius: "50%",
                padding: 10,
                marginRight: 20,
              }}
            />
            <Space direction="vertical" size="middle">
              <strong className="margin-top-10">Bạn có muốn in {selected.length} đơn đặt hàng đã chọn ?</strong>
              <Radio.Group onChange={(e) => setPOPrintType(e.target.value)} value={poPrintType}>
                <Space direction="vertical">
                  <Radio value={PrintTypePo.PURCHASE_ORDER_FGG}>In đơn đặt hàng FGG</Radio>
                  <Radio value={PrintTypePo.PURCHASE_ORDER}>In đơn đặt hàng NCC</Radio>
                </Space>
              </Radio.Group>
            </Space>
          </Row>
        </Modal>
        <Modal
          width={500}
          centered
          visible={showWaitingConfirm}
          onCancel={() => setShowWaitingConfirm(false)}
          onOk={onUpdatePOStatusWaitingApproval}
          cancelText={`Hủy`}
          okText={`Đồng ý`}
        >
          <Row align="top">
            <strong className="margin-top-10">Bạn xác nhận chờ duyệt {selected.length} đơn đặt hàng đã chọn ?</strong>
          </Row>
        </Modal>
        <POProgressModal
          dataProcess={dataProgress}
          visible={showPoProgress}
          onOk={onCloseProgressModal}
          onCancel={onCloseProgressModal} />
        <ModalDeleteConfirm
          onCancel={() => setConfirmDelete(false)}
          onOk={() => {
            setConfirmDelete(false);
            // dispatch(categoryDeleteAction(idDelete, onDeleteSuccess));
            onDelete();
          }}
          title={`Bạn chắc chắn xóa ${selected.length} đơn đặt hàng ?`}
          subTitle="Các tập tin, dữ liệu bên trong thư mục này cũng sẽ bị xoá."
          visible={isConfirmDelete}
        />
        <div style={{ display: "none" }}>
          <div className="printContent" ref={printElementRef}>
            <div
              dangerouslySetInnerHTML={{
                __html: purify.sanitize(printContent),
              }}
            />
          </div>
        </div>
    </PurchaseOrderListContainer>
  );
};
export default PurchaseOrderListScreen;
