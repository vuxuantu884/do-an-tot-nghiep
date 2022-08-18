import { Form, Button } from "antd";
import React, { Fragment, useState, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { POReturnAction } from "domain/actions/po/po.action";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import { CountryResponse } from "model/content/country.model";
import { DistrictResponse } from "model/content/district.model";
import POReturnProductForm from "./component/po-return-product.form";
import { POField } from "model/purchase-order/po-field";
import { POUtils } from "utils/POUtils";
import { PurchaseOrderLineReturnItem } from "model/purchase-order/purchase-item.model";
import { StoreResponse } from "model/core/store.model";
import { StoreGetListAction } from "domain/actions/core/store.action";
import {
  CountryGetAllAction,
  DistrictGetByCountryAction,
} from "domain/actions/content/content.action";
import { VietNamId } from "utils/Constants";
import { showError, showSuccess } from "utils/ToastUtils";
import { POProcumentField } from "model/purchase-order/purchase-procument";
import moment from "moment";

interface POReturnProps {
  poData: PurchaseOrder | null;
  cancelReturn: () => any;
  onUpdateCallReturn: () => any;
}
type PurchaseOrderReturnParams = {
  id: string;
};
const initFormValue = {
  [POProcumentField.expect_receipt_date]: moment(),
};
const POReturnScreen: React.FC<POReturnProps> = ({ poData, cancelReturn, onUpdateCallReturn }) => {
  const [listStore, setListStore] = useState<Array<StoreResponse>>([]);
  const [listCountries, setCountries] = useState<Array<CountryResponse>>([]);
  const [listDistrict, setDistrict] = useState<Array<DistrictResponse>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { id } = useParams<PurchaseOrderReturnParams>();
  const idNumber = parseInt(id);
  const [formMain] = Form.useForm();
  const dispatch = useDispatch();
  const onUpdateCall = useCallback(() => {
    setIsLoading(false);
    showSuccess("Trả hàng thành công!");
    onUpdateCallReturn();
  }, [onUpdateCallReturn]);
  const onFinish = useCallback(
    (values: any) => {
      if (!values.line_return_items) {
        showError("Cần ít nhất một phiếu nhập kho để hoàn trả");
        return;
      }
      values.line_return_items = values.line_return_items.filter(
        (item: any) => item.quantity_return > 0,
      );
      if (values.line_return_items.length === 0) {
        showError("Cần trả ít nhất 1 sản phẩm");
        return;
      }

      setIsLoading(true);

      dispatch(POReturnAction(idNumber, values, onUpdateCall));
    },
    [dispatch, idNumber, onUpdateCall],
  );
  const onCancelButton = () => {
    cancelReturn();
  };
  const onConfirmButton = useCallback(() => {
    formMain
      .validateFields()
      .then((values) => {
        values[POField.expect_return_date] = Date.now();
        onFinish(values);
      })
      .catch((error) => {
        if (error.errorFields) {
          const element: any = document.getElementById(error.errorFields[0].name.join(""));
          element?.focus();
          const y = element?.getBoundingClientRect()?.top + window.pageYOffset + -250;

          window.scrollTo({ top: y, behavior: "smooth" });
        }
      });
  }, [formMain, onFinish]);

  useEffect(() => {
    if (poData) {
      formMain.setFieldsValue(poData);
    }
  }, [formMain, poData]);

  useEffect(() => {
    dispatch(StoreGetListAction(setListStore));
    dispatch(
      CountryGetAllAction((data) => {
        setCountries(data);
      }),
    );
    dispatch(
      DistrictGetByCountryAction(VietNamId, (data) => {
        setDistrict(data);
      }),
    );
  }, [dispatch]);

  return (
    <Form
      form={formMain}
      initialValues={initFormValue}
      layout="vertical"
      // onFinish={onFinish}
    >
      {poData !== null && (
        <Fragment>
          <Form.Item shouldUpdate={() => true} noStyle>
            {({ getFieldValue }) => {
              let line_return_items = getFieldValue(POField.line_return_items);
              let totalReturn = 0,
                totalVat = 0;
              line_return_items &&
                line_return_items.forEach((item: PurchaseOrderLineReturnItem) => {
                  if (!item.quantity_return) return;
                  totalReturn +=
                    item.quantity_return *
                    POUtils.caculatePrice(item.price, item.discount_rate, item.discount_value);
                  totalVat = totalVat + item.amount_tax_refunds ? item.amount_tax_refunds : 0;
                });
              return (
                <Fragment>
                  <POReturnProductForm
                    type="RETURN"
                    formMain={formMain}
                    totalVat={totalVat}
                    totalReturn={totalReturn}
                    listStore={listStore}
                    poData={poData}
                    listCountries={listCountries}
                    listDistrict={listDistrict}
                  />
                  {/*<POReturnPaymentForm*/}
                  {/*  formMain={formMain}*/}
                  {/*  totalReturn={totalReturn}*/}
                  {/*  totalVat={totalVat}*/}
                  {/*/>*/}

                  <div className="text-right">
                    <Button type="default" className="light" onClick={onCancelButton}>
                      Hủy
                    </Button>
                    <Button
                      loading={isLoading}
                      type="primary"
                      onClick={onConfirmButton}
                      className="create-button-custom"
                    >
                      Hoàn trả
                    </Button>
                  </div>
                </Fragment>
              );
            }}
          </Form.Item>
        </Fragment>
      )}
    </Form>
  );
};

export default POReturnScreen;
