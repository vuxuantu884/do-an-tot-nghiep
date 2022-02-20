import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import { AppConfig } from "config/app.config";
import UrlConfig from "config/url.config";
import { StoreGetListAction } from "domain/actions/core/store.action";
import {
  ApprovalPoProcumentAction,
  ConfirmPoProcumentAction,
  PoProcumentDeleteAction,
  POSearchProcurement,
} from "domain/actions/po/po-procument.action";
import { PageResponse } from "model/base/base-metadata.response";
import { StoreResponse } from "model/core/store.model";
import {
  ProcurementConfirm,
  PurchaseProcument,
  PurchaseProcumentLineItem,
} from "model/purchase-order/purchase-procument";
import moment from "moment";
import querystring from "querystring";
import { Fragment, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import ProcumentConfirmModal from "screens/purchase-order/modal/procument-confirm.modal";
import { formatCurrency } from "utils/AppUtils";
import {
  OFFSET_HEADER_TABLE,
  POStatus,
  ProcumentStatus,
  ProcurementStatus,
  ProcurementStatusName,
} from "utils/Constants";
import {
  ConvertDateToUtc,
  ConvertUtcToLocalDate,
  DATE_FORMAT,
} from "utils/DateUtils";
import { showSuccess } from "utils/ToastUtils";
import { useQuery } from "utils/useQuery";
import TabListFilter from "../../filter/TabList.filter";
import { PoDetailAction } from "domain/actions/po/po.action";
import { StyledComponent } from "./styles";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import CustomFilter from "component/table/custom.filter";
import  { MenuAction } from "component/table/ActionButton";
import ModalConfirm from "component/modal/ModalConfirm";
import ProducmentInventoryMultiModal from "screens/purchase-order/modal/procument-inventory-multi.modal";
import ProcumentInventoryModal from "screens/purchase-order/modal/procument-inventory.modal";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { callApiNative } from "utils/ApiUtils";
import { confirmProcumentsMerge } from "service/purchase-order/purchase-procument.service";
import { ProcurementListWarning } from "../../components/ProcumentListWarning";

const ACTIONS_INDEX = {
  CONFIRM_MULTI: 1,
};

const TabList: React.FC = () => {
  const [storeExpect, setStoreExpect] = useState<number>(-1);
  const dispatch = useDispatch();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [isDetail, setIsDetail] = useState(false);
  const [poId, setPOId] = useState(0);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingRecive, setLoadingRecive] = useState(false);
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [visibleDraft, setVisibleDaft] = useState(false);
  const [visibleConfirm, setVisibleConfirm] = useState(false);
  const [poItems, setPOItem] = useState<PurchaseOrder | null>();
  const [procumentInventory, setProcumentInventory] =
    useState<PurchaseProcument | null>(null);
  const [procumentCode, setProcumentCode] = useState("");
  const [listStore, setListStore] = useState<Array<StoreResponse>>([]);
  const [item, setItem] = useState<PurchaseProcument | null>(null);
  const [selected, setSelected] = useState<Array<PurchaseProcument>>([]);
  const [showWarConfirm, setShowWarConfirm] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [contentWarning,setContentWarning] = useState<ReactNode>();
  const [listProcurement, setListProcurement] =
    useState<Array<PurchaseProcument>>();
  const [data, setData] = useState<PageResponse<PurchaseProcument>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const actions: Array<MenuAction> = useMemo(()=>{
    return [
     {
       id: ACTIONS_INDEX.CONFIRM_MULTI,
       name: "Xác nhận nhanh",
     },
   ]
   },[]);

  const checkConfirmProcurement = useCallback(()=>{
    let pass = true;
    let listProcurementCode = "";

    for (let index = 0; index < selected.length; index++) {
      const element = selected[index];
      if (element.status !== ProcumentStatus.NOT_RECEIVED) {
        listProcurementCode +=`${element.code},`;
        pass = false;
      }
    }
    if (!pass) {
      setContentWarning(()=>ProcurementListWarning(listProcurementCode));
      setShowWarConfirm(true);
      return false;
    }
    for (let index = 0; index < selected.length; index++) {
      const element = selected[index];
      const firstElement = selected[0];
      listProcurementCode = firstElement.code;
      if (firstElement.purchase_order.supplier_id !== element.purchase_order.supplier_id
          || ConvertUtcToLocalDate(firstElement.stock_in_date,DATE_FORMAT.DDMMYYY) !== ConvertUtcToLocalDate(element.stock_in_date,DATE_FORMAT.DDMMYYY)
          || firstElement.store_id !== element.store_id) {
            listProcurementCode +=`, ${element.code},`;
         pass = false;
      }
    }
    if (!pass) {
      setContentWarning(()=>ProcurementListWarning(listProcurementCode));
      setShowWarConfirm(true);
      return false;
    }
    setListProcurement(selected);
    setShowConfirm(true);
  },[selected]);

  const onMenuClick = useCallback((index: number) => {
    switch (index) {
      case ACTIONS_INDEX.CONFIRM_MULTI:
        checkConfirmProcurement();
        break;
      default:
        break;
    }
  }, [checkConfirmProcurement]);

  const ActionComponent = useCallback(()=>{
      let Compoment = () => <span>Mã phiếu nhập kho</span>;
      if (selected?.length > 1) {
        Compoment = () => (
          <CustomFilter onMenuClick={onMenuClick} menu={actions}>
            <Fragment />
          </CustomFilter>
        );
      }
      return <Compoment />;
  },[selected,actions, onMenuClick ])

  const defaultColumns: Array<ICustomTableColumType<PurchaseProcument>> = useMemo(()=> {
    return [
      {
        title: ActionComponent,
        dataIndex: "code",
        fixed: "left",
        width: 150,
        visible: true,
        render: (value, record, index) => {
          return (
            <div
              className="procurement-code"
              onClick={() => handleClickProcurement(record)}>
              {value}
            </div>
          )
        },
      },
      {
        title: "Mã đơn đặt hàng",
        dataIndex: "purchase_order",
        fixed: "left",
        width: 150,
        visible: true,
        render: (value, record, index) => {
          return (
            <Link to={`${UrlConfig.PURCHASE_ORDERS}/${value.id}`}>
              {value.code}
            </Link>
          );
        },
      },
      {
        title: "Nhà cung cấp",
        dataIndex: "purchase_order",
        visible: true,
        render: (value, row) => {
          return (
            <Link
              to={`${UrlConfig.SUPPLIERS}/${row.purchase_order.supplier_id}`}
              className="primary"
              target="_blank"
              style={{ fontSize: "16px" }}
            >
              {value?.supplier}
            </Link>
          )
        }      },
      {
        title: "Merchandiser",
        dataIndex: "purchase_order",
        visible: true,
        render: (value, row) => {
          if (!row || !row.purchase_order.merchandiser_code || !row.purchase_order.merchandiser) return "";
          return (
            <Link
              to={`${UrlConfig.ACCOUNTS}/${row.purchase_order.merchandiser_code}`}
              className="primary"
              target="_blank"
              style={{ fontSize: "16px" }}
            >
              {`${row.purchase_order.merchandiser_code} - ${row.purchase_order.merchandiser}`}
            </Link>
          )
        },
      },
      {
        title: "Kho nhận hàng dự kiến",
        dataIndex: "store",
        render: (value, record, index) => value,
        visible: true,
        width: 200,
      },
      {
        title: "Ngày nhận hàng dự kiến",
        dataIndex: "expect_receipt_date",
        visible: true,
        render: (value, record, index) =>
          ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYYY),
        width: 200,
      },
      {
        title: "Trạng thái phiếu nhập kho",
        dataIndex: "status",
        visible: true,
        render: (status: string) => {
          return (
            <div>
              {status === ProcurementStatus.draft && (
                <div
                  style={{
                    background: "#F5F5F5",
                    borderRadius: "100px",
                    color: "#666666",
                    padding: "3px 10px",
                  }}>
                  {ProcurementStatusName[status]}
                </div>
              )}
              {status === ProcurementStatus.not_received && (
                <div
                  style={{
                    background: "rgba(42, 42, 134, 0.1)",
                    borderRadius: "100px",
                    color: "#2A2A86",
                    padding: "5px 10px",
                  }}>
                  {ProcurementStatusName[status]}
                </div>
              )}
              {status === ProcurementStatus.received && (
                <div
                  style={{
                    background: "rgba(39, 174, 96, 0.1)",
                    borderRadius: "100px",
                    color: "#27AE60",
                    padding: "5px 10px",
                  }}>
                  {ProcurementStatusName[status]}
                </div>
              )}
            </div>
          );
        },
        align: "center",
        width: 200,
      },
      {
        title: "Trạng thái hủy",
        dataIndex: "is_cancelled",
        visible: true,
        render: (value, record, index) =>
          value || record?.status === "cancelled" ? "Đã hủy" : "",
      },
      {
        title: "SL được duyệt",
        align: "center",
        dataIndex: "procurement_items",
        visible: true,
        render: (value, record: PurchaseProcument, index) => {
          if (
            record.status === ProcurementStatus.not_received ||
            record.status === ProcurementStatus.received
          ) {
            let totalConfirmQuantity = 0;
            value.forEach((item: PurchaseProcumentLineItem) => {
              totalConfirmQuantity += item.quantity;
            });
            return totalConfirmQuantity;
          }
        },
      },
      {
        title: "SL thực nhận",
        align: "center",
        dataIndex: "procurement_items",
        visible: true,
        render: (value, record, index) => {
          let totalRealQuantity = 0;
          value.forEach((item: PurchaseProcumentLineItem) => {
            totalRealQuantity += item.real_quantity;
          });
          return formatCurrency(totalRealQuantity, ".");
        },
      },
      {
        title: "Ngày tạo",
        align: "center",
        dataIndex: "created_date",
        visible: true,
        render: (value) => ConvertUtcToLocalDate(value),
      },
      {
        title: "Ngày duyệt",
        dataIndex: "activated_date",
        render: (value, record, index) => ConvertUtcToLocalDate(value),
      },
      {
        title: "Người duyệt",
        dataIndex: "activated_by",
        visible: true,
        render: (value, record, index) => value,
      },
      // {
      //   title: "Ngày nhập kho",
      //   dataIndex: "stock_in_date",
      //   visible: true,
      //   render: (value, record, index) => ConvertUtcToLocalDate(value),
      // },
      // {
      //   title: "Người nhập",
      //   dataIndex: "stock_in_by",
      //   visible: true,
      //   render: (value, record, index) => value,
      // },
    ]
  },[ActionComponent]);

  const [columns, setColumns] = useState<
    Array<ICustomTableColumType<PurchaseProcument>>
  >(defaultColumns);

  useEffect(() => {
    setColumns(defaultColumns);
  }, [selected, defaultColumns]);

  const columnFinal = useMemo(()=>
   columns.filter((item) => item.visible === true)
  ,[columns]);

  let now = moment();
  const initPurchaseOrder = {
    line_items: [],
    policy_price_code: AppConfig.import_price,
    untaxed_amount: 0,
    trade_discount_rate: null,
    trade_discount_value: null,
    trade_discount_amount: 0,
    designer_code: null,
    payments: [],
    procurements: [
      {
        fake_id: new Date().getTime(),
        reference: "",
        store_id: null,
        expect_receipt_date: "",
        procurement_items: [],
        status: ProcumentStatus.DRAFT,
        status_po: POStatus.DRAFTPO,
        note: "",
        actived_date: "",
        actived_by: "",
        stock_in_date: "",
        stock_in_by: "",
      },
    ],
    payment_discount_rate: null,
    payment_discount_value: null,
    payment_discount_amount: 0,
    total_cost_line: 0,
    total: 0,
    cost_lines: [],
    tax_lines: [],
    supplier_id: 0,
    expect_import_date: ConvertDateToUtc(moment()),
    order_date: null,
    status: POStatus.DRAFT,
    receive_status: ProcumentStatus.DRAFT,
    activated_date: null,
    completed_stock_date: null,
    cancelled_date: null,
    completed_date: null,
  };

  const qurery = useQuery();
  const paramsrUrl: any = Object.fromEntries(qurery.entries());

  const onDetail = useCallback((result: PurchaseOrder | null) => {
    setLoading(false);
    setPOItem(result);
  }, []);

  const loadDetail = useCallback(
    (id: number, isLoading, isSuggestDetail: boolean) => {
      dispatch(PoDetailAction(poId, onDetail));
    },
    [dispatch, poId, onDetail]
  );

  const onAddProcumentSuccess = useCallback(
    (isSuggest) => {
      loadDetail(poId, true, isSuggest);
      setLoadingData((prevState) => !prevState);
    },
    [poId, loadDetail]
  );

  const onPageChange = (page: number, size?: number) => {
    paramsrUrl.page = page;
    paramsrUrl.limit = size;
    history.replace(
      `${UrlConfig.PROCUREMENT}?${querystring.stringify(paramsrUrl)}`
    );
  };

  const onDeleteProcumentCallback = useCallback(
    (result) => {
      if (result !== null) {
        showSuccess("Huỷ phiếu nháp thành công");
        setVisibleDaft(false);
        onAddProcumentSuccess && onAddProcumentSuccess(false);
      }
    },
    [onAddProcumentSuccess]
  );

  const onDeleteProcument = useCallback(
    (value: PurchaseProcument) => {
      if (poId && value.id) {
        dispatch(
          PoProcumentDeleteAction(poId, value.id, onDeleteProcumentCallback)
        );
      }
    },
    [dispatch, poId, onDeleteProcumentCallback]
  );

  const onConfirmProcumentCallback = useCallback(
    (value: PurchaseProcument | null) => {
      setLoadingConfirm(false);
      if (value === null) {
      } else {
        showSuccess("Thêm phiếu nháp kho thành công");
        setVisibleDaft(false);
        onAddProcumentSuccess && onAddProcumentSuccess(false);
      }
    },
    [onAddProcumentSuccess]
  );

  const onConfirmProcument = useCallback(
    (value: PurchaseProcument) => {
      if (poId && value.id) {
        setLoadingConfirm(true);
        dispatch(
          ApprovalPoProcumentAction(
            poId,
            value.id,
            value,
            onConfirmProcumentCallback
          )
        );
      }
    },
    [dispatch, poId, onConfirmProcumentCallback]
  );

  const onReciveProcumentCallback = useCallback(
    (value: PurchaseProcument | null) => {
      setLoadingConfirm(false);
      if (value !== null) {
        showSuccess("Xác nhận nhập kho thành công");
        setLoadingRecive(false);
        setIsDetail(true);
        onAddProcumentSuccess && onAddProcumentSuccess(false);
      }
    },
    [onAddProcumentSuccess]
  );

  const onReciveMuiltiProcumentCallback = useCallback(
    (value: boolean) => {
      setLoadingConfirm(false);
      if (value !== null) {
        showSuccess("Xác nhận nhập kho thành công");
        setShowConfirm(false);
        setLoadingRecive(false);
        onAddProcumentSuccess && onAddProcumentSuccess(false);
      }
    },
    [onAddProcumentSuccess]
  );

  const onReciveProcument = useCallback(
    (value: PurchaseProcument) => {
      if (poId && value.id) {
        setLoadingRecive(true);
        dispatch(
          ConfirmPoProcumentAction(
            poId,
            value.id,
            value,
            onReciveProcumentCallback
          )
        );
      }
    },
    [dispatch, poId, onReciveProcumentCallback]
  );

  const onReciveMultiProcument = useCallback(
   async (value: Array<PurchaseProcumentLineItem>) => {
      if (listProcurement) {
        const PrucurementConfirm = {
          procurement_items: value,
          refer_ids: listProcurement.map(e=>e.id)
        } as ProcurementConfirm;
        const res  = await callApiNative({isShowLoading: false},dispatch, confirmProcumentsMerge,PrucurementConfirm);
        if (res) {
          onReciveMuiltiProcumentCallback(true);
        }
      }
    },
    [listProcurement,dispatch,onReciveMuiltiProcumentCallback]
  );

  const [showSettingColumn, setShowSettingColumn] = useState(false);

  const handleClickProcurement = (record: PurchaseProcument | any) => {
    const { status = "", expect_store_id = 144, code } = record;
    switch (status) {
      case ProcumentStatus.DRAFT:
        setVisibleDaft(true);
        setItem(record);
        break;
      case ProcumentStatus.NOT_RECEIVED:
        setProcumentInventory(record);
        setVisibleConfirm(true);
        setIsDetail(false);
        break;
      default:
        setProcumentInventory(record);
        setVisibleConfirm(true);
        setIsDetail(true);
        break;
    }
    setProcumentCode(code);
    setPOId(() => {
      return record?.purchase_order.id;
    });
    setStoreExpect(expect_store_id);
  };

  const onSelectedChange = useCallback(
    (selectedRow: Array<PurchaseProcument>) => {

      setSelected(
        selectedRow.filter(function (el) {
          return el !== undefined;
        })
      );
    },
    []
  );

  useEffect(() => {
    if (visibleDraft) {
      dispatch(PoDetailAction(poId, onDetail));
    }
  }, [dispatch, poId, visibleDraft, onDetail]);

  const search = useCallback(()=> {
    setLoading(true);
    dispatch(
      POSearchProcurement(paramsrUrl, (result) => {
        setLoading(false);
        if (result) {
          setData(result);
        }
      })
    );
  },[dispatch, paramsrUrl])

  useEffect(() => {
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.location.search, dispatch, loadingData]);

  useEffect(() => {
    dispatch(StoreGetListAction(setListStore));
  }, [dispatch]);

  const titleMultiConfirm = useMemo(()=>{
    return <>
      Xác nhận nhập kho {listProcurement?.map((e, i)=>{
         return  <>
            <Link target="_blank" to={`${UrlConfig.PURCHASE_ORDERS}/${e.purchase_order.id}`}>
              {e.code}
            </Link>{i === (listProcurement.length  - 1) ? "": ", "}
         </>
      })}
    </>
  },[listProcurement]);

  return (
    <StyledComponent>
      <div className="margin-top-20">
        <TabListFilter paramsUrl={paramsrUrl} onClickOpen={() => setShowSettingColumn(true)} />
        <CustomTable
          selectedRowKey={selected.map(e=>e.id)}
          isLoading={loading}
          dataSource={data.items}
          sticky={{ offsetScroll: 5, offsetHeader: OFFSET_HEADER_TABLE }}
          columns={columnFinal}
          rowKey={(item) => item.id}
          scroll={{ x: 2000 }}
          pagination={{
            pageSize: data.metadata.limit,
            total: data.metadata.total,
            current: data.metadata.page,
            showSizeChanger: true,
            onChange: onPageChange,
            onShowSizeChange: onPageChange,
          }}
          onSelectedChange={(selectedRows) => onSelectedChange(selectedRows)}
        />
        {/* Duyệt phiếu nháp */}
        <ProcumentConfirmModal
          isEdit={false}
          items={[]}
          stores={listStore}
          poData={poItems || initPurchaseOrder}
          procumentCode={procumentCode}
          now={now}
          visible={visibleDraft}
          item={item}
          onOk={(value: PurchaseProcument) => {
            onConfirmProcument(value);
          }}
          onDelete={onDeleteProcument}
          loading={loadingConfirm}
          defaultStore={storeExpect}
          onCancel={() => {
            setVisibleDaft(false);
          }}
        />
        <ModalSettingColumn
          visible={showSettingColumn}
          onCancel={() => setShowSettingColumn(false)}
          onOk={(data) => {
            setShowSettingColumn(false);
            setColumns(data);
          }}
          data={columns}
        />
        {/* Xác nhận nhập */}
        <ProducmentInventoryMultiModal
          title={titleMultiConfirm}
          visible={showConfirm}
          listProcurement={listProcurement}
          onOk={(value: Array<PurchaseProcumentLineItem>) => {
            if (value) onReciveMultiProcument(value);
          }}
          loading={loadingRecive}
          onCancel={() => {
            setShowConfirm(false);
          }}
        />

        {/* Xác nhận nhập và Chi tiết phiếu nhập kho */}
        <ProcumentInventoryModal
          isDetail={isDetail}
          loadDetail={loadDetail}
          isEdit={false}
          items={[]}
          stores={listStore}
          now={now}
          visible={visibleConfirm}
          item={procumentInventory}
          onOk={(value: PurchaseProcument) => {
            onReciveProcument(value);
          }}
          onDelete={onDeleteProcument}
          loading={loadingRecive}
          defaultStore={storeExpect}
          procumentCode={procumentCode}
          onCancel={() => {
            setVisibleConfirm(false);
          }}
        />

          <ModalConfirm
              onCancel={(()=>{
                setShowWarConfirm(false);
              })}
              onOk={()=>{
                setSelected([]);
                setShowWarConfirm(false);
              }}
              okText="Chọn lại"
              cancelText="Hủy"
              title={`Nhận hàng từ nhiều phiếu nhập kho`}
              subTitle={contentWarning}
              visible={showWarConfirm}
            />
      </div>
    </StyledComponent>
  );
};

export default TabList;
