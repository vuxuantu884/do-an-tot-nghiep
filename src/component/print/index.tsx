import React, { useEffect, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { StyledComponent } from "./style";

type Props = {
  htmlContent?: string | string[] | null;
  setHtmlContent?: (v: string | string[]) => void;
};

var pageBreak = "<div class='pageBreak'></div>";

const PrintComponent: React.FC<Props> = (props: Props) => {
  const { htmlContent, setHtmlContent } = props;
  const printElementRef = React.useRef(null);
  const [printContent, setPrintContent] = useState("");

  const handlePrint = useReactToPrint({
    content: () => printElementRef.current,
  });
  useEffect(() => {
    if (htmlContent) {
      if (!Array.isArray(htmlContent)) {
        setPrintContent(htmlContent);
      } else {
        const textResponse = htmlContent.map((single: any) => {
          return `<div class='singleOrderPrint'>${single}</div>`;
        });

        let textResponseFormatted = textResponse.join(pageBreak);
        //xóa thẻ p thừa
        let result = textResponseFormatted.replaceAll("<p></p>", "");
        setPrintContent(result);
      }
      if (handlePrint) {
        handlePrint();
      }
    }

    setTimeout(() => {
      return setHtmlContent && setHtmlContent("");
    }, 500);
  }, [setHtmlContent, handlePrint, htmlContent]);

  return (
    <React.Fragment>
      <StyledComponent>
        <div style={{ display: "none" }}>
          <div className="printContent" ref={printElementRef}>
            <div
              dangerouslySetInnerHTML={{
                __html: printContent,
              }}
            ></div>
          </div>
        </div>
      </StyledComponent>
    </React.Fragment>
  );
};

export default PrintComponent;
