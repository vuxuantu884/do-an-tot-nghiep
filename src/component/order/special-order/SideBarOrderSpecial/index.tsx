import { EditOutlined } from "@ant-design/icons";
import { Button, Card, Form, FormInstance, Row } from "antd";
import { OrderPageTypeModel } from "model/order/order.model";
import {
  SpecialOrderFormValueModel,
  SpecialOrderModel,
  SpecialOrderResponseModel,
  SpecialOrderType,
} from "model/order/special-order.model";
import React, { useEffect, useState } from "react";
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
  } = props;
  console.log("specialOrder", specialOrder);
  // const defaultSpecialType = initDisplayOrderSpecialType || specialOrderTypes.orders_recall.value;

  const [displayOrderSpecialType, setDisplayOrderSpecialType] = useState<string | undefined>(
    defaultSpecialType,
  );

  const [variantSkus, setVariantSkus] = useState<string[]>([]);

  const initialFormValue: SpecialOrderFormValueModel = {
    type: specialOrder?.type || defaultSpecialType,
    order_original_code: specialOrder?.order_original_code || undefined,
    order_carer_code: specialOrder?.order_carer_code || undefined,
    skus: variantSkus.length > 0 ? variantSkus : undefined,
    amount: specialOrder?.amount || undefined,
    order_return_code: specialOrder?.order_return_code || undefined,
    reason: specialOrder?.reason || undefined,
  };

  const exceptOrderTypeSelectArr = [
    specialOrderTypes.orders_recall.value,
    specialOrderTypes.orders_partial.value,
  ];

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
                setDisplayOrderSpecialType(specialOrderTypes.orders_recall.value);
                form.setFieldsValue({
                  type: specialOrderTypes.orders_recall.value,
                });
              }}
            >
              <span>Thu hồi</span>
            </Button>
            <Button
              className={`orders_special_item_header ${
                displayOrderSpecialType === specialOrderTypes.orders_partial.value && "active"
              }`}
              onClick={() => {
                setDisplayOrderSpecialType(specialOrderTypes.orders_partial.value);
                form.setFieldsValue({
                  type: specialOrderTypes.orders_partial.value,
                });
              }}
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
                setDisplayOrderSpecialType(undefined);
                form.setFieldsValue({
                  type: undefined,
                });
              }}
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
          setDisplayOrderSpecialType={setDisplayOrderSpecialType}
          handleSubmitForm={handleCreateOrUpdateSpecialOrder}
          handleDelete={handleDeleteSpecialOrder}
          canDelete={specialOrder ? true : false}
          initialFormValue={initialFormValue}
          orderPageType={orderPageType}
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
          <EditOutlined
            className="iconEdit"
            onClick={() => {
              setSpecialOrderView(SpecialOrderType.update);
              form.resetFields();
            }}
            title="Sửa loại đơn hàng"
          />
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
