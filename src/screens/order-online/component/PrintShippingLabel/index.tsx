import { Button } from "antd";
import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import IconPrint from "./images/iconPrint.svg";
import { StyledComponent } from "./styles";

type PropType = {};

const PrintShippingLabel: React.FC<PropType> = (props: PropType) => {
  const FAKE_PRINT_CONTENT = "<p>This is fake print content shipping label</p>";
  const printElementRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => printElementRef.current,
  });
  return (
    <StyledComponent>
      {handlePrint && (
        <React.Fragment>
          <Button
            onClick={(e) => {
              console.log("print");
              e.stopPropagation();
              handlePrint();
            }}
          >
            <img src={IconPrint} alt="" />
            In phiếu giao hàng
          </Button>
          <div style={{ display: "none" }}>
            <div className="printContent" ref={printElementRef}>
              <div
                dangerouslySetInnerHTML={{
                  __html: FAKE_PRINT_CONTENT,
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
