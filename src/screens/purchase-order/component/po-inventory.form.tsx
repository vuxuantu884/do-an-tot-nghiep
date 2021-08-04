import { Card, Col, Form, Row, Select } from "antd";
import CustomDatepicker from "component/custom/date-picker.custom";
import { StoreResponse } from "model/core/store.model";
import { POField } from "model/purchase-order/po-field";

type POInventoryFormProps = {
  stores: Array<StoreResponse>,
}


const POInventoryForm: React.FC<POInventoryFormProps> = (props: POInventoryFormProps) => {
let now = new Date();
  
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
            <Form.Item name={POField.expect_store_id} required label="Kho nhập hàng">
              <Select>
                <Select.Option value="">
                  Chọn kho nhập
                </Select.Option>
                {
                  props.stores.map((item) => (
                    <Select.Option key={item.id} value={item.id}>
                      {item.name}
                    </Select.Option>
                  ))
                }
              </Select>
            </Form.Item>
          </Col>
          <Col span={24} md={10}>
            <Form.Item name={POField.expect_import_date} required label="Ngày nhận dự kiến">
              <CustomDatepicker disableDate={(date) => date.valueOf() < now.getTime()} style={{width: '100%'}} />
            </Form.Item>
          </Col>
        </Row>
      </div>
    </Card>
  );
};

export default POInventoryForm;
