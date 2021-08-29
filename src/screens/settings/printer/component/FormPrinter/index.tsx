import { Button, Card, Col, Form, Input, Row, Select } from "antd";
import Checkbox from "antd/lib/checkbox/Checkbox";
import Editor from "component/ckeditor";
import UrlConfig from "config/UrlConfig";
import { getListStoresSimpleAction } from "domain/actions/core/store.action";
import {
  actionCreatePrinter,
  actionFetchListPrinterVariables,
} from "domain/actions/printer/printer.action";
import { StoreResponse } from "model/core/store.model";
import { listKeywordsModel } from "model/editor/editor.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import {
  BasePrinterModel,
  FormPrinterModel,
  PrinterVariableResponseModel,
} from "model/response/printer.response";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { DEFAULT_FORM_VALUE } from "utils/Constants";
import { LIST_PRINTER_TYPES } from "utils/Printer.constants";
import Preview from "../preview";
import { StyledComponent } from "./styles";

type PropType = {
  id?: string;
  type?: FormPrinterModel;
  formValue?: BasePrinterModel;
};

type StoreType = {
  id: number;
  name: string;
}[];

const FormPrinter: React.FC<PropType> = (props: PropType) => {
  const { id, type, formValue } = props;
  const store_id_allShops = -1;
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const isEdit = type === "edit" ? true : false;
  const [htmlContent, setHtmlContent] = useState("");
  const isShowEditor = isEdit;
  const [listStores, setListStores] = useState<StoreType>([]);
  const [previewHeaderHeight, setPreviewHeaderHeight] = useState(108);
  const [selectedPrintSize, setSelectedPrintSize] = useState("");
  const componentRef = useRef(null);
  const history = useHistory();
  const bootstrapReducer = useSelector(
    (state: RootReducerType) => state.bootstrapReducer
  );

  const [printerVariables, setPrinterVariables] =
    useState<PrinterVariableResponseModel>({});

  const handleOnChangeEditor = (value: string) => {
    setHtmlContent(value);
  };

  const sprintConfigure = {
    listPrinterTypes: LIST_PRINTER_TYPES,
    listStores: listStores,
    listPrinterSizes: bootstrapReducer.data?.print_size,
  };

  /**
   * các biến printer
   */
  const LIST_PRINTER_VARIABLES: listKeywordsModel[] = [
    {
      name: "Thông tin cửa hàng",
      list: printerVariables.print_store_variable,
    },
    {
      name: "Thông tin đơn hàng",
      list: printerVariables.print_order_variable,
    },
    {
      name: "Thông tin vận chuyển",
      list: printerVariables.print_shipment_variable,
    },
  ];

  /**
   * list product lặp
   */
  // const LIST_PRINTER_PRODUCT_VARIABLES = [
  //   {
  //     title: "tên sản phẩm",
  //     key: "{product_name}",
  //     value: ["sản phẩm 1", "sản phẩm 2"],
  //   },
  //   {
  //     title: "giá sản phẩm",
  //     key: "{gia_san_pham}",
  //     value: ["100", "200"],
  //   },
  //   {
  //     title: "màu sắc",
  //     key: "{mau_sac_san_pham}",
  //     value: ["xanh", "vàng"],
  //   },
  // ];
  // for (const abc of printerVariables.print_product_variable) {
  //   // let [d, e] = abc.preview_value.replaceAll('"', "").split(",");
  //   abc.preview_value_format = ["vd1", "vd2"];
  // }

  // console.log("printerVariables.print_product_variable", printerVariables);

  if (
    printerVariables.print_product_variable &&
    printerVariables.print_product_variable.length
  ) {
    for (let i = 0; i < printerVariables.print_product_variable.length; i++) {
      printerVariables.print_product_variable[i].preview_value_format = [
        "vd1",
        "vd2",
      ];
    }
  }
  const LIST_PRINTER_PRODUCT_VARIABLES_zzz = {
    name: "Thông tin sản phẩm",
    list: printerVariables.print_product_variable,
  };

  const LIST_PRINTER_PRODUCT_VARIABLES = LIST_PRINTER_PRODUCT_VARIABLES_zzz;

  const isCanEditFormHeader = isShowEditor || type === "create";

  const initialFormValue = useMemo(() => {
    let result =
      (isEdit || type === "view") && formValue
        ? {
            name: formValue.name,
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
            name: null,
            company: DEFAULT_FORM_VALUE.company,
            company_id: DEFAULT_FORM_VALUE.company_id,
            default: false,
            print_size: null,
            store: null,
            store_id: null,
            template: null,
            type: null,
          };
    return result;
  }, [isEdit, type, formValue]);

  const handleSubmitForm = () => {
    form.validateFields().then(() => {
      const formComponentValue = form.getFieldsValue();
      dispatch(actionCreatePrinter(formComponentValue));
    });
  };

  const handleEditorToolbarHeight = (height: number) => {
    setPreviewHeaderHeight(height);
  };

  useEffect(() => {
    if ((isEdit || type === "view") && formValue) {
      setHtmlContent(formValue.template);
      setSelectedPrintSize(formValue.print_size);
      form.setFieldsValue(initialFormValue);
      // setIsEditorLoad(true);
    }
  }, [form, formValue, initialFormValue, isEdit, type]);

  useEffect(() => {
    dispatch(
      getListStoresSimpleAction((data: StoreResponse[]) => {
        setListStores(data);
      })
    );
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      actionFetchListPrinterVariables((data: PrinterVariableResponseModel) => {
        setPrinterVariables(data);
      })
    );
  }, [dispatch]);

  return (
    <StyledComponent>
      <Form form={form} layout="vertical" initialValues={initialFormValue}>
        <Card
          style={{ padding: "20px 15px", marginBottom: 20, borderRadius: 12 }}
        >
          <Form.Item name="company" hidden>
            <Input type="text" />
          </Form.Item>
          <Form.Item name="company_id" hidden>
            <Input type="text" />
          </Form.Item>
          <Row gutter={20} className="sectionFilter">
            <Col span={5}>
              <Form.Item
                name="name"
                label="Tên mẫu in:"
                rules={[
                  { required: true, message: "Vui lòng nhập tên mẫu in" },
                ]}
              >
                <Input
                  type="text"
                  disabled={!isCanEditFormHeader}
                  placeholder="Điền tên mẫu in"
                />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item
                name="type"
                label="Chọn mẫu in:"
                rules={[{ required: true, message: "Vui lòng chọn mẫu in" }]}
              >
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
                  disabled={!isCanEditFormHeader}
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
            <Col span={5}>
              <Form.Item
                name="store_id"
                label="Chọn chi nhánh áp dụng:"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn chi nhánh áp dụng",
                  },
                ]}
              >
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
                  disabled={!isCanEditFormHeader}
                >
                  <Select.Option value={store_id_allShops}>
                    Tất cả cửa hàng
                  </Select.Option>
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
            <Col span={5}>
              <Form.Item
                name="print_size"
                label="Chọn khổ in:"
                rules={[{ required: true, message: "Vui lòng chọn khổ in" }]}
              >
                <Select
                  placeholder="Chọn khổ in"
                  allowClear
                  disabled={!isCanEditFormHeader}
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
            <Col span={4} className="columnActive">
              <Form.Item name="default" valuePropName="checked">
                <Checkbox disabled={!isCanEditFormHeader}>Áp dụng</Checkbox>
              </Form.Item>
            </Col>
          </Row>
        </Card>
        <Row gutter={20}>
          {isCanEditFormHeader && (
            <Col span={12}>
              <Card style={{ padding: "15px 15px", height: "100%" }}>
                <React.Fragment>
                  {(!isEdit || selectedPrintSize) && (
                    <Form.Item name="template">
                      <Editor
                        onChange={handleOnChangeEditor}
                        initialHtmlContent={htmlContent}
                        listKeywords={LIST_PRINTER_VARIABLES}
                        selectedPrintSize={selectedPrintSize}
                        previewHeaderHeight={handleEditorToolbarHeight}
                      />
                    </Form.Item>
                  )}
                </React.Fragment>
              </Card>
            </Col>
          )}
          <Col span={isCanEditFormHeader ? 12 : 24}>
            <Card style={{ padding: "15px 15px", height: "100%" }}>
              <div className="printContent" ref={componentRef}>
                <Preview
                  htmlContent={htmlContent}
                  listKeywords={LIST_PRINTER_VARIABLES}
                  listProductKeywords={LIST_PRINTER_PRODUCT_VARIABLES}
                  previewHeaderHeight={previewHeaderHeight}
                  isShowEditor={isShowEditor}
                  onChangeShowEditor={(isShow: boolean) => {
                    if (isShow) {
                      history.push(`${UrlConfig.PRINTER}/${id}?action=edit`);
                    }
                  }}
                />
              </div>
            </Card>
          </Col>
        </Row>
        {isCanEditFormHeader && (
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
        )}
      </Form>
    </StyledComponent>
  );
};

export default FormPrinter;
