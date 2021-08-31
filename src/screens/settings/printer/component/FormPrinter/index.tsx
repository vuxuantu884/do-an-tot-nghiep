import { Button, Card, Col, Form, Row } from "antd";
import Editor from "component/ckeditor";
import UrlConfig from "config/url.config";
import ModalConfirm from "component/modal/ModalConfirm";
import {
  actionCreatePrinter,
  actionFetchListPrinterVariables,
} from "domain/actions/printer/printer.action";
import { listKeywordsModel } from "model/editor/editor.model";
import {
  BasePrinterModel,
  FormPrinterModel,
  PrinterVariableResponseModel,
} from "model/response/printer.response";
import moment from "moment";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Prompt } from "react-router";
import { useHistory } from "react-router-dom";
import { DEFAULT_FORM_VALUE } from "utils/Constants";
import Preview from "../preview";
import FormTop from "./FormTop";
import { StyledComponent } from "./styles";

type PropType = {
  id?: string;
  type?: FormPrinterModel;
  formValue?: BasePrinterModel;
};

const FormPrinter: React.FC<PropType> = (props: PropType) => {
  const { id, type, formValue } = props;
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const isEdit = type === "edit" ? true : false;
  const [htmlContent, setHtmlContent] = useState("");
  const isShowEditor = isEdit || type === "create";
  const [previewHeaderHeight, setPreviewHeaderHeight] = useState(108);
  const [selectedPrintSize, setSelectedPrintSize] = useState("");
  const componentRef = useRef(null);
  const history = useHistory();

  const [printerVariables, setPrinterVariables] =
    useState<PrinterVariableResponseModel>({});

  const positionProductVariables = 1;

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

  const PRODUCTS_VARIABLES = {
    name: "Thông tin sản phẩm",
    list: printerVariables.print_product_variable,
  };

  const LIST_PRINTER_VARIABLES_ADD_PRODUCTS_VARIABLES = [
    ...LIST_PRINTER_VARIABLES.slice(0, positionProductVariables),
    PRODUCTS_VARIABLES,
    ...LIST_PRINTER_VARIABLES.slice(positionProductVariables),
  ];

  const [isShowModalConfirm, setIsShowModalConfirm] = useState(false);
  const [isShowPrompt, setIsShowPrompt] = useState(false);
  const titleConfirmSave = "Bạn có chắc chắn muốn thoát?";
  const subTitleConfirmSave =
    "Toàn bộ thay đổi của bạn sẽ không được ghi nhận.";

  const handleOnChangeEditor = (value: string) => {
    setHtmlContent(value);
  };

  if (
    printerVariables.print_product_variable &&
    printerVariables.print_product_variable.length
  ) {
    for (let i = 0; i < printerVariables.print_product_variable.length; i++) {
      // printerVariables.print_product_variable[i].preview_value_format  = [
      //   "vd1",
      //   "vd2",
      // ];
      if (!printerVariables.print_product_variable[i].preview_value_format) {
        printerVariables.print_product_variable[i].preview_value_format = [
          printerVariables.print_product_variable[i].preview_value,
        ];
      }
    }
  }
  const LIST_PRINTER_PRODUCT_VARIABLES_zzz = {
    name: "Thông tin sản phẩm",
    list: printerVariables.print_product_variable,
  };

  const LIST_PRINTER_PRODUCT_VARIABLES = LIST_PRINTER_PRODUCT_VARIABLES_zzz;

  const isCanEditFormHeader = isShowEditor;

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
      // console.log("formValue.template", formValue?.template);
      // console.log("formComponentValue", formComponentValue);
      let newFormComponentValue = {
        ...formComponentValue,
      };
      if (formValue?.name === formComponentValue.name) {
        /**
         * thay tên theo ngày tháng
         */
        newFormComponentValue = {
          ...formComponentValue,
          name: `${formComponentValue.name}-${moment().format(
            "D/M/YYYY,H:mm:ss"
          )}`,
        };
      }
      // formComponentValue.
      dispatch(
        actionCreatePrinter(newFormComponentValue, () => {
          history.push(UrlConfig.PRINTER);
        })
      );
    });
  };

  const handleClickExit = () => {
    const formComponentValue = form.getFieldsValue();
    if (formValue?.template === formComponentValue.template) {
      history.push(UrlConfig.PRINTER);
    } else {
      setIsShowModalConfirm(true);
    }
  };

  const handleEditorToolbarHeight = (height: number) => {
    console.log("height", height);
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
      actionFetchListPrinterVariables((data: PrinterVariableResponseModel) => {
        setPrinterVariables(data);
      })
    );
  }, [dispatch]);

  const formComponentValue = form.getFieldsValue();

  useEffect(() => {
    const onChangePage = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    if (type === "edit") {
      if (formValue?.template !== formComponentValue.template) {
        setIsShowPrompt(true);
        window.addEventListener("beforeunload", onChangePage);
      } else {
        setIsShowPrompt(false);
      }
    }
    return () => {
      window.removeEventListener("beforeunload", onChangePage);
    };
  }, [form, formComponentValue.template, formValue?.template, type]);

  return (
    <StyledComponent>
      <Form form={form} layout="vertical" initialValues={initialFormValue}>
        <FormTop isCanEditFormHeader={isCanEditFormHeader} />
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
                        // listKeywords={LIST_PRINTER_VARIABLES}
                        listKeywords={
                          LIST_PRINTER_VARIABLES_ADD_PRODUCTS_VARIABLES
                        }
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
            <Button
              onClick={() => {
                handleClickExit();
              }}
            >
              Thoát
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
      <ModalConfirm
        onCancel={() => {
          setIsShowModalConfirm(false);
        }}
        onOk={() => {
          history.push(UrlConfig.PRINTER);
        }}
        title={titleConfirmSave}
        subTitle={subTitleConfirmSave}
        visible={isShowModalConfirm}
      />
      {isShowPrompt && (
        <Prompt message="Bạn có chắc chắn muốn thoát? Toàn bộ thay đổi của bạn sẽ không được ghi nhận." />
      )}
    </StyledComponent>
  );
};

export default FormPrinter;
