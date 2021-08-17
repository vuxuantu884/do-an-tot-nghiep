import { Button, Card, Col, Form, Row, Select } from "antd";
import Checkbox from "antd/lib/checkbox/Checkbox";
import { FormPrinterModel, listKeyWordsModel } from "model/editor/editor.model";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ReactToPrint from "react-to-print";
import Editor from "../ckeditor";
import Preview from "../preview";
import { StyledComponent } from "./styles";

type PropType = {
  type?: "create" | "edit";
  formValue?: FormPrinterModel;
};

const FormPrinter: React.FC<PropType> = (props: PropType) => {
  const { type, formValue } = props;
  const [form] = Form.useForm();
  const isEdit = type === "edit" ? true : false;
  const [htmlContent, setHtmlContent] = useState("");
  const [selectedPrintSize, setSelectedPrintSize] = useState("");
  const componentRef = useRef(null);

  const handleOnChangeEditor = (value: string) => {
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

  const initialFormValue =
    isEdit && formValue
      ? {
          tenMauIn: formValue.tenMauIn,
          chiNhanhApDung: formValue.chiNhanhApDung,
          khoIn: formValue.khoIn,
          apDung: formValue.apDung,
          formIn: formValue.formIn,
        }
      : {
          tenMauIn: "",
          chiNhanhApDung: "",
          khoIn: "",
          apDung: false,
          formIn: "",
        };

  const onChangeKhoIn = (value: string) => {
    setSelectedPrintSize(value);
    setHtmlContent(value);
  };

  const handleSubmitForm = () => {
    const formValue = form.getFieldsValue();
    console.log("formValue", formValue);
  };

  useEffect(() => {
    if (isEdit && formValue) {
      setHtmlContent(formValue.formIn);
      setSelectedPrintSize(formValue.formIn);
    }
  }, [formValue, isEdit]);

  return (
    <StyledComponent>
      {initialFormValue.formIn && (
        <Form form={form} layout="vertical" initialValues={initialFormValue}>
          <Card style={{ padding: "35px 15px", marginBottom: 20 }}>
            <Row gutter={20} className="sectionFilter">
              <Col span={6}>
                <Form.Item name="tenMauIn" label="Chọn mẫu in:">
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
                <Form.Item
                  name="chiNhanhApDung"
                  label="Chọn chi nhánh áp dụng:"
                >
                  <Select
                    placeholder="Chọn chi nhánh áp dụng:"
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
                    onChange={onChangeKhoIn}
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
                <Form.Item name="apDung" valuePropName="checked">
                  <Checkbox>Áp dụng</Checkbox>
                </Form.Item>
              </Col>
            </Row>
          </Card>
          <Row gutter={20}>
            <Col span={12}>
              <Card style={{ padding: "35px 15px", height: "100%" }}>
                {/* <Editor onChange={handleOnChangeEditor} /> */}
                {/* <CkEditor onChange={handleOnChangeEditor} /> */}
                <React.Fragment>
                  <Form.Item name="formIn">
                    {/* <Input hidden /> */}
                    <Editor
                      onChange={handleOnChangeEditor}
                      initialHtmlContent={htmlContent}
                      listKeyWords={FAKE_WORDS}
                      selectedPrintSize={selectedPrintSize}
                    />
                  </Form.Item>
                </React.Fragment>
              </Card>
            </Col>
            <Col span={12}>
              <Card style={{ padding: "35px 15px", height: "100%" }}>
                <div className="printContent" ref={componentRef}>
                  <Preview
                    htmlContent={htmlContent}
                    listKeyWords={FAKE_WORDS}
                  />
                </div>
              </Card>
            </Col>
          </Row>
          <div className="groupButtons">
            <Button type="primary" danger>
              <Link to="/">Hủy</Link>
            </Button>
            <Button
              type="primary"
              onClick={() => {
                handleSubmitForm();
              }}
            >
              Lưu
            </Button>
          </div>
        </Form>
      )}
    </StyledComponent>
  );
};

export default FormPrinter;
