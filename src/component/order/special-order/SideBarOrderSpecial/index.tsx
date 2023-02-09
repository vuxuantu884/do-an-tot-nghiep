import { EditOutlined } from "@ant-design/icons";
import { Button, Card, FormInstance, Row } from "antd";
import { OrderPageTypeModel } from "model/order/order.model";
import {
  SpecialOrderFormValueModel,
  SpecialOrderModel,
  SpecialOrderResponseModel,
  SpecialOrderType,
} from "model/order/special-order.model";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  checkIfECommerceByOrderChannelCodeUpdateOrder,
  checkIfOrderPageType,
} from "utils/OrderUtils";
import SpecialOrderCreateForm from "../SpecialOrderCreateForm";
import SpecialOrderDetail from "../SpecialOrderDetail";
import { specialOrderTypes } from "./helper";
import { StyledComponent } from "./styles";

type Props = {
  defaultSpecialType: string | undefined;
  form: FormInstance<any>;
  specialOrder?: SpecialOrderResponseModel;
  handleDeleteSpecialOrder: () => void;
  handleCreateOrUpdateSpecialOrder: (param: SpecialOrderModel) => Promise<void>;
  specialOrderView: SpecialOrderType;
  setSpecialOrderView: React.Dispatch<React.SetStateAction<SpecialOrderType>>;
  orderPageType: OrderPageTypeModel;
  setIsSpecialOrderEcommerce?: (v: boolean) => void;
};

