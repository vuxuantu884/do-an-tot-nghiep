import {
  CheckOutlined,
} from "@ant-design/icons";
import {
  Button,
  Row,
  Col,
  Form,
  Space,
  Steps,
} from "antd";
import {useEffect} from "react";
import POSupplierForm from "./component/po-supplier.form";
import PurchaseInfo from "./component/purchase-info";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/UrlConfig";
import POProductForm from "./component/po-product.form";

const POCreateScreen = () => {
  useEffect(() => {}, []);

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
        <Row gutter={24}>
          {/* Left Side */}
          <Col md={18}>
            <POSupplierForm />
            <POProductForm />
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
