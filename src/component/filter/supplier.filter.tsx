import { Button, Card, Col, DatePicker, Form, FormInstance, Input, Row, Select } from "antd";
import ActionButton, { MenuAction } from "component/table/ActionButton";
import { SupplierQuery } from "model/query/supplier.query";
import { BaseBootstrapResponse } from "model/response/bootstrap/BaseBootstrapResponse";
import { createRef, useCallback, useLayoutEffect, useState } from "react";
import BaseFilter from "./base.filter"
import search from 'assets/img/search.svg';

type SupplierFilterProps = {
  params: SupplierQuery
  onFilter?: (values: SupplierQuery) => void,
  onClearFilter?: () => void
  supplierStatus?: Array<BaseBootstrapResponse>,
  goods?: Array<BaseBootstrapResponse>,
  scorecard?: Array<BaseBootstrapResponse>,
  onMenuClick?: (index: number) => void,
  actions:  Array<MenuAction>
}

const { Item } = Form;
const { Option } = Select;

const SupplierFilter: React.FC<SupplierFilterProps> = (props: SupplierFilterProps) => {
  const { onClearFilter, onFilter, params, goods, supplierStatus, scorecard, actions, onMenuClick } = props;
  const [visible, setVisible] = useState(false);

  const formRef = createRef<FormInstance>();
  const onFinish = useCallback((values: SupplierQuery) => {
    onFilter && onFilter(values);
  }, [onFilter]);
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
  const onActionClick = useCallback((index: number) => {
    onMenuClick && onMenuClick(index);
  }, [onMenuClick]);
  useLayoutEffect(() => {
    if (visible) {
      formRef.current?.resetFields();
    }
  }, [formRef, visible]);

  return (
    <Card
      className="view-control"
      bordered={false}>
      <Form
        className="form-search"
        onFinish={onFinish}
        initialValues={params}
        layout="inline"
      >
        <ActionButton onMenuClick={onActionClick} menu={actions} />
        <div className="right-form">
          <Form.Item className="form-group form-group-with-search" name="info">
            <Input prefix={<img src={search} alt="" />} style={{ width: 250 }} placeholder="Tên/Mã nhà cung cấp" />
          </Form.Item>
          <Form.Item className="form-group form-group-with-search" name="goods">
            <Select
              className="select-with-search"
              style={{
                width: 250,
              }}>
              <Select.Option value="">
                Ngành hàng
                  </Select.Option>
              {
                goods?.map((item) => (
                  <Select.Option key={item.value} value={item.value}>
                    {item.name}
                  </Select.Option>
                ))
              }
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="yody-search-button">Lọc</Button>
          </Form.Item>
          <Form.Item>
            <Button onClick={openFilter} className="yody-filter-button">Thêm bộ lọc</Button>
          </Form.Item>
        </div>
      </Form>
      <BaseFilter onClearFilter={onClearFilter} onFilter={onFilterClick} onCancel={onCancelFilter} visible={visible}>
        <Form onFinish={onFinish} ref={formRef} initialValues={params} layout="vertical">
          <Item name="goods" className="form-group form-group-with-search" label="Ngành hàng">
            <Select className="selector">
              <Option value="">
                Ngành hàng
            </Option>
              {goods?.map((item) => (
                <Option key={item.value} value={item.value}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Item>
          <Item name="contact" className="form-group form-group-with-search" label="Tên / SDT người liên hệ">
            <Input className="r-5 ip-search" placeholder="Tên/SDT người liên hệ" />
          </Item>
          <Item name="pic" className="form-group form-group-with-search" label="Tên / Mã người phục trách">
            <Input className="r-5 ip-search" placeholder="Tên/Mã người phụ trách" />
          </Item>
          <Row gutter={24}>
            <Col span={12}>
              <Item name="status" className="form-group form-group-with-search" label="Trạng thái">
                <Select className="selector">
                  <Option value="">
                    Chọn trạng thái
                </Option>
                  {supplierStatus?.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Item>
            </Col>
            <Col span={12}>
              <Item name="scorecard" className="form-group form-group-with-search" label="Phân cấp NCC">
                <Select className="selector">
                  <Option value="">
                    Chọn phân cấp
                </Option>
                  {scorecard?.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Item>
            </Col>
          </Row>
          <Item className="form-group form-group-with-search" label="Địa chỉ">
            <Input className="r-5 ip-search" placeholder="Địa chỉ" />
          </Item>
          <Row gutter={24}>
            <Col span={12}>
              <Item name="from_created_date" className="form-group form-group-with-search" label="Ngày tạo từ">
                <DatePicker className="r-5 w-100 ip-search" placeholder="Ngày tạo từ" />
              </Item>
            </Col>
            <Col span={12}>
              <Item name="to_created_date" className="form-group form-group-with-search" label="Đến">
                <DatePicker className="r-5 w-100 ip-search" placeholder="Ngày tạo đến" />
              </Item>
            </Col>
          </Row>
          <Item name="note" className="form-group form-group-with-search" label="Ghi chú">
            <Input className="r-5 ip-search" placeholder="Ghi chú" />
          </Item>
        </Form>
      </BaseFilter>
    </Card>
  )
}

export default SupplierFilter;
