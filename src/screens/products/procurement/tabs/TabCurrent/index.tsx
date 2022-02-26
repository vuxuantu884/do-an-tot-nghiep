import { LoadingOutlined } from "@ant-design/icons";
import { Button } from "antd";
import AuthWrapper from "component/authorization/AuthWrapper";
import ModalConfirm from "component/modal/ModalConfirm";
import { MenuAction } from "component/table/ActionButton";
import CustomFilter from "component/table/custom.filter";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { PurchaseOrderPermission } from "config/permissions/purchase-order.permission";
import {
  ConfirmPoProcumentAction,
  PoProcumentDeleteAction,
  POSearchProcurement
} from "domain/actions/po/po-procument.action";
import { PoDetailAction } from "domain/actions/po/po.action";
import { PageResponse } from "model/base/base-metadata.response";
import { StoreResponse } from "model/core/store.model";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import {
  ProcurementConfirm,
  ProcurementQuery,
  PurchaseProcument,
  PurchaseProcumentLineItem
} from "model/purchase-order/purchase-procument";
import moment from "moment";
import { Fragment, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import ProducmentInventoryMultiModal from "screens/purchase-order/modal/procument-inventory-multi.modal";
import ProcumentInventoryModal from "screens/purchase-order/modal/procument-inventory.modal";
import { confirmProcumentsMerge } from "service/purchase-order/purchase-procument.service";
import { callApiNative } from "utils/ApiUtils";
import { ProcumentStatus } from "utils/Constants";
import { ConvertUtcToLocalDate, DATE_FORMAT, getEndOfDay, getStartOfDay } from "utils/DateUtils";
import { showSuccess } from "utils/ToastUtils";
import { ProcurementListWarning } from "../../components/ProcumentListWarning";

const ACTIONS_INDEX = {
  CONFIRM_MULTI: 1,
};

const TabCurrent: React.FC = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PageResponse<PurchaseProcument>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const [selectedProcurement, setSelectedProcurement] = useState<PurchaseProcument>(
    {} as PurchaseProcument
  );
  const [purchaseOrderItem, setPurchaseOrderItem] = useState<PurchaseOrder>(
    {} as PurchaseOrder
  );
  const [isVisibleReceiveModal, setIsVisibleReceiveModal] = useState<boolean>(false);
  const [isLoadingReceive, setIsLoadingReceive] = useState<boolean>(false);
  const [showLoadingBeforeShowModal, setShowLoadingBeforeShowModal] =
    useState<number>(-1);

  const [selected, setSelected] = useState<Array<PurchaseProcument>>([]);
  const [showWarConfirm, setShowWarConfirm] = useState<boolean>(false);
  const [contentWarning,setContentWarning] = useState<ReactNode>();
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [listProcurement, setListProcurement] =
  useState<Array<PurchaseProcument>>();
  const actions: Array<MenuAction> = useMemo(()=>{
    return [
     {
       id: ACTIONS_INDEX.CONFIRM_MULTI,
       name: "Xác nhận nhanh",
     },
   ]
   },[]);

  const today = new Date();
  const [params, setParams] = useState<ProcurementQuery>({
    is_cancel: false,
    status: ProcumentStatus.NOT_RECEIVED,
    expect_receipt_from: getStartOfDay(today),
    expect_receipt_to: getEndOfDay(today),
  });
  const search = useCallback(() => {
    setLoading(true);
    dispatch(
      POSearchProcurement(params, (result) => {
        setLoading(false);
        if (result) {
          setData(result);
        }
      })
    );
  }, [dispatch, params]);
  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      setParams({ ...params });
    },
    [params]
  );

  const onDetail = useCallback((result: PurchaseOrder | null) => {
    if (result) { 
      setPurchaseOrderItem(result);
      setShowLoadingBeforeShowModal(-1);
    }
  }, []);
  const loadDetail = useCallback(
    (id: number) => {
      dispatch(PoDetailAction(id, onDetail));
    },
    [dispatch, onDetail]
  );
  const onDeleteProcument = useCallback(
    (poId: number, procurementId: number) => {
      if (poId && procurementId) {
        dispatch(
          PoProcumentDeleteAction(poId, procurementId, () => {
            setShowLoadingBeforeShowModal(-1);
            setIsLoadingReceive(false);
            setIsVisibleReceiveModal(false);
            showSuccess("Xoá phiếu nhập kho thành công");
          })
        );
      }
    },
    [dispatch]
  );

  const confirmResult = useCallback((result: PurchaseProcument | null)=>{
    setShowLoadingBeforeShowModal(-1);
    setIsLoadingReceive(false);
    setIsVisibleReceiveModal(false);
    showSuccess("Xác nhận phiếu nhập kho thành công");
    search();
  },[search]);

  const onReciveProcument = useCallback(
    (poId: number, purchaseProcument: PurchaseProcument) => {
      if (purchaseProcument && poId) {
        setIsLoadingReceive(true);
        dispatch(
          ConfirmPoProcumentAction(
            poId,
            purchaseProcument.id,
            purchaseProcument,
            confirmResult
          )
        );
      }
    },
    [dispatch, confirmResult]
  );

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
    let Compoment = () => <span>Mã nhập kho</span>;
    if (selected?.length > 1) {
      Compoment = () => (
        <CustomFilter onMenuClick={onMenuClick} menu={actions}>
          <Fragment />
        </CustomFilter>
      );
    }
    return <Compoment />;
},[selected, actions, onMenuClick]);

  const defaultColumns: Array<ICustomTableColumType<PurchaseProcument>> = useMemo(()=> {
    return [
      {
        title: <ActionComponent/>,
        dataIndex: "code",
        render: (value, record, index) => value,
      },
      {
        title: "Kho nhận hàng dự kiến",
        dataIndex: "store",
        render: (value, record, index) => value,
      },
      {
        title: "Hành động",
        dataIndex: "purchase_order",
        render: (value, record: PurchaseProcument, index) => (
          <AuthWrapper
            acceptPermissions={[PurchaseOrderPermission.procurements_confirm]}
          >
            <Button
              onClick={() => {
                setShowLoadingBeforeShowModal(index);
                setIsVisibleReceiveModal(true);
                setSelectedProcurement(record);
                loadDetail(record.purchase_order.id);
              }}
            >
              {showLoadingBeforeShowModal === index ? (
                <LoadingOutlined />
              ) : (
                <Fragment />
              )}{" "}
              Nhận hàng
            </Button>
          </AuthWrapper> 
        ),
      },
    ]
  },[ActionComponent,loadDetail, showLoadingBeforeShowModal]);

  const [columns, setColumns] = useState<
    Array<ICustomTableColumType<PurchaseProcument>>
  >(defaultColumns);

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

  const onReciveMuiltiProcumentCallback = useCallback(
    (value: boolean) => {
      if (value !== null) {
        setSelected([]);
        showSuccess("Xác nhận nhập kho thành công");
        setShowConfirm(false);
        search();
      }
    },
    [search]
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
     [listProcurement,dispatch, onReciveMuiltiProcumentCallback]
   );

  useEffect(() => {
    setColumns(defaultColumns);
  }, [selected, defaultColumns]);

  useEffect(() => {
    search();
  }, [search]);
  
  return (
    <div className="margin-top-20">
      <CustomTable
        selectedRowKey={selected.map(e=>e.id)}
        isLoading={loading}
        dataSource={data.items}
        sticky={{ offsetScroll: 5, offsetHeader: 109 }}
        columns={columns}
        rowKey={(item) => item.id}
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

      <ProcumentInventoryModal
        loadDetail={loadDetail}
        isEdit={false}
        items={purchaseOrderItem.line_items}
        stores={[] as Array<StoreResponse>}
        procumentCode={''}
        poData={purchaseOrderItem}
        now={moment(purchaseOrderItem.created_date)}
        visible={isVisibleReceiveModal && showLoadingBeforeShowModal === -1}
        item={selectedProcurement}
        onOk={(value: PurchaseProcument) => {
          onReciveProcument(purchaseOrderItem.id, value);
        }}
        onDelete={() => onDeleteProcument(purchaseOrderItem.id, selectedProcurement.id)}
        loading={isLoadingReceive}
        defaultStore={-1}
        onCancel={() => {
          setIsVisibleReceiveModal(false);
        }}
      />

      {/* Xác nhận nhập */}
      <ProducmentInventoryMultiModal
          title={`Xác nhận nhập kho ${listProcurement?.map(e=> e.code).toString()}`}
          visible={showConfirm}
          listProcurement={listProcurement}
          onOk={(value: Array<PurchaseProcumentLineItem>) => {
            if (value) onReciveMultiProcument(value);
          }}
          loading={isLoadingReceive}
          onCancel={() => {
            setShowConfirm(false);
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
  );
};

export default TabCurrent;
