import {Button, Card, Col, Form, Row, Space} from "antd";
import Editor from "component/ckeditor";
import BottomBarContainer from "component/container/bottom-bar.container";
import ModalConfirm, { ModalConfirmProps } from "component/modal/ModalConfirm";
import { PrintPermissions } from "config/permissions/setting.permisssion";
import UrlConfig from "config/url.config";
import {
  actionCreatePrinter,
  actionFetchListPrinterVariables,
} from "domain/actions/printer/printer.action";
import useAuthorization from "hook/useAuthorization";
import {listKeywordsModel} from "model/editor/editor.model";
import {
  BasePrinterModel,
  FormPrinterModel,
  PrinterVariableResponseModel,
} from "model/response/printer.response";
import React, {useEffect, useMemo, useRef, useState} from "react";
import {useDispatch} from "react-redux";
import {Prompt} from "react-router";
import {useHistory} from "react-router-dom";
import {DEFAULT_COMPANY} from "utils/Constants";
import FormFilter from "../FormFilter";
import Preview from "../preview";
import {StyledComponent} from "./styles";

type PropType = {
  id?: string;
  type?: FormPrinterModel;
  isPrint?: boolean;
  formValue?: BasePrinterModel;
};

const FormPrinter: React.FC<PropType> = (props: PropType) => {
  const {id, type, formValue, isPrint} = props;
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const isEdit = type === "edit" ? true : false;
  const [htmlContent, setHtmlContent] = useState("");
  const isShowEditor = isEdit || type === "create";
  const [previewHeaderHeight, setPreviewHeaderHeight] = useState(108);
  const [selectedPrintSize, setSelectedPrintSize] = useState("");
  const componentRef = useRef(null);
  const history = useHistory();
  
  const [modalConfirm, setModalConfirm] = useState<ModalConfirmProps>({
    visible: false,
  });
  const [dataOrigin, setDataOrigin] = useState<FormPrinterModel>();

  const [allowCreatePrint] = useAuthorization({
    acceptPermissions: [PrintPermissions.CREATE],
  }); 

  const [printerVariables, setPrinterVariables] = useState<PrinterVariableResponseModel>(
    {}
  );

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
    {
      name: "Thông tin nhập hàng",
      list: printerVariables.print_purchase_order,
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
  const subTitleConfirmSave = "Toàn bộ thay đổi của bạn sẽ không được ghi nhận.";

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
            is_default: formValue.is_default,
            print_size: formValue.print_size,
            store: formValue.store,
            store_id: formValue.store_id,
            template: formValue.template,
            type: formValue.type,
          }
        : {
            name: null,
            company: DEFAULT_COMPANY.company,
            company_id: DEFAULT_COMPANY.company_id,
            is_default: false,
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
      let newFormComponentValue = {
        ...formComponentValue,
      };
      setIsShowPrompt(false);
      // formComponentValue.
      dispatch(
        actionCreatePrinter(newFormComponentValue, () => {
          history.push(UrlConfig.PRINTER);
        })
      );
    });
  }; 

  const handleEditorToolbarHeight = (height: number) => {
    setPreviewHeaderHeight(height);
  };

  const backAction = ()=>{  
    if (JSON.stringify(form.getFieldsValue()) !== JSON.stringify(dataOrigin)) {
      setModalConfirm({
        visible: true,
        onCancel: () => {
          setModalConfirm({visible: false});
        },
        onOk: () => { 
          history.push(UrlConfig.PRINTER);
          setIsShowPrompt(false);
        },
        title: "Bạn có muốn quay lại?",
        subTitle:
          "Sau khi quay lại thay đổi sẽ không được lưu.",
      }); 
    }else{
      history.push(UrlConfig.PRINTER);
      setIsShowPrompt(false);
    }
  };

  useEffect(() => {
    if ((isEdit || type === "view") && formValue) {
      setHtmlContent(formValue.template);
      setSelectedPrintSize(formValue.print_size);
      form.setFieldsValue(initialFormValue);
      setDataOrigin(form.getFieldsValue());
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

  const formValueFormatted = {
    company: formValue?.company,
    company_id: formValue?.company_id,
    is_default: formValue?.is_default,
    name: formValue?.name,
    print_size: formValue?.print_size,
    store_id: formValue?.store_id,
    template: formValue?.template,
    type: formValue?.type,
  };

  const handleChange = (value: any, allValues: any) => {
    // if (JSON.stringify(formValue) !== JSON.stringify(allValues)) {
    if (
      Object.entries(formValueFormatted).sort().toString() ===
      Object.entries(allValues).sort().toString()
    ) {
      setIsShowPrompt(false);
    } 
    // else {
    //   setIsShowPrompt(true);
    // }
  };

  useEffect(() => {
    const onChangePage = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    // check if is loaded successfully
    if (type === "edit") {
      if (isShowPrompt) {
        window.addEventListener("beforeunload", onChangePage);
      }
    } else {
      setIsShowPrompt(false);
    }
    return () => {
      window.removeEventListener("beforeunload", onChangePage);
    };
  }, [isShowPrompt, type]);

  return (
    <StyledComponent>
      <Form
        form={form}
        layout="vertical"
        initialValues={initialFormValue}
        className={isEdit ? "isEditForm" : ""}
        onValuesChange={handleChange}
      >
        <Card>
          <FormFilter
            isCanEditFormHeader={isCanEditFormHeader}
            isPagePrinterDetail={true}
          />
        </Card>
        <Row gutter={20}>
          {isCanEditFormHeader && (
            <Col span={12}>
              <Card style={{height: "100%"}}>
                <React.Fragment>
                  {(!isEdit || selectedPrintSize) && (
                    <Form.Item name="template">
                      <Editor
                        onChange={handleOnChangeEditor}
                        initialHtmlContent={htmlContent}
                        listKeywords={LIST_PRINTER_VARIABLES_ADD_PRODUCTS_VARIABLES}
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
            <Card style={{padding: "15px 15px", height: "100%"}}>
              <div className="printContent" ref={componentRef}>
                <Preview
                  isPrint={isPrint}
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
          <BottomBarContainer
            back="Quay lại danh sách"
            backAction={backAction}
            rightComponent={
              <Space>
                {allowCreatePrint && <Button  onClick={() => {
                  handleSubmitForm();
                }} type="primary">
                  {isEdit ? "Lưu lại" : "Tạo mẫu in"}
                  </Button> }
              </Space>
            }
          /> 
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
      
      <ModalConfirm {...modalConfirm} />
    </StyledComponent>
  );
};

export default FormPrinter;
