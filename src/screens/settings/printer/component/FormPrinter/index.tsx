import { Button, Card, Col, Form, Row, Select } from "antd";
import Checkbox from "antd/lib/checkbox/Checkbox";
import Editor from "component/ckeditor";
import UrlConfig from "config/UrlConfig";
import { getListStoresSimpleAction } from "domain/actions/core/store.action";
import { StoreResponse } from "model/core/store.model";
import { listKeywordsModel } from "model/editor/editor.model";
import { PrinterModel } from "model/response/printer.response";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import {
  LIST_PRINTER_SIZES,
  LIST_PRINTER_TYPES,
} from "utils/Printer.constants";
import Preview from "../preview";
import { StyledComponent } from "./styles";

type PropType = {
  type?: "create" | "edit";
  formValue?: PrinterModel;
};

type StoreType = {
  id: number;
  name: string;
}[];

const FormPrinter: React.FC<PropType> = (props: PropType) => {
  const { type, formValue } = props;
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const isEdit = type === "edit" ? true : false;
  const [htmlContent, setHtmlContent] = useState("");
  // const [isEditorLoad, setIsEditorLoad] = useState(true);
  const [listStores, setListStores] = useState<StoreType>([]);
  const [previewHeaderHeight, setPreviewHeaderHeight] = useState(108);
  const [selectedPrintSize, setSelectedPrintSize] = useState("");
  const componentRef = useRef(null);

  const handleOnChangeEditor = (value: string) => {
    setHtmlContent(value);
  };

  const sprintConfigure = {
    listPrinterTypes: LIST_PRINTER_TYPES,
    listStores: listStores,
    listPrinterSizes: LIST_PRINTER_SIZES,
  };

  const FAKE_WORDS: listKeywordsModel = [
    {
      title: "tên công ty",
      key: "{company_name}",
      value: "YODY",
    },
    {
      title: "địa chỉ công ty",
      key: "{dia_chi_cong_ty}",
      value: "Hải dương",
    },
  ];

  const FAKE_PRODUCT_WORDS = [
    {
      title: "tên sản phẩm",
      key: "{product_name}",
      value: ["{sản phẩm 1}", "{sản phẩm 2}"],
      isRepeat: true,
    },
    {
      title: "giá sản phẩm",
      key: "{gia_san_pham}",
      value: ["{100}", "{200}"],
      isRepeat: true,
    },
    {
      title: "màu sắc",
      key: "{mau_sac_san_pham}",
      value: ["{xanh}", "{vàng}"],
      isRepeat: true,
    },
  ];

  const initialFormValue = useMemo(() => {
    let result =
      isEdit && formValue
        ? {
            company: formValue.company,
            company_id: formValue.company_id,
            default: formValue.default,
            print_size: formValue.print_size,
            store: formValue.store,
            store_id: formValue.store_id,
            template: formValue.template,
            type: formValue.type,
          }
        : {
            company: "",
            company_id: 0,
            default: false,
            print_size: "",
            store: "",
            store_id: 0,
            template: "",
            type: "",
          };
    return result;
  }, [isEdit, formValue]);

  const onChangeKhoIn = (value: string) => {
    if (isEdit) {
      setSelectedPrintSize(value);
      setHtmlContent(value);
    }
  };

  const handleSubmitForm = () => {
    const formComponentValue = form.getFieldsValue();
    console.log("formComponentValue", formComponentValue);
  };

  const handleEditorToolbarHeight = (height: number) => {
    setPreviewHeaderHeight(height);
  };

  useEffect(() => {
    if (isEdit && formValue) {
      setHtmlContent(formValue.template);
      setSelectedPrintSize(formValue.print_size);
      form.setFieldsValue(initialFormValue);
      // setIsEditorLoad(true);
    }
  }, [form, formValue, initialFormValue, isEdit]);

  useEffect(() => {
    dispatch(
      getListStoresSimpleAction((data: StoreResponse[]) => {
        setListStores(data);
      })
    );
  }, [dispatch]);

  return (
    <StyledComponent>
      <Form form={form} layout="vertical" initialValues={initialFormValue}>
        <Card
          style={{ padding: "20px 15px", marginBottom: 20, borderRadius: 12 }}
        >
          <Row gutter={20} className="sectionFilter">
            <Col span={6}>
              <Form.Item name="type" label="Chọn mẫu in:">
                <Select
                  placeholder="Chọn mẫu in"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option?.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {sprintConfigure.listPrinterTypes &&
                    sprintConfigure.listPrinterTypes.map((single, index) => {
                      return (
                        <Select.Option value={single.value} key={index}>
                          {single.name}
                        </Select.Option>
                      );
                    })}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="store_id" label="Chọn chi nhánh áp dụng:">
                <Select
                  placeholder="Chọn chi nhánh áp dụng:"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option?.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  <Select.Option value={10000}>Tất cả cửa hàng</Select.Option>
                  {sprintConfigure.listStores &&
                    sprintConfigure.listStores.map((single, index) => {
                      // console.log("single", single);
                      return (
                        <Select.Option value={single.id} key={index}>
                          {single.name}
                        </Select.Option>
                      );
                    })}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="print_size" label="Chọn khổ in:">
                <Select
                  placeholder="Chọn khổ in"
                  onChange={onChangeKhoIn}
                  allowClear
                >
                  {sprintConfigure.listPrinterSizes &&
                    sprintConfigure.listPrinterSizes.map((single, index) => {
                      return (
                        <Select.Option value={single.value} key={index}>
                          {single.name}
                        </Select.Option>
                      );
                    })}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="default" valuePropName="checked">
                <Checkbox>Áp dụng</Checkbox>
              </Form.Item>
            </Col>
          </Row>
        </Card>
        <Row gutter={20}>
          <Col span={12}>
            <Card style={{ padding: "15px 15px", height: "100%" }}>
              {/* <Editor onChange={handleOnChangeEditor} /> */}
              {/* <CkEditor onChange={handleOnChangeEditor} /> */}
              <React.Fragment>
                {/* <Input hidden /> */}
                {/* {isEditorLoad && selectedPrintSize && ( */}
                {(!isEdit || selectedPrintSize) && (
                  <Form.Item name="template">
                    <Editor
                      onChange={handleOnChangeEditor}
                      initialHtmlContent={htmlContent}
                      listKeywords={FAKE_WORDS}
                      selectedPrintSize={selectedPrintSize}
                      previewHeaderHeight={handleEditorToolbarHeight}
                    />
                  </Form.Item>
                )}
              </React.Fragment>
            </Card>
          </Col>
          <Col span={12}>
            <Card style={{ padding: "15px 15px", height: "100%" }}>
              <div className="printContent" ref={componentRef}>
                <Preview
                  htmlContent={htmlContent}
                  listKeywords={FAKE_WORDS}
                  listProductKeywords={FAKE_PRODUCT_WORDS}
                  previewHeaderHeight={previewHeaderHeight}
                />
              </div>
            </Card>
          </Col>
        </Row>
        <div className="groupButtons">
          <Button>
            <Link to={`${UrlConfig.PRINTER}`}>Thoát</Link>
          </Button>
          <Button
            type="primary"
            onClick={() => {
              handleSubmitForm();
            }}
          >
            {isEdit ? "Lưu" : "Thêm mới"}
          </Button>
        </div>
      </Form>
    </StyledComponent>
  );
};

export default FormPrinter;
