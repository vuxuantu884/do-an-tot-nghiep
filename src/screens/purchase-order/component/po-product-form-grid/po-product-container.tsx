import { Card, Form, FormInstance, Input, Radio, RadioChangeEvent, Select, Space } from "antd";
import React, { ReactNode, useContext } from "react";
import { PurchaseOrderCreateContext } from "screens/purchase-order/provider/purchase-order.provider";
import { AppConfig } from "../../../../config/app.config";
import { POField } from "../../../../model/purchase-order/po-field";

type PoProductContainerProps = {
  children: (value: boolean) => ReactNode;
  isEditMode: boolean;
  isDisableSwitch: boolean;
  form: FormInstance;
};

const PoProductContainer = ({ children, isEditMode, isDisableSwitch, form }: PoProductContainerProps) => {
  const { isGridMode, setIsGridMode, setPoLineItemGridChema, setPoLineItemGridValue } = useContext(PurchaseOrderCreateContext);

  const onChangeGridMode = (e: RadioChangeEvent) => {
    const isGrid = e.target.value;
    setIsGridMode(isGrid);
    if (isGrid) {
      setPoLineItemGridChema([]);
      setPoLineItemGridValue([]);
      // setQuickInputProductLineItem(new Map());
    } else {
      form.setFieldsValue({
        [POField.line_items]: [],
      });
    }

    form.setFieldsValue({
      [POField.total]: 0,
    });
  };
  return (
    <Card
      className="po-form margin-top-20"
      title={
        <>
          <div className="d-flex">
            <span className="title-card">SẢN PHẨM</span>
          </div>
        </>
      }
      extra={
        <Form.Item noStyle shouldUpdate={(prev, current) => prev.status !== current.status}>
          {({ getFieldValue }) => {
            return (
              <Space size={20}>
                {
                  isEditMode && !isDisableSwitch && (
                    <Radio.Group onChange={onChangeGridMode} value={isGridMode}>
                      <Radio value={true}>Chọn 1 mã 7</Radio>
                      <Radio value={false}>Chọn nhiều sản phẩm</Radio>
                    </Radio.Group>
                  )
                }
                <span>Chính sách giá:</span>
                {/*TH tạo mới, clone đơn hàng, đơn nháp*/}
                {isEditMode ? (
                  <Form.Item name={POField.policy_price_code} style={{ margin: "0px" }}>
                    <Select style={{ minWidth: 145, height: 38 }} placeholder="Chính sách giá">
                      <Select.Option value={AppConfig.import_price} color="#222222">
                        Giá nhập
                      </Select.Option>
                    </Select>
                  </Form.Item>
                ) : (
                  <div>
                    <span style={{ fontWeight: 700 }}>Giá nhập</span>
                    <Form.Item name={POField.policy_price_code} noStyle hidden>
                      <Input />
                    </Form.Item>
                  </div>
                )}
              </Space>
            );
          }}
        </Form.Item>
      }>
      {children(isGridMode)}
    </Card>
  );
};

export default PoProductContainer;
