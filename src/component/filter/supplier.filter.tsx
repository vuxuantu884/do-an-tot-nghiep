import { Col, DatePicker, Form, FormInstance, Input, Row, Select } from "antd";
import { SearchSupplierQuerry } from "model/query/supplier.query";
import { BaseBootstrapResponse } from "model/response/bootstrap/BaseBootstrapResponse";
import { createRef, useCallback, useLayoutEffect } from "react";
import BaseFilter from "./base.filter"

type SupplierFilterProps = {
  visible: boolean,
  params: SearchSupplierQuerry
  onFilter?: (values: SearchSupplierQuerry) => void,
  onCancel?: () => void,
  onClearFilter?: () => void
  supplierStatus?: Array<BaseBootstrapResponse>,
  goods?: Array<BaseBootstrapResponse>,
  scorecard?: Array<BaseBootstrapResponse>,
}

const { Item } = Form;
const { Option } = Select;

const SupplierFilter: React.FC<SupplierFilterProps> = (props: SupplierFilterProps) => {
  const { visible, onCancel, onClearFilter, onFilter, params, goods, supplierStatus, scorecard} = props;
  const formRef = createRef<FormInstance>();
  const onFinish = useCallback((values: SearchSupplierQuerry) => {
    onFilter && onFilter(values);
  }, [onFilter]);
  const onFilterClick = useCallback(() => {
    formRef.current?.submit();
  }, [formRef]);
  useLayoutEffect(() => {
    if(visible) {
      formRef.current?.resetFields();
    }
  }, [formRef, visible]);
  return (
    <BaseFilter onClearFilter={onClearFilter} onFilter={onFilterClick} onCancel={onCancel} visible={visible}>
      <Form onFinish={onFinish} ref={formRef} initialValues={params} layout="vertical">
        <Item name="goods" className="form-group form-group-with-search" label="Ngành hàng">
          <Select className="selector">
            <Option value="">
              Ngành hàng
            </Option>
            {goods?.map((item, index) => (
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
                {supplierStatus?.map((item, index) => (
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
                {scorecard?.map((item, index) => (
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
  )
}

export default SupplierFilter;
