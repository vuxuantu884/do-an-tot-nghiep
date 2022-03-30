import { LoadingOutlined } from "@ant-design/icons";
import { Button } from "antd";
import AuthWrapper from "component/authorization/AuthWrapper";
import ModalConfirm from "component/modal/ModalConfirm";
import { MenuAction } from "component/table/ActionButton";
import CustomFilter from "component/table/custom.filter";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { PurchaseOrderPermission } from "config/permissions/purchase-order.permission";
import { StyledComponent } from "./styles";
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
import { ConvertUtcToLocalDate, DATE_FORMAT, getEndOfDay } from "utils/DateUtils";
import { showSuccess } from "utils/ToastUtils";
import { ProcurementListWarning } from "../../components/ProcumentListWarning";
import { Link } from "react-router-dom";
import UrlConfig from "../../../../../config/url.config";
import TabCurrentFilter from "../../filter/TabCurrent.filter";
import { getQueryParams, useQuery } from "utils/useQuery";
import { useHistory } from "react-router";
import { generateQuery } from "utils/AppUtils";

const ACTIONS_INDEX = {
  CONFIRM_MULTI: 1,
};

const TabCurrent: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
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
  const [params, setParams] = useState<ProcurementQuery>({});
  const search = useCallback(() => {
    const search = new URLSearchParams(history.location.search);
    const newParams = {
      ...params,
      is_cancel: false,
      status: ProcumentStatus.NOT_RECEIVED,
      expect_receipt_to: getEndOfDay(today),
      ...getQueryParams(search),
    }
    setLoading(true);
    dispatch(
      POSearchProcurement(newParams, (result) => {
        setLoading(false);
        if (result) {
          setData(result);
        }
      })
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, history.location.search, params]);
  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      setParams({ ...params });
      history.replace(
        `${UrlConfig.PROCUREMENT}/today?${generateQuery(params)}`
      );
    },
    [history, params]
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
            search()
            setShowLoadingBeforeShowModal(-1);
            setIsLoadingReceive(false);
            setIsVisibleReceiveModal(false);
            showSuccess("Xoá phiếu nhập kho thành công");
          })
        );
      }
    },
    [dispatch, search]
  );

  const confirmResult = useCallback(() => {
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
        render: (value) => value,
      },
      {
        title: "Mã đơn đặt hàng",
        dataIndex: "purchase_order",
        fixed: "left",
        width: 150,
        visible: true,
        render: (value) => {
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
              className="link-underline"
              target="_blank"
            >
              {value?.supplier}
            </Link>
          )
        }
      },
      {
        title: "Kho nhận hàng dự kiến",
        dataIndex: "store",
        render: (value) => value,
      },
      {
        title: "Ngày nhận hàng dự kiến",
        dataIndex: "expect_receipt_date",
        visible: true,
        render: (value) =>
          ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYYY),
        width: 200,
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
  }, [search, history.location.search]);

  const query = useQuery();
  let paramsUrl: any = useMemo(() => {
    return {...getQueryParams(query)}
  }, [query]);

  return (
    <StyledComponent>
      <div className="margin-top-20">
        <TabCurrentFilter paramsUrl={paramsUrl} />
        <CustomTable
          isRowSelection
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
    </StyledComponent>
  );
};

export default TabCurrent;
