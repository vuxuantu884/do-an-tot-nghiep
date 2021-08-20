import ContentContainer from "component/container/content.container";
import UrlConfig from "config/UrlConfig";
import { FormValueModel } from "model/editor/editor.model";
import React, { useEffect, useState } from "react";
import FormPrinter from "../component/FormPrinter";
import { StyledComponent } from "./styles";

function SinglePrinter() {
  const [singlePrinterContent, setSinglePrinterContent] =
    useState<FormValueModel>({
      tenMauIn: "",
      chiNhanhApDung: "",
      khoIn: "",
      apDung: false,
      formIn: "",
    });

  useEffect(() => {
    const FAKE_SINGLE_PRINTER_FORM: FormValueModel = {
      tenMauIn: "Đơn bán hàng 2",
      chiNhanhApDung: "YODY Kho tổng 2",
      khoIn: "Khổ in K80 (80x45 mm) 2",
      apDung: true,
      formIn: "{ten_cong_ty}{dia_chi_cong_ty}form2",
    };
    setSinglePrinterContent(FAKE_SINGLE_PRINTER_FORM);
  }, []);
  return (
    <StyledComponent>
      <ContentContainer
        title="Chi tiết mẫu in"
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
            name: "Mẫu in 1",
          },
        ]}
      >
        <FormPrinter type="edit" formValue={singlePrinterContent} />
      </ContentContainer>
    </StyledComponent>
  );
}

export default SinglePrinter;
