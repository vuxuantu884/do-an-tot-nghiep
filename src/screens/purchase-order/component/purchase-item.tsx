//#region Import
import { Row, Col, Form, Button, Checkbox, Divider, Tag } from "antd";

const PurchaseItem = () => {
  //#region state
  return (
    <div>
      <div className="display-block margin-top-20 text-center">
        <Button>Thêm sản phẩm ngay (F3)</Button>
      </div>
      <Divider />
      <div className="padding-20">
        <Row gutter={20}>
          <Col md={12}>
            <Form.Item>
              <Checkbox>Bỏ chiết khấu tự động</Checkbox>
            </Form.Item>
            <Form.Item>
              <Checkbox>Không tính thuế VAT</Checkbox>
            </Form.Item>
            <Form.Item>
              <Checkbox>Bỏ tích điểm tự động</Checkbox>
            </Form.Item>
          </Col>
          <Col md={12}>
            <Form.Item>
              <div className="display-flex flex-space-between align-center">
                <strong>Tổng tiền</strong>
                <strong>300.000</strong>
              </div>
            </Form.Item>
            <Form.Item>
              <div className="display-flex flex-space-between align-center">
                <div>
                  <span className="text-focus text-bottom-dash margin-right-10">Chiết khấu</span>
                  <Tag className="orders-tag orders-tag-danger" closable>
                    10%
                  </Tag>
                </div>
                <span>30.000</span>
              </div>
            </Form.Item>
            <Form.Item>
              <div className="display-flex flex-space-between align-center">
                <div>
                  <span className="text-focus margin-right-10">Mã giảm giá</span>{" "}
                  <Tag className="orders-tag orders-tag-focus" closable>
                    10%
                  </Tag>
                </div>
                <span>70.000</span>
              </div>
            </Form.Item>
            <Form.Item>
              <div className="display-flex flex-space-between align-center">
                <span>Phí ship báo khách</span>
                <span>20.000</span>
              </div>
            </Form.Item>
            <Divider />
            <Form.Item>
              <div className="display-flex flex-space-between align-center">
                <strong>Khách cần trả</strong>
                <strong className="text-success">200.000</strong>
              </div>
            </Form.Item>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default PurchaseItem;
