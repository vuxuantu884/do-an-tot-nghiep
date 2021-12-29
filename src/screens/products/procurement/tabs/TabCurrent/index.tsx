import { LoadingOutlined } from "@ant-design/icons";
import { Button } from "antd";
import CustomTable from "component/table/CustomTable";
import {
  ApprovalPoProcumentAction,
  PoProcumentDeleteAction,
  POSearchProcurement
} from "domain/actions/po/po-procument.action";
import { PoDetailAction } from "domain/actions/po/po.action";
import { PageResponse } from "model/base/base-metadata.response";
import { StoreResponse } from "model/core/store.model";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import {
  ProcurementQuery,
  PurchaseProcument
} from "model/purchase-order/purchase-procument";
import moment from "moment";
import { Fragment, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import ProcumentInventoryModal from "screens/purchase-order/modal/procument-inventory.modal";
import { ProcumentStatus } from "utils/Constants";
import { ConvertDateToUtc, getDateFromNow } from "utils/DateUtils";
import { showSuccess } from "utils/ToastUtils";
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

  const currentDate = getDateFromNow(0, "day");
  const [params, setParams] = useState<ProcurementQuery>({
    is_cancel: false,
    status: ProcumentStatus.NOT_RECEIVED,
    expect_receipt_from: ConvertDateToUtc(currentDate.startOf("days")),
    expect_receipt_to: ConvertDateToUtc(currentDate.endOf("days")),
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
  const onReciveProcument = useCallback(
    (poId: number, purchaseProcument: PurchaseProcument) => {
      if (purchaseProcument && poId) {
        setIsLoadingReceive(true);
        dispatch(
          ApprovalPoProcumentAction(
            poId,
            purchaseProcument.id,
            purchaseProcument,
            (result: PurchaseProcument | null) => {
              setShowLoadingBeforeShowModal(-1);
              setIsLoadingReceive(false);
              setIsVisibleReceiveModal(false);
              showSuccess("Xác nhận phiếu nhập kho thành công");
            }
          )
        );
      }
    },
    [dispatch]
  );
  useEffect(() => {
    search();
  }, [search]);
  return (
    <div className="margin-top-20">
      <CustomTable
        isLoading={loading}
        dataSource={data.items}
        sticky={{ offsetScroll: 5, offsetHeader: 109 }}
        columns={[
          {
            title: "Mã nhập kho",
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
            ),
          },
        ]}
        rowKey={(item) => item.id}
        pagination={{
          pageSize: data.metadata.limit,
          total: data.metadata.total,
          current: data.metadata.page,
          showSizeChanger: true,
          onChange: onPageChange,
          onShowSizeChange: onPageChange,
        }}
      />

      <ProcumentInventoryModal
        isEdit={false}
        items={purchaseOrderItem.line_items}
        stores={[] as Array<StoreResponse>}
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
    </div>
  );
};

export default TabCurrent;
