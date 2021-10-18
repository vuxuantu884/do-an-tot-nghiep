import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { actionFetchPrintFormByInventoryTransferIds } from "domain/actions/printer/printer.action";
import purify from "dompurify";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useReactToPrint } from "react-to-print";
import { useQuery } from "utils/useQuery";
import { StyledComponent } from "./styles";

function PrintTicket() {
  const pageBreak = "<div class='pageBreak'></div>";
  const [printContent, setPrintContent] = useState("");
  const dispatch = useDispatch();
  const printElementRef = useRef(null);
  const query = useQuery();
  const queryIds = query.get("ids")?.split(",") || null;
  const queryPrintType = query.get("type");
  const handlePrint = useReactToPrint({
    content: () => printElementRef.current,
  });

  useEffect(() => {    
    if (queryIds && handlePrint && queryPrintType) {
      const queryIdsFormatted = queryIds.map((single) => +single);
      dispatch(
        actionFetchPrintFormByInventoryTransferIds(
          queryIdsFormatted,
          queryPrintType,
          (response) => {
            const textResponse = response.map((single) => {
              return (
                "<div class='singleOrderPrint'>" +
                single.html_content +
                "</div>"
              );
            });
            let textResponseFormatted = textResponse.join(pageBreak);
            //xóa thẻ p thừa
            let result = textResponseFormatted.replaceAll("<p></p>", "");
            setPrintContent(result);
            handlePrint();
          }
        )
      );
    } else {
      setPrintContent("Có lỗi! Vui lòng kiểm tra lại.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dispatch,
    queryPrintType,
  ]);

  return (
    <StyledComponent>
      <ContentContainer
        title="Mẫu in đơn hàng"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: UrlConfig.HOME,
          },
          {
            name: "Đơn hàng",
            path: UrlConfig.INVENTORY_TRANSFER,
          },
          {
            name: "Mẫu in phiếu",
          },
        ]}
      >
        <div className="printContent" ref={printElementRef}>
          <div
            dangerouslySetInnerHTML={{
              __html: purify.sanitize(printContent),
            }}
          ></div>
        </div>
      </ContentContainer>
    </StyledComponent>
  );
}

export default PrintTicket;
