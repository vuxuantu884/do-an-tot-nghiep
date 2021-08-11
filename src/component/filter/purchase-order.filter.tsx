import { Button, Col, Form, Input, Row, Select, Tooltip } from "antd";
import { MenuAction } from "component/table/ActionButton";
import { useCallback, useLayoutEffect, useState } from "react";
import BaseFilter from "./base.filter";
import search from "assets/img/search.svg";
import { SupplierResponse } from "model/core/supplier.model";
import CustomFilter from "component/table/custom.filter";
import { StarOutlined } from "@ant-design/icons";
import { PurchaseOrderQuery } from "model/purchase-order/purchase-order.model";

type PurchaseOrderFilterProps = {
  params: PurchaseOrderQuery;
  listSupplier?: Array<SupplierResponse>;
  actions: Array<MenuAction>;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: PurchaseOrderQuery) => void;
  onClearFilter?: () => void;
};

const { Item } = Form;
const { Option } = Select;

const PurchaseOrderFilter: React.FC<PurchaseOrderFilterProps> = (
  props: PurchaseOrderFilterProps
) => {
  const {
    params,
    listSupplier,
    actions,
    onMenuClick,
    onClearFilter,
    onFilter,
  } = props;
  const [visible, setVisible] = useState(false);

  const [formBaseFilter] = Form.useForm();
  const [formAdvanceFilter] = Form.useForm();
  const onBaseFinish = useCallback(
    (values: PurchaseOrderQuery) => {
      
      let data = formBaseFilter.getFieldsValue(true);
      onFilter && onFilter(data);
    },
    [formBaseFilter, onFilter]
  );
  const onAdvanceFinish = useCallback(
    (values: PurchaseOrderQuery) => {
      
      let data = formAdvanceFilter.getFieldsValue(true);
      onFilter && onFilter(data);
    },
    [formAdvanceFilter, onFilter]
  );
  const onFilterClick = useCallback(() => {
    setVisible(false);
    formAdvanceFilter.submit();
  }, [formAdvanceFilter]);
  const openFilter = useCallback(() => {
    setVisible(true);
  }, []);
  const onCancelFilter = useCallback(() => {
    formAdvanceFilter.resetFields();
    setVisible(false);
  }, [formAdvanceFilter]);
  const onResetFilter = useCallback(() => {
    
    formAdvanceFilter.setFieldsValue({ supplier_id: undefined });
    setVisible(false);
    formAdvanceFilter.submit();
  }, [formAdvanceFilter]);
  const onActionClick = useCallback(
    (index: number) => {
      onMenuClick && onMenuClick(index);
    },
    [onMenuClick]
  );
  useLayoutEffect(() => {
    // if (visible) {
    //   formBaseFilter.resetFields();
    //   formAdvanceFilter.resetFields();
    // }
    // return () => {
    //   formBaseFilter.resetFields();
    //   formAdvanceFilter.resetFields();
    // };
  }, [formAdvanceFilter, formBaseFilter, visible]);

  return (
    <div>
      <Form.Provider
        onFormFinish={(name, { values, forms }) => {
          
          const { formBaseFilter, formAdvanceFilter } = forms;
          let baseValues = formBaseFilter.getFieldsValue();
          let advanceValues = formAdvanceFilter?.getFieldsValue();
          formBaseFilter.setFieldsValue({ ...baseValues, ...advanceValues });

          formAdvanceFilter?.setFieldsValue({
            ...baseValues,
            ...advanceValues,
          });
        }}
      >
        <CustomFilter onMenuClick={onActionClick} menu={actions}>
          <Form
            form={formBaseFilter}
            name="formBaseFilter"
            onFinish={onBaseFinish}
            initialValues={params}
            layout="inline"
          >
            <Item name="code">
              <Input
                prefix={<img src={search} alt="" />}
                style={{ width: 200 }}
                placeholder="Mã đơn hàng"
              />
            </Item>

            <Item>
              <Button type="primary" htmlType="submit">
                Lọc
              </Button>
            </Item>
            <Item>
              <Tooltip overlay="Lưu bộ lọc" placement="top">
                <Button icon={<StarOutlined />} />
              </Tooltip>
            </Item>
            <Item>
              <Button onClick={openFilter}>Thêm bộ lọc</Button>
            </Item>
          </Form>
        </CustomFilter>

        <BaseFilter
          onClearFilter={onResetFilter}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          visible={visible}
        >
          <Form
            form={formAdvanceFilter}
            name="formAdvanceFilter"
            onFinish={onAdvanceFinish}
            initialValues={params}
            layout="vertical"
          >
            <Row gutter={12}>
              <Col span={24}>
                <Item name="supplier_id" label="Nhà cung cấp">
                  <Select placeholder="Chọn nhà cung cấp" allowClear>
                    <Option value="">Nhà cung cấp</Option>
                    {listSupplier?.map((item) => (
                      <Option key={item.id} value={item.id.toString()}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Item>
              </Col>
            </Row>
          </Form>
        </BaseFilter>
      </Form.Provider>
    </div>
  );
};

export default PurchaseOrderFilter;