const SideBarOrderSpecial: React.FC<Props> = (props: Props) => {
  const {
    specialOrder,
    form,
    handleDeleteSpecialOrder,
    handleCreateOrUpdateSpecialOrder,
    specialOrderView,
    setSpecialOrderView,
    defaultSpecialType,
    orderPageType,
    setIsSpecialOrderEcommerce,
  } = props;

  const isOrderCreatePage = checkIfOrderPageType.isOrderCreatePage(orderPageType);

  const isEditSpecialOrder = useMemo(() => {
    if (
      !isOrderCreatePage &&
      specialOrder?.type === specialOrderTypes.orders_replace.value &&
      checkIfECommerceByOrderChannelCodeUpdateOrder(specialOrder.ecommerce)
    ) {
      return false;
    }
    return true;
  }, [specialOrder?.ecommerce, specialOrder?.type, isOrderCreatePage]);

  const [displayOrderSpecialType, setDisplayOrderSpecialType] = useState<string | undefined>(
    defaultSpecialType,
  );
  const [orderSpecialEcommerce, setOrderSpecialEcommerce] = useState<string | undefined>();

  const [variantSkus, setVariantSkus] = useState<string[]>([]);

  const initialFormValue: SpecialOrderFormValueModel = {
    type: specialOrder?.type || defaultSpecialType,
    order_original_code: specialOrder?.order_original_code || undefined,
    order_carer_code: specialOrder?.order_carer_code || undefined,
    skus: variantSkus.length > 0 ? variantSkus : undefined,
    amount: specialOrder?.amount ?? undefined,
    order_return_code: specialOrder?.order_return_code || undefined,
    reason: specialOrder?.reason || undefined,
    ecommerce: specialOrder?.ecommerce || undefined,
  };

  const exceptOrderTypeSelectArr = [
    specialOrderTypes.orders_recall.value,
    specialOrderTypes.orders_partial.value,
  ];

  const handleChangeOrderSpecialEcommerce = useCallback(
    (value: SpecialOrderFormValueModel) => {
      const ecommerce =
        value.type === specialOrderTypes.orders_replace.value &&
        checkIfECommerceByOrderChannelCodeUpdateOrder(value.ecommerce);
      console.log("handleChangeOrderSpecialEcommerce", ecommerce, value.type, value.ecommerce);
      setIsSpecialOrderEcommerce && setIsSpecialOrderEcommerce(ecommerce);
    },
    [setIsSpecialOrderEcommerce],
  );
  const handleChangeType = (v: string | undefined) => {
    setDisplayOrderSpecialType(v);
    const initialFormValue: SpecialOrderFormValueModel = {
      type: v || defaultSpecialType,
      order_original_code: undefined,
      order_carer_code: undefined,
      skus: undefined,
      amount: undefined,
      order_return_code: undefined,
      reason: undefined,
      ecommerce: undefined,
    };
    setOrderSpecialEcommerce(undefined);
    form.setFieldsValue(initialFormValue);
  };

  const renderCreateOrderSpecial = () => (
    <React.Fragment>
      <div>
        <h4 className="title">Loại đơn hàng:</h4>
      </div>
      <Row className="orders_special_create">
        <div className="orders_special_header">
          <div className="orders_special_header_wrapper">
            <Button
              className={`orders_special_item_header ${
                displayOrderSpecialType === specialOrderTypes.orders_recall.value && "active"
              }`}
              onClick={() => {
                handleChangeType(specialOrderTypes.orders_recall.value);
                handleChangeOrderSpecialEcommerce({
                  type: specialOrderTypes.orders_recall.value,
                  ecommerce: orderSpecialEcommerce,
                } as any);
                form.setFieldsValue({
                  type: specialOrderTypes.orders_recall.value,
                });
              }}
              disabled={!isEditSpecialOrder}
            >
              <span>Thu hồi</span>
            </Button>
            <Button
              className={`orders_special_item_header ${
                displayOrderSpecialType === specialOrderTypes.orders_partial.value && "active"
              }`}
              onClick={() => {
                handleChangeType(specialOrderTypes.orders_partial.value);
                handleChangeOrderSpecialEcommerce({
                  type: specialOrderTypes.orders_partial.value,
                  ecommerce: orderSpecialEcommerce,
                } as any);
                form.setFieldsValue({
                  type: specialOrderTypes.orders_partial.value,
                });
              }}
              disabled={!isEditSpecialOrder}
            >
              <span>Giao hàng 1 phần</span>
            </Button>
            <Button
              className={`orders_special_item_header ${
                !(
                  displayOrderSpecialType &&
                  exceptOrderTypeSelectArr.includes(displayOrderSpecialType)
                ) && "active"
              }`}
              onClick={() => {
                handleChangeType(undefined);
                handleChangeOrderSpecialEcommerce({
                  type: undefined,
                  ecommerce: orderSpecialEcommerce,
                } as any);
                form.setFieldsValue({
                  type: undefined,
                });
              }}
              disabled={!isEditSpecialOrder}
            >
              <span>Khác</span>
            </Button>
          </div>
        </div>
      </Row>
      <div className="orders_special_content">
        <SpecialOrderCreateForm
          exceptOrderTypeSelectArr={exceptOrderTypeSelectArr}
          handleCancel={() => {
            setSpecialOrderView(SpecialOrderType.detail);
          }}
          form={form}
          displayOrderSpecialType={displayOrderSpecialType}
          setDisplayOrderSpecialType={(v) => {
            handleChangeType(v as string);
            handleChangeOrderSpecialEcommerce({
              type: v,
              ecommerce: orderSpecialEcommerce,
            } as any);
          }}
          handleSubmitForm={handleCreateOrUpdateSpecialOrder}
          handleDelete={handleDeleteSpecialOrder}
          canDelete={specialOrder ? true : false}
          initialFormValue={initialFormValue}
          orderPageType={orderPageType}
          setOrderSpecialEcommerce={(value) => {
            handleChangeOrderSpecialEcommerce({
              type: displayOrderSpecialType,
              ecommerce: value,
            } as any);
            setOrderSpecialEcommerce(value);
          }}
        />
      </div>
    </React.Fragment>
  );

  const renderSpecialOrderDetail = () => <SpecialOrderDetail specialOrder={specialOrder} />;

  useEffect(() => {
    let variantSkus = specialOrder?.variant_skus?.split(",");
    if (variantSkus && variantSkus?.length > 0) {
      setVariantSkus(variantSkus);
    } else {
      setVariantSkus([]);
    }
  }, [specialOrder?.variant_skus]);

  useEffect(() => {
    if (specialOrder?.type) {
      setDisplayOrderSpecialType(specialOrder?.type);
    } else {
      setDisplayOrderSpecialType(defaultSpecialType);
    }
  }, [defaultSpecialType, specialOrder?.type]);

  return (
    <StyledComponent>
      <Card
        title="Loại đơn hàng"
        extra={
          isEditSpecialOrder ? (
            <EditOutlined
              className="iconEdit"
              onClick={() => {
                setSpecialOrderView(SpecialOrderType.update);
                form.resetFields();
              }}
              title="Sửa loại đơn hàng"
            />
          ) : undefined
        }
      >
        {specialOrderView === SpecialOrderType.detail
          ? renderSpecialOrderDetail()
          : renderCreateOrderSpecial()}
      </Card>
    </StyledComponent>
  );
};

export default SideBarOrderSpecial;
