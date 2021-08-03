import { Card, Col, Form, Row, Select } from "antd";
import CustomDatepicker from "component/custom/date-picker.custom";

const POInventoryForm: React.FC = () => {
  return (
    <Card
      className="po-form margin-top-20"
      title={
        <div className="d-flex">
          <span className="title-card">NHẬP KHO</span>
        </div>
      }
    >
      <div className="padding-20">
        <Row gutter={50}>
          <Col span={24} md={10}>
            <Form.Item required label="Kho nhập hàng">
              <Select>

              </Select>
            </Form.Item>
          </Col>
          <Col span={24} md={10}>
            <Form.Item required label="Ngày nhận dự kiến">
              <CustomDatepicker style={{width: '100%'}} />
            </Form.Item>
          </Col>
        </Row>
      </div>
    </Card>
  );
};

export default POInventoryForm;
