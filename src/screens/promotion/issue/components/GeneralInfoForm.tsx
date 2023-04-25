import React, { ReactElement } from "react";
import { Card, Col, Form, Input, Row } from "antd";
import { nonAccentVietnamese } from "utils/PromotionUtils";
// import { IssueContext } from "screens/promotion/issue/components/issue-provider";

function GeneralInfoForm(): ReactElement {
  // const { registerWithMinistry, setRegisterWithMinistry } = useContext(IssueContext);

  return (
    <div>
      <Card title={"THÔNG TIN CHUNG"}>
        <Row gutter={30}>
          <Col span={12}>
            <Form.Item
              name="title"
              label={"Tên đợt phát hành"}
              rules={[
                {
                  required: true,
                  message: "Cần nhập tên khuyến mại",
                },
                {
                  max: 255,
                  message: "Tên khuyến mại không vượt quá 255 ký tự",
                },
              ]}
            >
              <Input id={"title"} placeholder="Nhập tên đợt phát hành" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="code"
              label="Mã đợt phát hành:"
              normalize={(value) => nonAccentVietnamese(value)}
            >
              <Input maxLength={20} disabled={true} placeholder="Mã hệ thống tạo tự động" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="description"
              label="Mô tả"
              rules={[
                {
                  max: 500,
                  message: "Mô tả không được vượt quá 500 ký tự",
                },
              ]}
            >
              <Input.TextArea
                placeholder="Nhập mô tả cho đợt phát hành"
                autoSize={{ minRows: 5, maxRows: 5 }}
              />
            </Form.Item>
          </Col>

          {/*<Col span={12} style={{ marginTop: 30 }}>*/}
          {/*  <Form.Item>*/}
          {/*    <Space>*/}
          {/*      <Switch*/}
          {/*        checked={registerWithMinistry}*/}
          {/*        onChange={(value) => {*/}
          {/*          setRegisterWithMinistry(value);*/}
          {/*        }}*/}
          {/*      />*/}
          {/*      Đã đăng ký Bộ công thương*/}
          {/*    </Space>*/}
          {/*  </Form.Item>*/}
          {/*</Col>*/}
        </Row>
      </Card>
    </div>
  );
}

export default GeneralInfoForm;
