import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Switch,
} from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import React, {ReactElement, useState} from "react";
import {priorityOptions} from "../discount/components/general.info";
import GeneralConditionForm from "../shared/general-condition.form";

interface Props {}

export default function GiftCreate(props: Props): ReactElement {
  const [form] = Form.useForm();
  const [unlimitedUsage, setUnlimitedUsage] = useState<boolean>(true);

  return (
    <ContentContainer
      title="Tạo quà tặng"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Khuyến mại",
          path: `#`,
        },
        {
          name: "Quà tặng",
          path: `#`,
        },
        {
          name: "Tạo quà  tặng",
          path: `${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}/create`,
        },
      ]}
    >
      <Form form={form}>
        <Row gutter={24}>
          <Col span={18}>
            <Card
              title={
                <div className="d-flex">
                  <span className="title-card">THÔNG TIN CHUNG</span>
                </div>
              }
            >
              <Row gutter={30}>
                <Col span={12}>
                  <Form.Item
                    name="title"
                    label="Tên khuyến mại"
                    rules={[
                      {
                        required: true,
                        message: "Cần nhập tên khuyến mại",
                      },
                      {
                        len: 255,
                        message: "Tên khuyến mại không vượt quá 255 ký tự",
                      },
                    ]}
                    labelCol={{span: 24, offset: 0}}
                  >
                    <Input placeholder="Nhập tên khuyến mại" maxLength={255} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="discount_code"
                    label="Mã khuyến mại"
                    rules={[
                      {
                        len: 20,
                        message: "Mã khuyến mại không vượt quá 20 ký tự",
                      },
                      {
                        pattern: /^GI([0-9])+$/,
                        message: "Mã khuyến mại sai định dạng",
                      },
                    ]}
                    labelCol={{span: 24, offset: 0}}
                  >
                    <Input
                      placeholder="Mã khuyến mại tạo tự động"
                      maxLength={20}
                      disabled
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Row gutter={30}>
                    <Col span={12}>
                      <Form.Item
                        label={<b>Số lượng áp dụng:</b>}
                        name="usage_limit"
                        rules={[
                          {
                            required: !unlimitedUsage,
                            message: "Vui lòng nhập số lượng áp dụng",
                          },
                        ]}
                        labelCol={{span: 24, offset: 0}}
                      >
                        <InputNumber
                          disabled={unlimitedUsage}
                          style={{width: "100%"}}
                          placeholder="Nhập số lượng khuyến mại"
                          min={0}
                          maxLength={6}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label=" "
                        name="usage_limit"
                        colon={false}
                        labelCol={{span: 24, offset: 0}}
                      >
                        <Space>
                          <Switch
                            defaultChecked={unlimitedUsage}
                            onChange={(value) => {
                              form.validateFields(["usage_limit"]);
                              form.setFieldsValue({
                                usage_limit: null,
                              });
                              setUnlimitedUsage(value);
                            }}
                          />
                          {"Không giới hạn"}
                        </Space>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={30}>
                    <Col span={24}>
                      <Form.Item
                        label={<b>Mức độ ưu tiên:</b>}
                        name="priority"
                        labelCol={{span: 24, offset: 0}}
                      >
                        <Select placeholder="Chọn mức độ ưu tiên">
                          {priorityOptions.map((item) => (
                            <Select.Option key={item.value} value={item.value}>
                              {item.label}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="description"
                    label="Mô tả"
                    rules={[
                      {
                        len: 500,
                        message: "Mô tả khuyến mại không vượt quá 500 ký tự",
                      },
                    ]}
                    labelCol={{span: 24, offset: 0}}
                  >
                    <Input.TextArea
                      style={{minHeight: 145}}
                      placeholder="Nhập mô tả cho khuyến mại"
                      maxLength={500}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col span={6}>
            <GeneralConditionForm form={form} />
          </Col>
        </Row>
      </Form>
      <BottomBarContainer
        back="Quay lại danh sách khuyến mại quà tặng"
        rightComponent={
          <>
            <Button
              //   onClick={() => save()}
              style={{
                marginLeft: ".75rem",
                marginRight: ".75rem",
                borderColor: "#2a2a86",
              }}
              type="ghost"
            >
              Lưu
            </Button>
            <Button type="primary">Lưu và kích hoạt</Button>
          </>
        }
      />
    </ContentContainer>
  );
}
