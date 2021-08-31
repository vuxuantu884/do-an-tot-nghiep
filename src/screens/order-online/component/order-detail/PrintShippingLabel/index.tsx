import { Button } from "antd";
import { actionFetchPrintFormByOrderIds } from "domain/actions/printer/printer.action";
import { OrderSettingsModel } from "model/other/order/order-model";
import { RootReducerType } from "model/reducers/RootReducerType";
import { FulFillmentResponse } from "model/response/order/order.response";
import { PrintFormByOrderIdsResponseModel } from "model/response/printer.response";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import { FulFillmentStatus } from "utils/Constants";
import IconPrint from "./images/iconPrint.svg";
import { StyledComponent } from "./styles";

type PropType = {
  fulfillment: FulFillmentResponse | null | undefined;
  orderSettings?: OrderSettingsModel;
  orderId?: number;
};

const PrintShippingLabel: React.FC<PropType> = (props: PropType) => {
  const { fulfillment, orderSettings, orderId } = props;
  console.log("orderId", orderId);
  const dispatch = useDispatch();
  const [printContent, setPrintContent] = useState("");
  const printerContentHtml = () => {
    return `<div class='printerContent'>${printContent}<div>`;
  };
  const printElementRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => printElementRef.current,
  });

  const bootstrapReducer = useSelector(
    (state: RootReducerType) => state.bootstrapReducer
  );

  // const LIST_PRINTYPE = bootstrapReducer.data?.print_type

  let printType = "";
  const getPrintType = (
    fulfillment: FulFillmentResponse | null | undefined
  ) => {
    if (!fulfillment) {
      return;
    }
    switch (fulfillment.status) {
      case "shipping":
        printType = "shipment";
        break;
      case "shipped":
        printType = "order";
        break;
      default:
        break;
    }
  };
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

  useEffect(() => {
    getPrintType(fulfillment);
  });

  return (
    <StyledComponent>
      {orderId && handlePrint && isShowPrinterButton() && (
        <React.Fragment>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              dispatch(
                actionFetchPrintFormByOrderIds(
                  [orderId],
                  printType,
                  (response) => {
                    setPrintContent(response.data[0].html_content);
                    handlePrint();
                  }
                )
              );
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
