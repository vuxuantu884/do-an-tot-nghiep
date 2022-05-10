import { Button, Form, Input, Space } from "antd"
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container"
import ModalConfirm from "component/modal/ModalConfirm";
import UrlConfig from "config/url.config";
import arrowLeft from "assets/icon/arrow-back.svg";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { cloneDeep, debounce, isEmpty } from "lodash";
import { SupplierResponse } from "model/core/supplier.model";
import { PageResponse } from "model/base/base-metadata.response";
import { useDispatch } from "react-redux";
import { SupplierSearchAction } from "domain/actions/core/supplier.action";
import { Store } from "antd/lib/form/interface";
import { callApiNative } from "utils/ApiUtils";
import { getStoreApi } from "service/inventory/transfer/index.service";
import { AccountStoreResponse } from "model/account/account.model";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { getAccountDetail } from "service/accounts/account.service";
import { POProcumentField, ProcurementManual } from "model/purchase-order/purchase-procument";
import ManualForm from "./components/ManualForm";
import LineItems from "./components/LineItems";
import { listPurchaseOrderBySupplier } from "service/purchase-order/purchase-order.service";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import { POField } from "model/purchase-order/po-field";
import { showError, showSuccess } from "utils/ToastUtils";
import { PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import { PurchaseProcumentLineItem } from "model/purchase-order/purchase-procument";
import { createPurchaseProcumentManualService } from "service/purchase-order/purchase-procument.service";


const ProcurementCreateManualScreen: React.FC = () => {
  const [isVisibleModalWarning, setIsVisibleModalWarning] = useState<boolean>(false);
  const [isSelectSupplier, setIsSelectSupplier] = useState<boolean>(false);
  const [loadingSearch, setLoadingSearch] = useState<boolean>(false);
  const [data, setData] = useState<Array<SupplierResponse>>([]);
  const [accountStores, setAccountStores] = useState<Array<AccountStoreResponse>>([]);
  const [listStore, setListStore] = useState<Array<Store>>([]);
  const [listPO, setListPO] = useState<Array<PurchaseOrder>>([])
  const [poData, setPOData] = useState<PurchaseOrder>()
  const [poLoading, setPOLoading] = useState<boolean>(false)
  const [poDisable, setPODisable] = useState<boolean>(true)
  const history = useHistory()
  const dispatch = useDispatch()
  const [formMain] = Form.useForm()

  const getStores = useCallback(async () => {
    const res = await callApiNative({ isShowLoading: false }, dispatch, getStoreApi, { status: "active", simple: true });
    if (res) {
      setListStore(res);
    }
  }, [dispatch]);

  useEffect(() => {
    dispatch(StoreGetListAction(setListStore));
  }, [dispatch])

  const getMe = useCallback(async () => {
    const res = await callApiNative({ isShowLoading: false }, dispatch, getAccountDetail);
    if (res && res.account_stores) {
      setAccountStores(res.account_stores);
    }
  }, [dispatch]);

  const getPOBySupplier = useCallback(async (id) => {
    setPOLoading(true)
    const res = await callApiNative({ isShowLoading: false }, dispatch, listPurchaseOrderBySupplier, id);
    if (res && res.length > 0) {
      setListPO(res);
      setPOLoading(false)
    } else {
      setPOLoading(false)
    }
  }, [dispatch])

  useEffect(() => {
    if (isSelectSupplier) setPODisable(false)
    else setPODisable(true)
  }, [isSelectSupplier])

  useEffect(() => {
    getMe()
    getStores()
  }, [dispatch, getStores, getMe])

  useEffect(() => {
    if (listStore.length === 0) return;

    if (accountStores?.length === 1) {
      listStore.forEach((element) => {
        if (element.id === accountStores[0].store_id) {
          formMain.setFieldsValue({ [POProcumentField.store_id]: element.id })
        }
      });
    }

    if (accountStores?.length === 0) {
      const newStore = listStore.map((i) => {
        return {
          store_id: i.id,
          store: i.name,
        }
      });
      setAccountStores(newStore);
    }
  }, [listStore, accountStores, formMain]);

  const onResult = useCallback((result: PageResponse<SupplierResponse>) => {
    setLoadingSearch(false);
    setData(result.items);
  }, []);

  const debouncedSearchSupplier = useMemo(
    () =>
      debounce((keyword: string) => {
        setLoadingSearch(true);
        dispatch(SupplierSearchAction({ condition: keyword.trim(), status: "active" }, onResult));
      }, 300),
    [dispatch, onResult]
  );

  const onChangeKeySearchSupplier = (keyword: string) => {
    debouncedSearchSupplier(keyword);
  };

  const removeSupplier = () => {
    formMain.setFieldsValue({
      [POProcumentField.supplier_id]: undefined,
      [POProcumentField.supplier]: null,
    });
    removePOCode()
    setListPO([])
    setIsSelectSupplier(false);
  };

  const removePOCode = () => {
    formMain.setFieldsValue({
      [POField.code]: null,
      [POField.id]: undefined,
      [POField.reference]: undefined,
    });
    setPOData(undefined)
  }

  const onSelect = (value: string) => {
    let index = data.findIndex((item) => item.id === +value);
    let supplier = data[index];
    getPOBySupplier(supplier.id)

    formMain.setFieldsValue({
      [POProcumentField.supplier_id]: value,
      [POProcumentField.supplier]: data[index].name,
      [POProcumentField.supplier_phone]: supplier.phone,
    });
    setIsSelectSupplier(true);
  };

  const onSelectPO = useCallback((value: any) => {
    let index = listPO.findIndex((item) => item.id === +value);
    let poData = listPO[index];
    setPOData(poData)
    let newLineItem: Array<PurchaseOrderLineItem> = poData.line_items ?? [];
    let result: Array<PurchaseProcumentLineItem> = []
    newLineItem.forEach((item) => {
      result.push({
        barcode: item.barcode,
        line_item_id: item.position,
        sku: item.sku,
        variant: item.variant,
        variant_image: item.variant_image,
        ordered_quantity: item.quantity,
        planned_quantity: item.planned_quantity,
        accepted_quantity: item.receipt_quantity,
        quantity: item.quantity,
        real_quantity: 0,
        note: "",
      });
    });
    formMain.setFieldsValue({
      [POField.code]: poData.code,
      [POField.reference]: poData.reference,
      [POField.id]: poData.id,
      [POProcumentField.procurement_items]: result
    });
  }, [formMain, listPO])

  const onQuantityChange = useCallback(
    (quantity, index: any) => {
      let procurement_items: Array<PurchaseProcumentLineItem> =
        formMain.getFieldValue(POProcumentField.procurement_items);
      if (quantity !== undefined && index !== undefined) {
        procurement_items[index].real_quantity = quantity * 1;
        procurement_items[index].accepted_quantity = quantity * 1
        procurement_items[index].line_item_id = index
        delete procurement_items[index].code
      }
      formMain.setFieldsValue({ [POProcumentField.procurement_items]: [...procurement_items] });
    },
    [formMain]
  );

  const onChangeStore = useCallback((value: any) => {
    const store = accountStores.find((e) => e.store_id === value)
    formMain.setFieldsValue({ [POProcumentField.store_id]: value, [POProcumentField.store]: store?.store })
  }, [accountStores, formMain])

  const onFinish = async(data: any) => {
    if(data.procurement_items.every((item: PurchaseProcumentLineItem) => item.real_quantity === 0)) {
      showError('Vui lòng nhập số lượng sản phẩm')
      return
    }
    const procurementItemClone: Array<PurchaseProcumentLineItem> = cloneDeep(data.procurement_items)
    const procurementItemData: Array<PurchaseProcumentLineItem> = procurementItemClone.filter((item: PurchaseProcumentLineItem) => {
      return (item.accepted_quantity && item.real_quantity)
    })
    if(!poData) return
    const dataSubmit: ProcurementManual = {
      reference: "manual",
      is_cancelled: false,
      note: data.note,
      status: "draft",
      store: data.store,
      store_id: data.store_id,
      expect_receipt_date: poData.procurements[0].expect_receipt_date,
      procurement_items: procurementItemData,
    }
    const response = await callApiNative({isShowError: true, isShowLoading: true}, dispatch, createPurchaseProcumentManualService, data.id, dataSubmit)
    if(response) {
      showSuccess('Tạo phiếu nhập kho thành công')
      history.push(`${UrlConfig.PROCUREMENT}`)
    }
  }

  return (
    <ContentContainer
      title="Tạo phiếu nhập kho"
      breadcrumb={[
        {
          name: "Nhập kho",
          path: `${UrlConfig.PROCUREMENT}`,
        },
        {
          name: "Thêm mới phiếu nhập kho",
        },
      ]}
    >
      <Form form={formMain} onFinish={onFinish}>
        <ManualForm
          accountStores={accountStores}
          data={data}
          formMain={formMain}
          isSelectSupplier={isSelectSupplier}
          loadingSearch={loadingSearch}
          onChangeKeySearchSupplier={onChangeKeySearchSupplier}
          onChangeStore={onChangeStore}
          onSelect={onSelect}
          removeSupplier={removeSupplier}
          removePOCode={removePOCode}
          listPO={listPO}
          onSelectPO={onSelectPO}
          poLoading={poLoading}
          poDisable={poDisable}
        />
        <Form.Item hidden name={[POProcumentField.procurement_items]}>
          <Input />
        </Form.Item>
        <Form.Item
          shouldUpdate={(prev, current) => {
            return (
              prev[POProcumentField.procurement_items] !==
              current[POProcumentField.procurement_items]
            );
          }}
          noStyle
        >
          {({ getFieldValue }) => {
            let procurement_items = getFieldValue(POProcumentField.procurement_items)
              ? getFieldValue(POProcumentField.procurement_items)
              : [];
            if (poData && !isEmpty(procurement_items) && !isEmpty(poData.line_items)) {
              const { line_items } = poData
              return <LineItems line_items={line_items} formMain={formMain} procurement_items={procurement_items} onQuantityChange={onQuantityChange} />
            }
          }}
        </Form.Item>

      </Form>
      {isVisibleModalWarning && (
        <ModalConfirm
          onCancel={() => {
            setIsVisibleModalWarning(false);
          }}
          onOk={() => history.goBack()}
          okText="Đồng ý"
          cancelText="Tiếp tục"
          title={`Bạn có muốn rời khỏi trang?`}
          subTitle="Thông tin trên trang này sẽ không được lưu."
          visible={isVisibleModalWarning}
        />
      )}
      <BottomBarContainer
        leftComponent={
          <div
            onClick={() => {
              let supplier_id = formMain.getFieldsValue([POProcumentField.supplier_id])
              let store_id = formMain.getFieldsValue([POProcumentField.store_id])
              if (supplier_id !== undefined || store_id !== undefined ) {
                setIsVisibleModalWarning(true)
              }
            }}
            style={{ cursor: "pointer" }}
          >
            <img style={{ marginRight: "10px" }} src={arrowLeft} alt="" />
            {"Quay lại danh sách"}
          </div>
        }
        rightComponent={
          <Space>
            <Button
              className="ant-btn-outline fixed-button cancle-button"
              onClick={() => setIsVisibleModalWarning(true)}
            >
              Huỷ
            </Button>
            <Button
              type="primary"
              onClick={() => formMain.submit()}
            >
              Xác nhận nhập
            </Button>
          </Space>
        }
      />
    </ContentContainer>
  )
}

export default ProcurementCreateManualScreen
