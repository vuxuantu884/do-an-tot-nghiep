import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Row, Select } from "antd";
import Checkbox from "antd/lib/checkbox/Checkbox";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/UrlConfig";
import { listKeyWordsModel } from "model/editor/editor.model";
import { useState } from "react";
import { Link } from "react-router-dom";
import CkEditor from "./ckeditor";
import Preview from "./preview";
import { StyledComponent } from "./styles";

const SettingCreatePrinter: React.FC = () => {
  const [form] = Form.useForm();
  const initialHtmlContent = "{ten_cong_ty}{dia_chi_cong_ty}{dia_chi_cong_ty}";
  const [htmlContent, setHtmlContent] = useState(initialHtmlContent);

  const handleOnChange = (value: string) => {
    console.log("value", value);
    setHtmlContent(value);
  };

  const sprintConfigure = {
    danhSachMauIn: [
      {
        tenMauIn: "Đơn bán hàng 1",
      },
      {
        tenMauIn: "Đơn bán hàng 2",
      },
    ],
    danhSachChiNhanh: [
      {
        tenChiNhanh: "YODY Kho tổng 1",
      },
      {
        tenChiNhanh: "YODY Kho tổng 2",
      },
    ],
    danhSachkhoIn: [
      {
        tenKhoIn: "Khổ in K80 (80x45 mm) 1",
      },
      {
        tenKhoIn: "Khổ in K80 (80x45 mm) 2",
      },
    ],
  };

  const FAKE_WORDS: listKeyWordsModel = [
    {
      title: "tên công ty",
      key: "{ten_cong_ty}",
      value: "YODY",
    },
    {
      title: "địa chỉ công ty",
      key: "{dia_chi_cong_ty}",
      value: "Hải dương",
    },
  ];

  const initialFormValue = {};

  const createPrinterHtml = () => {
    return (
      <Link to={`${UrlConfig.PRINTER}/create`}>
        <Button
          type="primary"
          className="ant-btn-primary"
          size="large"
          onClick={() => {}}
          icon={<PlusOutlined />}
        >
          Thêm mẫu in
        </Button>
      </Link>
    );
  };

  return (
    <StyledComponent>
      <ContentContainer
        title="Xử lý đơn hàng"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: UrlConfig.HOME,
          },
          {
            name: "Cài đặt",
            path: UrlConfig.ACCOUNTS,
          },
          {
            name: "Danh sách mẫu in",
            path: UrlConfig.PRINTER,
          },
          {
            name: "Thêm mới mẫu in",
          },
        ]}
        extra={createPrinterHtml()}
      >
        printer
        <Form
          form={form}
          name="control-hooks"
          layout="vertical"
          initialValues={initialFormValue}
        >
          <Card style={{ padding: "35px 15px", marginBottom: 20 }}>
            <Row gutter={20}>
              <Col span={6}>
                <Form.Item name="name" label="Chọn mẫu in:">
                  <Select
                    placeholder="Chọn mẫu in"
                    // onChange={this.onGenderChange}
                    allowClear
                  >
                    {sprintConfigure.danhSachMauIn &&
                      sprintConfigure.danhSachMauIn.map((single, index) => {
                        return (
                          <Select.Option value={single.tenMauIn} key={index}>
                            {single.tenMauIn}
                          </Select.Option>
                        );
                      })}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="chiNhanh" label="Chọn chi nhánh áp dụng:">
                  <Select
                    placeholder="Chọn Chọn chi nhánh áp dụng:"
                    // onChange={this.onGenderChange}
                    allowClear
                  >
                    {sprintConfigure.danhSachChiNhanh &&
                      sprintConfigure.danhSachChiNhanh.map((single, index) => {
                        return (
                          <Select.Option value={single.tenChiNhanh} key={index}>
                            {single.tenChiNhanh}
                          </Select.Option>
                        );
                      })}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="khoIn" label="Chọn khổ in:">
                  <Select
                    placeholder="Chọn khổ in"
                    // onChange={this.onGenderChange}
                    allowClear
                  >
                    {sprintConfigure.danhSachkhoIn &&
                      sprintConfigure.danhSachkhoIn.map((single, index) => {
                        return (
                          <Select.Option value={single.tenKhoIn} key={index}>
                            {single.tenKhoIn}
                          </Select.Option>
                        );
                      })}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="active" valuePropName="checked">
                  <Checkbox>Đặt làm khổ in mặc định</Checkbox>
                </Form.Item>
              </Col>
            </Row>
          </Card>
          <Row gutter={20}>
            <Col span={12}>
              <Card style={{ padding: "35px 15px" }}>
                <Form.Item name="editor">
                  {/* <Editor onChange={handleOnChange} /> */}
                  {/* <CkEditor onChange={handleOnChange} /> */}
                  <CkEditor
                    onChange={handleOnChange}
                    initialHtmlContent={initialHtmlContent}
                    listKeyWords={FAKE_WORDS}
                  />
                </Form.Item>
              </Card>
            </Col>
            <Col span={12}>
              <Card style={{ padding: "35px 15px" }}>
                Preview
                <Preview htmlContent={htmlContent} listKeyWords={FAKE_WORDS} />
              </Card>
            </Col>
          </Row>
        </Form>
      </ContentContainer>
    </StyledComponent>
  );
};

export default SettingCreatePrinter;
