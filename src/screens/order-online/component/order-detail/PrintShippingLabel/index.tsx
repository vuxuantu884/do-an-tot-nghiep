import { Button } from "antd";
import { OrderSettingsModel } from "model/other/order/order-model";
import { FulFillmentResponse } from "model/response/order/order.response";
import { PrintFormByOrderIdsResponseModel } from "model/response/printer.response";
import React, { useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { FulFillmentStatus } from "utils/Constants";
import IconPrint from "./images/iconPrint.svg";
import { StyledComponent } from "./styles";

type PropType = {
  fulfillment: FulFillmentResponse | null | undefined;
  orderSettings?: OrderSettingsModel;
  printForm?: PrintFormByOrderIdsResponseModel;
};

const PrintShippingLabel: React.FC<PropType> = (props: PropType) => {
  const { fulfillment, orderSettings, printForm } = props;
  let printContent = "";
  if (printForm && printForm[0]) {
    printContent = printForm[0].html_content;
  }
  const printerContentHtml = () => {
    return `<div class='printerContent'>${printContent}<div>`;
  };
  const printElementRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => printElementRef.current,
  });

  const isShowPrinterButton = () => {
    let isShow = true;
    const LIST_HIDE = [FulFillmentStatus.RETURNED, FulFillmentStatus.RETURNING];
    if (fulfillment?.status) {
      if (LIST_HIDE.includes(fulfillment?.status)) {
        isShow = false;
      }
    }
    return isShow;
  };

  const renderHtml = (text: string) => {
    if (text === "") {
      return "aaa";
    }
    let result = text;
    let docFromText = new DOMParser().parseFromString(
      text,
      // "text/xml"
      "text/html"
    );
    let numberOfCopies = 1;
    if (orderSettings && orderSettings.cauHinhInNhieuLienHoaDon) {
      // numberOfCopies = orderSettings.cauHinhInNhieuLienHoaDon;
      numberOfCopies = 1;
    }
    let body = docFromText.getElementsByClassName("printerContent")[0];
    let bodyInner = body.innerHTML;

    let groupCopies = [];
    for (let i = 1; i <= numberOfCopies; i++) {
      let textBreakPage = "<div class='pageBreak'></div>";
      groupCopies[i] = bodyInner + textBreakPage;
    }
    let groupCopiesHtml = groupCopies.join("");
    result = "<div>" + groupCopiesHtml + "</div>";
    return result;
  };

  useEffect(() => {
    console.log("333");

    const onAfterPrint = () => {
      console.log("Printing completed...");
    };
    //for chrome
    window.matchMedia("print").addListener(function (mql) {
      if (mql.matches) {
        onAfterPrint();
      }
    });
    window.addEventListener("beforeprint ", onAfterPrint);
    window.addEventListener("onafterprint", onAfterPrint);
    return () => {
      window.removeEventListener("beforeprint ", onAfterPrint);
      window.removeEventListener("onafterprint", onAfterPrint);
    };
  }, []);

  return (
    <StyledComponent>
      {handlePrint && isShowPrinterButton() && (
        <React.Fragment>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handlePrint();
            }}
          >
            <img src={IconPrint} alt="" />
            {fulfillment?.status === FulFillmentStatus.PACKED
              ? "In phiếu xuất kho"
              : "In phiếu giao hàng"}
          </Button>
          <div style={{ display: "none" }}>
            <div className="printContent" ref={printElementRef}>
              <div
                dangerouslySetInnerHTML={{
                  __html: renderHtml(printerContentHtml()),
                }}
              ></div>
            </div>
          </div>
        </React.Fragment>
      )}
    </StyledComponent>
  );
};

export default PrintShippingLabel;
