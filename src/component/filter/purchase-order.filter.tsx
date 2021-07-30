import { Button, Card, Col, Form, Input, Row, Select, Tooltip } from "antd";
import { MenuAction } from "component/table/ActionButton";
import { useCallback, useLayoutEffect, useState } from "react";
import BaseFilter from "./base.filter";
import search from "assets/img/search.svg";
import { SupplierResponse } from "model/core/supplier.model";
import CustomFilter from "component/table/custom.filter";
import { StarOutlined } from "@ant-design/icons";
import { PurchaseOrderQuery } from "model/purchase-order/purchase-order.model";

type PurchaseOrderFilterProps = {
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
  const { listSupplier, actions, onMenuClick, onClearFilter, onFilter } = props;
  const [visible, setVisible] = useState(false);

  const [formPoFilter] = Form.useForm();
  const onFinish = useCallback(
    (values: PurchaseOrderQuery) => {
      onFilter && onFilter(values);
    },
    [onFilter]
  );
  const onFilterClick = useCallback(() => {
    setVisible(false);
    formPoFilter.submit();
  }, [formPoFilter]);
  const openFilter = useCallback(() => {
    setVisible(true);
  }, []);
  const onCancelFilter = useCallback(() => {
    setVisible(false);
  }, []);
  const onActionClick = useCallback(
    (index: number) => {
      onMenuClick && onMenuClick(index);
    },
    [onMenuClick]
  );
  useLayoutEffect(() => {
    if (visible) {
      formPoFilter.resetFields();
    }
  }, [formPoFilter, visible]);

  return (
    <Card bordered={false}>
      <Form.Provider>
        <CustomFilter onMenuClick={onActionClick} menu={actions}>
          <Form
            onFinish={onFinish}
            initialValues={{ info: "" }}
            layout="inline"
          >
            <Item name="info">
              <Input
                prefix={<img src={search} alt="" />}
                style={{ width: 200 }}
                placeholder="Tên/Mã sản phẩm"
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
          onClearFilter={onClearFilter}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          visible={visible}
        >
          <Form
            onFinish={onFinish}
            initialValues={{ supplier: undefined }}
            layout="vertical"
          >
            <Row gutter={12}>
              <Col span={24}>
                <Item name="supplier" label="Nhà cung cấp">
                  <Select>
                    <Option value="">Nhà cung cấp</Option>
                    {listSupplier?.map((item) => (
                      <Option key={item.id} value={item.id}>
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
    </Card>
  );
};

export default PurchaseOrderFilter;
