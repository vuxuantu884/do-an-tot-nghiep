import {
  SearchOutlined,
  UnorderedListOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Input,
  Row,
  Col,
  Form,
  Checkbox,
  Space,
  Steps,
} from "antd";
import POSupplierForm from "./component/po-supplier.form";
import PurchaseItem from "./component/purchase-item";
import PurchaseInfo from "./component/purchase-info";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/UrlConfig";

const POCreateScreen = () => {
  return (
    <ContentContainer
      title="Quản lý đơn đặt hàng"
      breadcrumb={[
        {
          name: "Tổng quản",
          path: UrlConfig.HOME,
        },
        {
          name: "Đặt hàng",
          path: `${UrlConfig.PURCHASE_ORDER}`,
        },
        {
          name: "Tạo mới đơn đặt hàng",
        },
      ]}
      extra={
        <Steps
          progressDot={(dot: any, { status, index }: any) => (
            <div className="ant-steps-icon-dot">
              {(status === "process" || status === "finish") && (
                <CheckOutlined />
              )}
            </div>
          )}
          size="small"
          current={0}
        >
          <Steps.Step title="Đặt hàng" />
          <Steps.Step title="Duyệt" />
          <Steps.Step title="Nhập kho" />
          <Steps.Step title="Hoàn thành" />
        </Steps>
      }
    >
      <Form.Provider>
        <Row gutter={20}>
          {/* Left Side */}
          <Col md={18}>
            <POSupplierForm />
            <Card
              className="margin-top-20"
              title={
                <Space>
                  <UnorderedListOutlined />
                  Sản phẩm
                </Space>
              }
              extra={
                <Space size={20}>
                  <Checkbox>Tách dòng</Checkbox>
                </Space>
              }
            >
              <div className="padding-20">
                <Row gutter={20}>
                  <Col md={24}>
                    <Form.Item label="Sản phẩm">
                      <Input
                        prefix={<SearchOutlined />}
                        placeholder="Tìm sản phẩm/ SKU/ mã vạch (F3)"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
              <PurchaseItem />
            </Card>
          </Col>
          {/* Right Side */}
          <Col md={6}>
            <PurchaseInfo />
          </Col>
        </Row>
        <div className="margin-top-20 text-right">
          <Space size={12}>
            <Button>Huỷ</Button>
            <Button type="primary" htmlType="submit">
              Lưu
            </Button>
          </Space>
        </div>
      </Form.Provider>
    </ContentContainer>
  );
};

export default POCreateScreen;
