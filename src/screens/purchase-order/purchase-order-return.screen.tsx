import { Form, Button } from "antd";
import React, { Fragment, useState, useCallback, useEffect, useMemo } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { PoDetailAction, POReturnAction } from "domain/actions/po/po.action";
import UrlConfig from "config/url.config";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import ContentContainer from "component/container/content.container";
import { CountryResponse } from "model/content/country.model";
import { DistrictResponse } from "model/content/district.model";
import POSupplierForm from "./component/po-supplier.form";
import POReturnProductForm from "./component/po-return-product.form";
import POReturnPaymentForm from "./component/po-return-payment.form";
import POStep from "./component/po-step";
import { POField } from "model/purchase-order/po-field";
import { POUtils } from "utils/POUtils";
import {
  PurchaseOrderLineReturnItem,
} from "model/purchase-order/purchase-item.model";
import { StoreResponse } from "model/core/store.model";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { CountryGetAllAction, DistrictGetByCountryAction } from "domain/actions/content/content.action";
import { VietNamId } from "utils/Constants";
import { showError } from "utils/ToastUtils";
import BottomBarContainer from "component/container/bottom-bar.container";

interface POReturnProps { }
type PurchaseOrderReturnParams = {
  id: string;
};

const POReturnScreen: React.FC<POReturnProps> = (props: POReturnProps) => {
  const [isError, setError] = useState(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [poData, setPurchaseItem] = useState<PurchaseOrder | null>(null);
  const [listStore, setListStore] = useState<Array<StoreResponse>>([]);
  const [listCountries, setCountries] = useState<Array<CountryResponse>>([]);
  const [listDistrict, setDistrict] = useState<Array<DistrictResponse>>([]);
  const { id } = useParams<PurchaseOrderReturnParams>();
  const idNumber = parseInt(id);
  const [formMain] = Form.useForm();
  const history = useHistory();
  const dispatch = useDispatch();
  const onUpdateCall = useCallback(() => {
    setLoading(false);
    history.replace(`${UrlConfig.PURCHASE_ORDERS}/${id}`);
  }, [history, id]);
  const onFinish = useCallback(
    (values: any) => {
      if (!values.line_return_items) {
        showError("Cần ít nhất một phiếu nhập kho để hoàn trả");
        return;
      }
      values.line_return_items = values.line_return_items.filter(
        (item: any) => item.quantity_return > 0
      );
      if(values.line_return_items.length === 0) {
        showError("Cần trả ít nhất 1 sản phẩm");
        return;
      }
      setLoading(true);
      dispatch(POReturnAction(idNumber, values, onUpdateCall));
    },
    [dispatch, idNumber, onUpdateCall]
  );
  const onCancelButton = () => {
    history.replace(`${UrlConfig.PURCHASE_ORDERS}/${id}`);
  };
  const onConfirmButton = useCallback(() => {
    formMain.validateFields().then((values) => {

      values[POField.expect_return_date] = Date.now();
      onFinish(values);
    })
      .catch(((error) => {
        if (error.errorFields) {
          const element: any = document.getElementById(
            error.errorFields[0].name.join("")
          );
          element?.focus();
          const y =
            element?.getBoundingClientRect()?.top + window.pageYOffset + -250;

          window.scrollTo({ top: y, behavior: "smooth" });
        }

      }));
  }, [formMain, onFinish]);
  const listStoreFilter = useMemo(() => {
    return listStore.filter((item) => {
      if(poData == null) {
        return false;
      }
      let index = poData.procurements.findIndex((item1) => item1.store_id === item.id);
      return index !== -1;
    })
  }, [listStore, poData]);
  const onDetail = useCallback(
    (result: PurchaseOrder | null) => {
      setLoading(false);
      if (!result) {
        setError(true);
      } else {
        formMain.setFieldsValue(result);
        setPurchaseItem(result);
      }
    },
    [formMain]
  );
  useEffect(() => {
    dispatch(StoreGetListAction(setListStore));
    dispatch(CountryGetAllAction((data) => {
      setCountries(data);
    }))
    dispatch(DistrictGetByCountryAction(VietNamId, (data) => {
      setDistrict(data);
    }));
  }, [dispatch]);
  const loadDetail = useCallback(
    (id: number,) => {
      dispatch(PoDetailAction(id, onDetail));
    },
    [dispatch, onDetail]
  );
  useEffect(() => {
    if (!isNaN(idNumber)) {
      setLoading(true);
      loadDetail(idNumber);
    } else {
      setError(true);
    }
  }, [idNumber, loadDetail])
  return (
    <ContentContainer
      isLoading={isLoading}
      isError={isError}
      title={`Trả hàng cho đơn mua hàng ${id}`}
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Đặt hàng",
          path: `${UrlConfig.PURCHASE_ORDERS}`,
        },
        {
          name: `Đơn hàng`,
          path: `${UrlConfig.PURCHASE_ORDERS}/${id}`,
        },
      ]}
    >
      <Form
        form={formMain}
        initialValues={{}}
        layout="vertical"
      // onFinish={onFinish}
      >
        {
          poData !== null && (
            <Fragment>
              <POSupplierForm
                showSupplierAddress={true}
                showBillingAddress={false}
                isEdit={true}
                hideExpand={true}
                listCountries={listCountries}
                listDistrict={listDistrict}
                formMain={formMain}
              />
              <Form.Item shouldUpdate={(prevValues, curValues) => true} noStyle>
                {({ getFieldValue }) => {
                  let line_return_items = getFieldValue(POField.line_return_items);
                  let totalReturn = 0,
                    totalVat = 0;
                  line_return_items &&
                    line_return_items.forEach((item: PurchaseOrderLineReturnItem) => {
                      if (!item.quantity_return) return;
                      totalReturn +=
                        item.quantity_return *
                        POUtils.caculatePrice(
                          item.price,
                          item.discount_rate,
                          item.discount_value
                        );
                      totalVat = totalVat + item.amount_tax_refunds ? item.amount_tax_refunds : 0;
                    });
                  return (
                    <Fragment>
                      <POReturnProductForm
                        formMain={formMain}
                        totalVat={totalVat}
                        totalReturn={totalReturn}
                        listStore={listStoreFilter}
                        poData={poData}
                      />
                      <POReturnPaymentForm
                        formMain={formMain}
                        totalReturn={totalReturn}
                        totalVat={totalVat}
                      />
                    </Fragment>
                  );
                }}
              </Form.Item>
              <BottomBarContainer
                height={80}
                back={false}
                leftComponent={<POStep poData={poData} />}
                rightComponent={
                  <React.Fragment>
                    <Button type="default" className="light" onClick={onCancelButton}>
                      Hủy
                    </Button>
                    <Button
                      type="primary"
                      onClick={onConfirmButton}
                      className="create-button-custom"
                    >
                      Hoàn trả
                    </Button>
                  </React.Fragment>
                }
              />
            </Fragment>
          )
        }

      </Form>
    </ContentContainer>
  );
};

export default POReturnScreen;
