import { Col, DatePicker, Form, Input, Row } from "antd";
import { RootReducerType } from "model/reducers/RootReducerType";
import { useSelector } from "react-redux";
import BaseFilter from "./base.filter"

type SupplierFilterProps = {
  visible: boolean,
}

const { Item } = Form;

const SupplierFilter: React.FC<SupplierFilterProps> = (props: SupplierFilterProps) => {
  const { visible } = props;
  const supplierStatus = useSelector((state: RootReducerType) => state.bootstrapReducer.data?.supplier_status)
  return (
    <BaseFilter visible={visible}>
      <Form layout="vertical">
        <Item className="form-group form-group-with-search" label="Ngành hàng">
          <Input />
        </Item>
        <Item className="form-group form-group-with-search" label="Tên / SDT người liên hệ">
          <Input />
        </Item>
        <Item className="form-group form-group-with-search" label="Tên / Mã người phục trách">
          <Input />
        </Item>
        <Row gutter={24}>
          <Col span={12}>
            <Item className="form-group form-group-with-search" label="Trạng thái">
              <Input />
            </Item>
          </Col>
          <Col span={12}>
            <Item className="form-group form-group-with-search" label="Phân cấp NCC">
              <Input />
            </Item>
          </Col>
        </Row>
        <Item className="form-group form-group-with-search" label="Địa chỉ">
          <Input placeholder="Địa chỉ"/>
        </Item>
        <Row gutter={24}>
          <Col span={12}>
            <Item className="form-group form-group-with-search" label="Ngày tạo từ">
              <DatePicker placeholder="Ngày tạo từ" />
            </Item>
          </Col>
          <Col span={12}>
            <Item className="form-group form-group-with-search" label="Đến">
              <DatePicker  placeholder="Ngày tạo đến" />
            </Item>
          </Col>
        </Row>
        <Item className="form-group form-group-with-search" label="Ghi chú">
          <Input placeholder="Ghi chú" />
        </Item>
      </Form>
    </BaseFilter>
  )
}

export default SupplierFilter;
