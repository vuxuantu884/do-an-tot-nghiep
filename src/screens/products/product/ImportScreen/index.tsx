import {
  Card,
  Col,
  Row,
  Tabs,
  Form,
  Space,
  Button,
  Radio,
  Upload,
  Input,
} from "antd";
import ContentContainer from "component/container/content.container";
import updateProductExampleImg from "../../../../assets/img/update_product_example.png";
import UrlConfig from "config/url.config";
import { ProductImportScreenStyled } from "./styled";
import BottomBarContainer from "component/container/bottom-bar.container";
import { UploadOutlined } from "@ant-design/icons";

const ProductImportScreen: React.FC = () => {
  const [form] = Form.useForm();
  return (
    <ProductImportScreenStyled>
      <Form form={form} onFinish={() => {}} layout="vertical">
        <ContentContainer
          title="Nhập File"
          breadcrumb={[
            {
              name: "Tổng quản",
              path: UrlConfig.HOME,
            },
            {
              name: "Sản phẩm",
              path: `${UrlConfig.PRODUCT}`,
            },
            {
              name: "Nhập file",
            },
          ]}
        >
          <Card className="margin-top-20">
            <Tabs defaultActiveKey="1">
              <Tabs.TabPane tab="Nhập mới" key="1">
                <div className="padding-20">
                  <img src={updateProductExampleImg} alt="" />
                </div>
              </Tabs.TabPane>
              <Tabs.TabPane tab="Cập nhập thông tin" key="2">
                <div className="padding-20">
                  <img src={updateProductExampleImg} alt="" />
                </div>
              </Tabs.TabPane>
            </Tabs>
          </Card>

          <Row gutter={18}>
            <Col span={18}>
              <Card className="margin-top-20" title="Thông tin import">
                <div className="padding-20">
                  <Form.Item name="radio-button" label="Kiểu Import:">
                    <Radio.Group defaultValue="a">
                      <Radio value="a">Thêm mới</Radio>
                      <Radio value="b">Cập nhật thông tin</Radio>
                    </Radio.Group>
                  </Form.Item>
                  <Form.Item name="upload" label="File excel:">
                    <Upload name="logo">
                      <Button icon={<UploadOutlined />}>Chọn file</Button>
                    </Upload>
                  </Form.Item>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card className="margin-top-20" title="Link file Excel mẫu">
                <div className="padding-20">
                  <p>Mẫu thêm mới:</p>
                  <p>Mẫu cập nhật:</p>
                </div>
              </Card>
            </Col>
          </Row>
        </ContentContainer>
        <BottomBarContainer
          back="Quay lại"
          rightComponent={
            <Space>
              <Button type="primary">Import</Button>
            </Space>
          }
        />
      </Form>
    </ProductImportScreenStyled>
  );
};

export default ProductImportScreen;
