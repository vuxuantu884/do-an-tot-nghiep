import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Row, Select } from "antd";
import Checkbox from "antd/lib/checkbox/Checkbox";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/UrlConfig";
import { listKeyWordsModel } from "model/editor/editor.model";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import CkEditor from "./ckeditor";
import Preview from "./preview";
import ReactToPrint from "react-to-print";
import { StyledComponent } from "./styles";
import FormPrinter from "../component/FormPrinter";

const SettingCreatePrinter: React.FC = () => {
  const [form] = Form.useForm();
  const initialHtmlContent = "{ten_cong_ty}{dia_chi_cong_ty}{dia_chi_cong_ty}";
  const [htmlContent, setHtmlContent] = useState(initialHtmlContent);
  const componentRef = useRef(null);

  const handleOnChange = (value: string) => {
    console.log("value", value);
    setHtmlContent(value);
  };

  const handlePrint = () => {
    console.log("print");
    var content = document.getElementById("divcontents");
    const abc = document.getElementById(
      "ifmcontentstoprint"
    ) as HTMLIFrameElement;
    var pri = null;
    if (abc) {
      pri = abc.contentWindow;
    }
    console.log("abc", abc);
    console.log("content", content);
    console.log("pri", pri);
    if (content && pri) {
      pri.document.open();

      pri.document.write(content.innerHTML);
      pri.document.close();
      pri.focus();
      pri.print();
    }
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
        <FormPrinter type="create" />
      </ContentContainer>
    </StyledComponent>
  );
};

export default SettingCreatePrinter;
