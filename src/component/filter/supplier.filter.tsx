import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  FormInstance,
  Input,
  Row,
  Select,
  Tooltip,
} from "antd";
import { MenuAction } from "component/table/ActionButton";
import { SupplierQuery } from "model/core/supplier.model";
import { BaseBootstrapResponse } from "model/content/bootstrap.model";
import { createRef, useCallback, useEffect, useState } from "react";
import BaseFilter from "./base.filter";
import search from "assets/img/search.svg";
import CustomFilter from "component/table/custom.filter";
import { StarOutlined } from "@ant-design/icons";

type SupplierFilterProps = {
  params: SupplierQuery;
  onFilter?: (values: SupplierQuery) => void;
  onClearFilter?: () => void;
  supplierStatus?: Array<BaseBootstrapResponse>;
  goods?: Array<BaseBootstrapResponse>;
  scorecard?: Array<BaseBootstrapResponse>;
  onMenuClick?: (index: number) => void;
  actions: Array<MenuAction>;
};

const { Item } = Form;
const { Option } = Select;

const SupplierFilter: React.FC<SupplierFilterProps> = (
  props: SupplierFilterProps
) => {
  const {
    onClearFilter,
    onFilter,
    params,
    goods,
    supplierStatus,
    scorecard,
    actions,
    onMenuClick,
  } = props;
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
  useEffect(() => {
    if (visible) {
      formRef.current?.resetFields();
    }
  }, [formRef, visible]);

  return (
    <Card bordered={false}>
      <CustomFilter onMenuClick={onActionClick} menu={actions}>
        <Form onFinish={onFinish} initialValues={params} layout="inline">
          <Form.Item name="info">
            <Input
              prefix={<img src={search} alt="" />}
              style={{ width: 200 }}
              placeholder="Tên/Mã nhà cung cấp"
            />
          </Form.Item>
          <Form.Item name="goods">
            <Select
              style={{
                width: 200,
              }}
            >
              <Select.Option value="">Ngành hàng</Select.Option>
              {goods?.map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Lọc
            </Button>
          </Form.Item>
          <Form.Item>
            <Tooltip overlay="Lưu bộ lọc" placement="top">
              <Button icon={<StarOutlined />} />
            </Tooltip>
          </Form.Item>
          <Form.Item>
            <Button onClick={openFilter}>Thêm bộ lọc</Button>
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
          <Item name="goods" label="Ngành hàng">
            <Select className="selector">
              <Option value="">Ngành hàng</Option>
              {goods?.map((item) => (
                <Option key={item.value} value={item.value}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Item>
          <Item name="contact" label="Tên / SDT người liên hệ">
            <Input placeholder="Tên/SDT người liên hệ" />
          </Item>
          <Item name="pic" label="Tên / Mã người phục trách">
            <Input placeholder="Tên/Mã người phụ trách" />
          </Item>
          <Row gutter={50}>
            <Col span={12}>
              <Item name="status" label="Trạng thái">
                <Select className="selector">
                  <Option value="">Chọn trạng thái</Option>
                  {supplierStatus?.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Item>
            </Col>
            <Col span={12}>
              <Item name="scorecard" label="Phân cấp NCC">
                <Select className="selector">
                  <Option value="">Chọn phân cấp</Option>
                  {scorecard?.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Item>
            </Col>
          </Row>
          <Item label="Địa chỉ">
            <Input className="r-5 ip-search" placeholder="Địa chỉ" />
          </Item>
          <Row gutter={50}>
            <Col span={12}>
              <Item name="from_created_date" label="Ngày tạo từ">
                <DatePicker
                  className="r-5 w-100 ip-search"
                  placeholder="Ngày tạo từ"
                />
              </Item>
            </Col>
            <Col span={12}>
              <Item label="Đến">
                <DatePicker
                  className="r-5 w-100 ip-search"
                  placeholder="Ngày tạo đến"
                />
              </Item>
            </Col>
          </Row>
          <Item name="note" label="Ghi chú">
            <Input className="r-5 ip-search" placeholder="Ghi chú" />
          </Item>
        </Form>
      </BaseFilter>
    </Card>
  );
};

export default SupplierFilter;
