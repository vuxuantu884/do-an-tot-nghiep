import { FormPrinterModel } from "model/editor/editor.model";
import React, { useEffect, useState } from "react";
import FormPrinter from "../component/FormPrinter";
import { StyledComponent } from "./styles";

function SinglePrinter() {
  const FAKE_SINGLE_PRINTER_FORM: FormPrinterModel = {
    tenMauIn: "Đơn bán hàng 1",
    chiNhanhApDung: "YODY Kho tổng 1",
    khoIn: "Khổ in K80 (80x45 mm) 1",
    apDung: true,
    formIn: "{ten_cong_ty}{dia_chi_cong_ty}form1",
  };
  const [singlePrinterContent, setSinglePrinterContent] =
    useState<FormPrinterModel>({
      tenMauIn: "Đơn bán hàng 1",
      chiNhanhApDung: "YODY Kho tổng 1",
      khoIn: "Khổ in K80 (80x45 mm) 1",
      apDung: false,
      formIn: "",
    });

  useEffect(() => {
    setSinglePrinterContent(FAKE_SINGLE_PRINTER_FORM);
  }, []);
  return (
    <StyledComponent>
      <FormPrinter type="edit" formValue={singlePrinterContent} />
    </StyledComponent>
  );
}

export default SinglePrinter;
