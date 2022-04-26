import { Button, Card, Row, Space } from "antd";
import exportIcon from "assets/icon/export.svg";
import AuthWrapper from "component/authorization/AuthWrapper";
import ContentContainer from "component/container/content.container";
import PurchaseOrderFilter from "component/filter/purchase-order.filter";
import ButtonCreate from "component/header/ButtonCreate";
import { MenuAction } from "component/table/ActionButton";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import TagStatus, { TagStatusType } from "component/tag/tag-status";
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
  PurchaseOrder,
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
import { getPurchaseOrderConfigService } from "service/purchase-order/purchase-order.service";
import { formatCurrency, generateQuery } from "utils/AppUtils";
import { COLUMN_CONFIG_TYPE, PoPaymentStatus, POStatus, ProcumentStatus, ArrPoStatus } from "utils/Constants";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import "./purchase-order-list.scss";
import { PurchaseOrderListContainer } from "./purchase-order-list.style";
import EditNote from "../order-online/component/edit-note";
import statusDraft from 'assets/icon/status-draft.svg'
import statusFinalized from 'assets/icon/status-finalized.svg'
import statusStored from 'assets/icon/status-stored.svg'
import statusFinished from 'assets/icon/status-finished.svg'
import statusCompleted from 'assets/icon/status-completed.svg'
import statusCancelled from 'assets/icon/status-cancelled.svg'

const ModalDeleteConfirm = lazy(() => import("component/modal/ModalDeleteConfirm"))
const ModalSettingColumn = lazy(() => import("component/table/ModalSettingColumn"))
const ExportModal = lazy(() => import("screens/purchase-order/modal/export.modal"))

const actionsDefault: Array<MenuAction> = [
  {
    id: 1,
    name: "Xóa",
  },
];
const PurchaseOrderListScreen: React.FC = () => {
  const query = useQuery();
  const history = useHistory();
  const dispatch = useDispatch();
  const isFirstLoad = useRef(true);
  const [tableLoading, setTableLoading] = useState(true);
  const [isError, setError] = useState(false);
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  const [isConfirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [selected, setSelected] = useState<Array<PurchaseOrder>>([]);
  const [listStore, setListStore] = useState<Array<StoreResponse>>([]);
  const [listExportFile, setListExportFile] = useState<Array<string>>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const userReducer = useSelector((state: RootReducerType) => state.userReducer);
  const {account} = userReducer;
  const [lstConfig, setLstConfig] = useState<Array<FilterConfig>>([]);

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
    switch (index) {
      case 1:
        setConfirmDelete(true);
        // onDelete();
        break;
    }
  }, []);

  const [canDeletePO] = useAuthorization({
    acceptPermissions: [PurchaseOrderPermission.delete],
  });
  const actions = useMemo(() => {
    return actionsDefault.filter((item) => {
      if (item.id === 1) {
        return canDeletePO;
      }
      return false;
    });
  }, [canDeletePO]);

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
        render: (value: string, record) => {
          let type = TagStatusType.normal;
          let icon = "";
          if (!value) {
            return "";
          }
          switch (record.status) {
            case POStatus.FINALIZED:
              type = TagStatusType.primary;
              icon = statusFinalized
              break;
            case POStatus.STORED:
              type = TagStatusType.primary;
              icon = statusStored
              break;
            case POStatus.CANCELLED:
              type = TagStatusType.danger;
              icon = statusCancelled
              break;
            case POStatus.FINISHED:
              type = TagStatusType.normal;
              icon = statusFinished
              break;
            case POStatus.COMPLETED:
              type = TagStatusType.success;
              icon = statusCompleted
              break;
            case POStatus.DRAFT:
              type = TagStatusType.primary;
              icon = statusDraft
              break;
          }

          return <TagStatus icon={icon} type={type}>{ArrPoStatus.find(e=>e.key === value)?.value}</TagStatus>;
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
        width: 120,
      },
      {
        title: "Tổng SL sp",
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
        width: 150,
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
        width: 200,
      },
      {
        title: "Ngày hoàn thành đơn",
        dataIndex: "completed_date",
        render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
        visible: true,
        width: 200,
      },
      {
        title: "Ngày hủy đơn",
        dataIndex: "cancelled_date",
        render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
        visible: true,
        width: 200,
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
  }, []);

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

  const deleteCallback = useCallback(() => {
    selected.splice(0, selected.length);
    showSuccess("Xóa đơn đặt hàng thành công");
    setTableLoading(true);
    dispatch(PoSearchAction(params, setSearchResult));
  }, [dispatch, params, setSearchResult, selected]);

  const onDelete = useCallback(() => {
    if (selected.length === 0) {
      showWarning("Vui lòng chọn phần tử cần xóa");
      return;
    }

    if (selected.length === 1) {
      let id = selected[0].id;
      dispatch(PODeleteAction(id, deleteCallback));
      return;
    }
  }, [deleteCallback, dispatch, selected]);

  const onSaveConfigColumn = useCallback((data: Array<ICustomTableColumType<PurchaseOrder>>) => {
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

  }, [dispatch,account?.code, lstConfig]);

  return (
    <PurchaseOrderListContainer>
      <ContentContainer
        isError={isError}
        title="Quản lý đơn đặt hàng"
        breadcrumb={[
          {
            name: "Kho hàng",
          },
          {
            name: "Đặt hàng",
            path: `${UrlConfig.PURCHASE_ORDERS}`,
          },
        ]}
        extra={
          <Row>
            <Space>
              <Button
                hidden
                className="light"
                size="large"
                icon={<img src={exportIcon} style={{marginRight: 8}} alt="" />}
                onClick={() => {
                  setShowExportModal(true);
                }}
              >
                Xuất file
              </Button>
              <AuthWrapper acceptPermissions={[PurchaseOrderPermission.create]}>
                <ButtonCreate child="Thêm đơn đặt hàng" path={`${UrlConfig.PURCHASE_ORDERS}/create`} />
              </AuthWrapper>
            </Space>
          </Row>
        }
      >
        <Card>
          <div className="purchase-order-list">
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
        </Card>
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
          data={columns}
        />
        <ModalDeleteConfirm
          onCancel={() => setConfirmDelete(false)}
          onOk={() => {
            setConfirmDelete(false);
            // dispatch(categoryDeleteAction(idDelete, onDeleteSuccess));
            onDelete();
          }}
          title="Bạn chắc chắn xóa đơn đặt hàng ?"
          subTitle="Các tập tin, dữ liệu bên trong thư mục này cũng sẽ bị xoá."
          visible={isConfirmDelete}
        />
      </ContentContainer>
    </PurchaseOrderListContainer>
  );
};
export default PurchaseOrderListScreen;
