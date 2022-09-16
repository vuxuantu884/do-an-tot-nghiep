import { Button, Form, Input, Space } from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
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
import {
  POProcumentField,
  ProcurementManualCreate,
  PurchaseProcument,
  PurchaseProcumentLineItem,
} from "model/purchase-order/purchase-procument";
import ManualForm from "./components/ManualForm";
import LineItems from "./components/LineItems";
import ImportProcurementExcel from "./components/ImportProcurementExcel";
import { listPurchaseOrderBySupplier } from "service/purchase-order/purchase-order.service";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import { POField } from "model/purchase-order/po-field";
import { showError, showSuccess } from "utils/ToastUtils";
import { createPurchaseProcumentManualService } from "service/purchase-order/purchase-procument.service";
import { ImportOutlined } from "@ant-design/icons";
import { ProcurementStatus } from "utils/Constants";
import moment from "moment";
import "./style.scss";

const ProcurementCreateManualScreen: React.FC = () => {
  const [isVisibleModalWarning, setIsVisibleModalWarning] = useState<boolean>(false);
  const [isSelectSupplier, setIsSelectSupplier] = useState<boolean>(false);
  const [loadingSearch, setLoadingSearch] = useState<boolean>(false);
  const [data, setData] = useState<Array<SupplierResponse>>([]);
  const [accountStores, setAccountStores] = useState<Array<AccountStoreResponse>>([]);
  const [listStore, setListStore] = useState<Array<Store>>([]);
  const [listPO, setListPO] = useState<Array<PurchaseOrder>>([]);
  const [poData, setPOData] = useState<PurchaseOrder>();
  const [poLoading, setPOLoading] = useState<boolean>(false);
  const [poDisable, setPODisable] = useState<boolean>(true);
  const [isImport, setIsImport] = useState<boolean>(false);
  const [storeID, setStoreID] = useState<number>();
  const [activePR, setActivePR] = useState<string>("");
  const [showConfirmCancel, setShowConfirmCancel] = useState<boolean>(false);
  const [showBtn, setShowBtn] = useState<boolean>(false);
  const history = useHistory();
  const dispatch = useDispatch();
  const [formMain] = Form.useForm();

  const getStores = useCallback(async () => {
    const res = await callApiNative({ isShowLoading: false }, dispatch, getStoreApi, {
      status: "active",
      simple: true,
    });
    if (res) {
      setListStore(res);
    }
  }, [dispatch]);

  useEffect(() => {
    dispatch(StoreGetListAction(setListStore));
  }, [dispatch]);

  const getMe = useCallback(async () => {
    const res = await callApiNative({ isShowLoading: false }, dispatch, getAccountDetail);
    if (res && res.account_stores) {
      setAccountStores(res.account_stores);
    }
  }, [dispatch]);

  useEffect(() => {
    if (isSelectSupplier) setPODisable(false);
    else setPODisable(true);
  }, [isSelectSupplier]);

  useEffect(() => {
    getMe();
    getStores();
  }, [dispatch, getStores, getMe]);

  useEffect(() => {
    if (listStore.length === 0) return;

    if (accountStores?.length === 1) {
      listStore.forEach((element) => {
        if (element.id === accountStores[0].store_id) {
          formMain.setFieldsValue({ [POProcumentField.store_id]: element.id });
        }
      });
    }

    if (accountStores?.length === 0) {
      const newStore = listStore.map((i) => {
        return {
          store_id: i.id,
          store: i.name,
        };
      });
      setAccountStores(newStore);
    }
  }, [listStore, accountStores, formMain]);

  useEffect(() => {
    if (storeID !== undefined && poData) {
      const procurementsClone: Array<PurchaseProcument> | undefined = cloneDeep(
        poData?.procurements,
      );
      const procurements: Array<PurchaseProcument> = procurementsClone?.filter(
        (item: PurchaseProcument) =>
          item.store_id === storeID && item.status === ProcurementStatus.not_received,
      );
      if (!isEmpty(procurements)) {
        formMain.setFieldsValue({ [POField.procurements]: procurements });
        setShowBtn(true);
      } else {
        showError("Không tìm thấy phiếu nhập kho nào");
        formMain.setFieldsValue({ [POField.procurements]: procurements });
        setShowBtn(false);
      }
    }
  }, [formMain, poData, storeID]);

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
    [dispatch, onResult],
  );

  const onChangeKeySearchSupplier = (keyword: string) => {
    debouncedSearchSupplier(keyword);
  };

  const removeSupplier = () => {
    formMain.setFieldsValue({
      [POProcumentField.supplier_id]: undefined,
      [POProcumentField.supplier]: null,
    });
    removePOCode();
    setListPO([]);
    setIsSelectSupplier(false);
  };

  const removePOCode = () => {
    formMain.setFieldsValue({
      [POField.code]: null,
      [POField.id]: undefined,
      [POField.reference]: undefined,
    });
    setPOData(undefined);
  };

  const onSelect = (value: string) => {
    let index = data.findIndex((item) => item.id === +value);
    let supplier = data[index];

    formMain.setFieldsValue({
      [POProcumentField.supplier_id]: value,
      [POProcumentField.supplier]: data[index].name,
      [POProcumentField.supplier_phone]: supplier.phone,
    });
    setIsSelectSupplier(true);
  };

  const onSearchPO = debounce(async (value: string) => {
    const id = formMain.getFieldValue([POProcumentField.supplier_id]);
    if (id) {
      setPOLoading(true);
      const res = await callApiNative(
        { isShowLoading: false },
        dispatch,
        listPurchaseOrderBySupplier,
        id,
        { condition: value.trim() },
      );
      if (res && res.length > 0) {
        setListPO(res);
        setPOLoading(false);
      } else {
        setPOLoading(false);
      }
    } else {
      showError("Bạn chưa chọn nhà cung cấp");
    }
  }, 300);

  const onSelectPO = useCallback(
    (value: any) => {
      let index = listPO.findIndex((item) => item.id === +value);
      let poData = listPO[index];
      setPOData(poData);
      formMain.setFieldsValue({
        [POField.code]: poData.code,
        [POField.reference]: poData.reference,
        [POField.id]: poData.id,
      });
    },
    [formMain, listPO],
  );

  const onQuantityChange = useCallback(
    (quantity: number, sku: string, prCode: string) => {
      let procurements: Array<PurchaseProcument> = formMain.getFieldValue(POField.procurements);
      const prIndex = procurements.findIndex((item: PurchaseProcument) => item.code === prCode);
      if (quantity !== undefined && sku && prIndex !== -1) {
        const prItemIdx = procurements[prIndex].procurement_items.findIndex(
          (el: PurchaseProcumentLineItem) =>
            el.sku.toUpperCase().trim() === sku.toUpperCase().trim(),
        );
        if (prItemIdx !== -1) {
          procurements[prIndex].procurement_items[prItemIdx].real_quantity = quantity;
        }
      }
      formMain.setFieldsValue({ [POField.procurements]: [...procurements] });
    },
    [formMain],
  );

  const onChangeStore = useCallback(
    (value: number) => {
      setStoreID(value);
      const store = accountStores.find((e) => e.store_id === value);
      formMain.setFieldsValue({
        [POProcumentField.store_id]: value,
        [POProcumentField.store]: store?.store,
      });
    },
    [accountStores, formMain],
  );

  const importRealQuantity = (data: Array<PurchaseProcumentLineItem>, code?: string) => {
    const procurements: Array<PurchaseProcument> =
      formMain.getFieldValue(POField.procurements) ?? [];
    if (!isEmpty(procurements) && code) {
      const index = procurements.findIndex((item: PurchaseProcument) => item.code === code);
      procurements[index].procurement_items = [...data];
      formMain.setFieldsValue({ [POField.procurements]: procurements });
    } else {
      showError("Nhập file thất bại");
    }
    setIsImport(false);
  };

  const onClearRealQuantity = () => {
    const procurements: Array<PurchaseProcument> =
      formMain.getFieldValue(POField.procurements) ?? [];
    procurements.forEach((item: PurchaseProcument) => {
      item.procurement_items.forEach((el: PurchaseProcumentLineItem) => (el.real_quantity = 0));
    });
    formMain.setFieldsValue({ [POField.procurements]: [...procurements] });
    setShowConfirmCancel(false);
  };

  const onFinish = async (data: any) => {
    const procurements: Array<PurchaseProcument> = [...data.procurements];
    if (isEmpty(procurements)) {
      showError("Không tìm thấy phiếu nhập kho nào");
      return;
    }
    const checkQuantity = procurements.every((item) =>
      item.procurement_items.every((el: PurchaseProcumentLineItem) => el.real_quantity === 0),
    );
    if (checkQuantity) {
      showError("Vui lòng nhập số lượng sản phẩm");
      return;
    }
    const procurementFilter: Array<PurchaseProcument> = procurements.filter(
      (item: PurchaseProcument) =>
        item.procurement_items.some((el: PurchaseProcumentLineItem) => el.real_quantity !== 0),
    );
    if (data.note) {
      procurementFilter.forEach((item: PurchaseProcument) => (item.note = data.note));
    }
    procurementFilter.forEach((item: PurchaseProcument) => (item.reference = "manual"));
    const dataSubmit: ProcurementManualCreate = { procurements: procurementFilter };
    const response = await callApiNative(
      { isShowError: true, isShowLoading: true },
      dispatch,
      createPurchaseProcumentManualService,
      data.id,
      dataSubmit,
    );
    if (response) {
      showSuccess("Tạo phiếu nhập kho thành công");
      history.push(`${UrlConfig.PROCUREMENT}`);
    }
  };

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
          onSearchPO={onSearchPO}
          onSelectPO={onSelectPO}
          poLoading={poLoading}
          poDisable={poDisable}
        />
        <Form.Item hidden name={[POField.procurements]}>
          <Input />
        </Form.Item>
        <Form.Item
          shouldUpdate={(prev, current) => {
            return prev[POField.procurements] !== current[POField.procurements];
          }}
          noStyle
        >
          {({ getFieldValue }) => {
            const procurements: Array<PurchaseProcument> =
              getFieldValue(POField.procurements) ?? [];
            const storeID = getFieldValue(POProcumentField.store_id);
            if (poData && storeID !== undefined && !isEmpty(procurements)) {
              const procurementArray = procurements.sort((a, b) => {
                let dateA = moment.utc(a.expect_receipt_date).toDate().getTime();
                let dateB = moment.utc(b.expect_receipt_date).toDate().getTime();
                return dateA - dateB;
              });
              return (
                <LineItems
                  poData={poData}
                  formMain={formMain}
                  onQuantityChange={onQuantityChange}
                  procurements={procurementArray}
                  setActivePR={setActivePR}
                  activePR={activePR}
                />
              );
            }
          }}
        </Form.Item>
        <Form.Item
          shouldUpdate={(prev, current) => {
            return prev[POField.procurements] !== current[POField.procurements];
          }}
          noStyle
        >
          {({ getFieldValue }) => {
            const procurements: Array<PurchaseProcument> =
              getFieldValue(POField.procurements) ?? [];
            const activeProcurement = procurements.find(
              (item: PurchaseProcument) => item.code === activePR,
            );
            if (poData && storeID !== undefined && activeProcurement) {
              return (
                <ImportProcurementExcel
                  onCancel={(preData: Array<PurchaseProcumentLineItem>, code?: string) => {
                    importRealQuantity(preData, code);
                  }}
                  onOk={(data: Array<PurchaseProcumentLineItem>, code?: string) => {
                    importRealQuantity(data, code);
                  }}
                  title="Import số lượng thực nhận"
                  visible={isImport}
                  dataTable={activeProcurement.procurement_items}
                  prCode={activeProcurement.code}
                />
              );
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
      {showConfirmCancel && (
        <ModalConfirm
          onCancel={() => {
            setShowConfirmCancel(false);
          }}
          onOk={onClearRealQuantity}
          okText="Đồng ý"
          cancelText="Hủy"
          title={`Bạn có muốn hủy thao tác nhập kho?`}
          subTitle="Thông tin bạn nhập sẽ không được lưu."
          visible={showConfirmCancel}
        />
      )}
      <BottomBarContainer
        leftComponent={
          <div
            onClick={() => {
              let supplier_id = formMain.getFieldsValue([POProcumentField.supplier_id]);
              let store_id = formMain.getFieldsValue([POProcumentField.store_id]);
              if (supplier_id !== undefined || store_id !== undefined) {
                setIsVisibleModalWarning(true);
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
            {showBtn && (
              <>
                <Button
                  type="ghost"
                  danger
                  onClick={() => {
                    setShowConfirmCancel(true);
                  }}
                >
                  Huỷ
                </Button>
                <Button
                  icon={<ImportOutlined />}
                  onClick={() => {
                    setIsImport(true);
                  }}
                >
                  Import Excel
                </Button>
              </>
            )}
            <Button type="primary" onClick={() => formMain.submit()}>
              Xác nhận nhập
            </Button>
          </Space>
        }
      />
    </ContentContainer>
  );
};

export default ProcurementCreateManualScreen;
