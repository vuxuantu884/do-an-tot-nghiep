import {Button} from "antd";
import {actionFetchPrintFormByOrderIds} from "domain/actions/printer/printer.action";
import purify from "dompurify";
import {OrderSettingsModel} from "model/other/order/order-model";
import {FulFillmentResponse} from "model/response/order/order.response";
import React, {useEffect, useRef, useState} from "react";
import {useDispatch} from "react-redux";
import {useReactToPrint} from "react-to-print";
import {FulFillmentStatus} from "utils/Constants";
import {LIST_PRINTER_TYPES} from "utils/Printer.constants";
import IconPrint from "./images/iconPrint.svg";
import {StyledComponent} from "./styles";

type PropTypes = {
  fulfillment: FulFillmentResponse | null | undefined;
  orderSettings?: OrderSettingsModel;
  orderId?: number;
  onPrint?: () => void;
};

function PrintShippingLabel(props: PropTypes): JSX.Element {
  const {fulfillment, orderId, onPrint} = props;
  const dispatch = useDispatch();
  const [printContent, setPrintContent] = useState("");
  const printerContentHtml = () => {
    return `<div class='printerContent'>${printContent}<div>`;
  };
  const printElementRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => printElementRef.current,
    onAfterPrint: () => {
      onPrint && onPrint();
    },
  });

  let printType = "";
  const getPrintType = (fulfillment: FulFillmentResponse | null | undefined) => {
    if (!fulfillment) {
      return;
    }
    switch (fulfillment.status) {
      case FulFillmentStatus.UNSHIPPED:
        printType = LIST_PRINTER_TYPES.shipment;
        break;
      case FulFillmentStatus.PICKED:
        printType = LIST_PRINTER_TYPES.shipment;
        break;
      case FulFillmentStatus.PACKED:
        printType = LIST_PRINTER_TYPES.stock_export;
        break;
      default:
        printType = LIST_PRINTER_TYPES.order;
        break;
    }
  };
  getPrintType(fulfillment);
  const isShowPrinterButton = () => {
    let isShow = true;
    const LIST_HIDE = [
      FulFillmentStatus.RETURNED,
      FulFillmentStatus.RETURNING,
      FulFillmentStatus.PICKED,
    ];
    if (fulfillment?.status) {
      if (LIST_HIDE.includes(fulfillment?.status)) {
        isShow = false;
      }
    }
    return isShow;
  };

  const renderHtml = (text: string) => {
    if (text === "") {
      return "";
    }
    let result = text;
    // let docFromText = new DOMParser().parseFromString(
    //   text,
    //   // "text/xml"
    //   "text/html"
    // );
    // let numberOfCopies = 1;
    // if (orderSettings && orderSettings.cauHinhInNhieuLienHoaDon) {
    //   // numberOfCopies = orderSettings.cauHinhInNhieuLienHoaDon;
    //   numberOfCopies = 1;
    // }
    // let body = docFromText.getElementsByClassName("printerContent")[0];
    // let bodyInner = body.innerHTML;

    // if (numberOfCopies > 1) {
    //   let groupCopies = [];
    //   for (let i = 1; i <= numberOfCopies; i++) {
    //     let textBreakPage = "<div class='pageBreak'></div>";
    //     groupCopies[i] = bodyInner + textBreakPage;
    //   }
    //   let groupCopiesHtml = groupCopies.join("");
    //   result = "<div>" + groupCopiesHtml + "</div>";
    // }
    return result;
  };

  useEffect(() => {
    const onAfterPrint = () => {
      alert("Printing completed...");
    };
    //for chrome
    if (window.matchMedia) {
      var mediaQueryList = window.matchMedia("print");
      mediaQueryList.addListener(function (mql) {
        if (mql.matches) {
          onAfterPrint();
        } else {
          onAfterPrint();
        }
      });
    }
    window.addEventListener("beforeprint ", onAfterPrint);
    window.addEventListener("onafterprint", onAfterPrint);
    return () => {
      window.removeEventListener("beforeprint ", onAfterPrint);
      window.removeEventListener("onafterprint", onAfterPrint);
    };
  }, []);

  return (
    <StyledComponent>
      {orderId && handlePrint && isShowPrinterButton() && (
        <React.Fragment>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              dispatch(
                actionFetchPrintFormByOrderIds([orderId], printType, (response) => {
                  //xóa thẻ p thừa
                  let textResponse = response.data[0].html_content;
                  let result = textResponse.replaceAll("<p></p>", "");
                  setPrintContent(result);
                  handlePrint();
                })
              );
            }}
          >
            <img src={IconPrint} alt="" />
            {fulfillment?.status === FulFillmentStatus.PACKED
              ? "In phiếu xuất kho"
              : "In phiếu giao hàng"}
          </Button>
          <div style={{display: "none"}}>
            <div className="printContent333" ref={printElementRef}>
              <div
                dangerouslySetInnerHTML={{
                  // __html: renderHtml(printerContentHtml()),
                  __html: purify.sanitize(renderHtml(printerContentHtml())),
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
