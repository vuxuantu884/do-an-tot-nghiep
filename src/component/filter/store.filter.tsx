import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  FormInstance,
  Input,
  Row,
} from "antd";
import { MenuAction } from "component/table/ActionButton";
import { SupplierQuery } from "model/core/supplier.model";
import { createRef, useCallback, useLayoutEffect, useState } from "react";
import BaseFilter from "./base.filter";
import search from "assets/img/search.svg";
import { StoreQuery } from "model/core/store.model";
import CustomFilter from "component/table/custom.filter";

type StoreFilterProps = {
  params: StoreQuery;
  onFilter?: (values: StoreQuery) => void;
  onClearFilter?: () => void;
  onMenuClick?: (index: number) => void;
  actions: Array<MenuAction>;
};

const { Item } = Form;

const StoreFilter: React.FC<StoreFilterProps> = (props: StoreFilterProps) => {
  const { onClearFilter, onFilter, params, actions, onMenuClick } = props;
  const [visible, setVisible] = useState(false);

  const formRef = createRef<FormInstance>();
  const onFinish = useCallback(
    (values: SupplierQuery) => {
      onFilter && onFilter(values);
    },
    [onFilter]
  );
  const onFilterClick = useCallback(() => {
    setVisible(false);
    formRef.current?.submit();
  }, [formRef]);
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
      formRef.current?.resetFields();
    }
  }, [formRef, visible]);

  return (
    <Card bordered={false}>
      <CustomFilter onMenuClick={onActionClick} menu={actions}>
        <Form
          className="form-search"
          onFinish={onFinish}
          initialValues={params}
          layout="inline"
        >
          <Form.Item name="info">
            <Input
              prefix={<img src={search} alt="" />}
              style={{ width: 250 }}
              placeholder="Tên/Mã nhà cung cấp"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
            >
              Lọc
            </Button>
          </Form.Item>
          <Form.Item>
            <Button onClick={openFilter}>
              Thêm bộ lọc
            </Button>
          </Form.Item>
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
          ref={formRef}
          initialValues={params}
          layout="vertical"
        >
          <Item name="contact" label="Tên / SDT người liên hệ">
            <Input placeholder="Tên/SDT người liên hệ" />
          </Item>
          <Item name="pic" label="Tên / Mã người phục trách">
            <Input placeholder="Tên/Mã người phụ trách" />
          </Item>
          <Item label="Địa chỉ">
            <Input placeholder="Địa chỉ" />
          </Item>
          <Row gutter={24}>
            <Col span={12}>
              <Item name="from_created_date" label="Ngày tạo từ">
                <DatePicker placeholder="Ngày tạo từ" />
              </Item>
            </Col>
            <Col span={12}>
              <Item name="to_created_date" label="Đến">
                <DatePicker placeholder="Ngày tạo đến" />
              </Item>
            </Col>
          </Row>
          <Item name="note" label="Ghi chú">
            <Input placeholder="Ghi chú" />
          </Item>
        </Form>
      </BaseFilter>
    </Card>
  );
};

export default StoreFilter;
