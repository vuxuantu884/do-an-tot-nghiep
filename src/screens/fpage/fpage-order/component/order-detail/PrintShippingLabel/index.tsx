import { Button } from "antd";
import { OrderSettingsModel } from "model/other/order/order-model";
import { FulFillmentResponse } from "model/response/order/order.response";
import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { FulFillmentStatus } from "utils/Constants";
import IconPrint from "./images/iconPrint.svg";
import { StyledComponent } from "./styles";

type PropType = {
  fulfillment: FulFillmentResponse | null | undefined;
  orderSettings?: OrderSettingsModel;
};

const PrintShippingLabel: React.FC<PropType> = (props: PropType) => {
  const { fulfillment, orderSettings } = props;
  const fake_printer_content = () => {
    return "<div class='test'><p class='testP'>This is fake print content shipping label</p><div>";
  };
  const printElementRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => printElementRef.current,
  });

  const renderHtml = (text: string) => {
    let result = text;
    let docFromText = new DOMParser().parseFromString(
      text,
      // "text/xml"
      "text/html"
    );
    let numberOfCopies = 1;
    if (orderSettings && orderSettings.cauHinhInNhieuLienHoaDon) {
      numberOfCopies = orderSettings.cauHinhInNhieuLienHoaDon;
    }
    let body = docFromText.getElementsByClassName("test")[0];
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

  return (
    <StyledComponent>
      {handlePrint && (
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
                  __html: renderHtml(fake_printer_content()),
                }}
              >
                {/* {renderHtml(fake_printer_content())} */}
              </div>
            </div>
          </div>
        </React.Fragment>
      )}
    </StyledComponent>
  );
};

export default PrintShippingLabel;
