import { Card, Col, Row, Tabs, Form, Space, Button, Radio, Upload, Input } from "antd";
import ContentContainer from "component/container/content.container";
import updateProductExampleImg from "../../../../assets/img/update_product_example.png";
import UrlConfig from "config/url.config"
import { ProductImportScreenStyled } from "./styled";
import BottomBarContainer from "component/container/bottom-bar.container";
import { UploadOutlined } from "@ant-design/icons";

const ProductImportScreen: React.FC = () => {
  const [form] = Form.useForm();
  return (
    <ProductImportScreenStyled>
      <Form
        form={form}
        onFinish={() => {}}
        layout="vertical"
      >
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
            <Card>
              <Tabs defaultActiveKey="1">
                <Tabs.TabPane tab="Nhập mới" key="1">
                  <img src={updateProductExampleImg} alt="" />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Cập nhập thông tin" key="2">
                  <img src={updateProductExampleImg} alt="" />
                </Tabs.TabPane>
              </Tabs>
            </Card>

            <Row gutter={18}>
              <Col span={18}>
                <Card title="Thông tin import" >
                  <Form.Item
                    name="radio-button"
                    label="Kiểu Import:"
                  >
                    <Radio.Group defaultValue="a">
                      <Radio value="a">Thêm mới</Radio>
                      <Radio value="b">Cập nhật thông tin</Radio>
                    </Radio.Group>
                  </Form.Item>
                  <Form.Item
                    name="upload"
                    label="File excel:"
                  >
                    <Upload name="logo" action="/upload.do" listType="picture">
                      <Button icon={<UploadOutlined />}>Chọn file</Button>
                    </Upload>
                  </Form.Item>
                  <Form.Item
                    className="note_item"
                    name="note"
                    label="Ghi chú:"
                  >
                    <Input.TextArea
                      autoSize={{ minRows: 3, maxRows: 5 }}
                      placeholder="Nhập ghi chú"
                    />
                  </Form.Item>
                </Card>
              </Col>
              <Col span={6}>
                <Card title="Link file Excel mẫu">
                  <p>Mẫu thêm mới:</p>
                  <p>Mẫu cập nhật:</p>
                </Card>
              </Col>
            </Row>
        </ContentContainer>
          <BottomBarContainer
            back="Quay lại"
            rightComponent={
              <Space>
                <Button onClick={() => {}}>Huỷ</Button>
                <Button
                  type="primary"
                >
                  Import
                </Button>
              </Space>
            }
          />
      </Form>
    </ProductImportScreenStyled>
  )
}

export default ProductImportScreen;
