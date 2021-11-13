import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { actionFetchPrintFormByOrderIds } from "domain/actions/printer/printer.action";
import purify from "dompurify";
import { RootReducerType } from "model/reducers/RootReducerType";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import { useQuery } from "utils/useQuery";
import { StyledComponent } from "./styles";

type PropType = {};

function OrderPrint(props: PropType) {
  const pageBreak = "<div class='pageBreak'></div>";
  const [printContent, setPrintContent] = useState("");
  const dispatch = useDispatch();
  const printElementRef = useRef(null);
  const bootstrapReducer = useSelector(
    (state: RootReducerType) => state.bootstrapReducer
  );
  const query = useQuery();
  // const queryIds = query.getAll("ids[]");
  const queryIds = query.get("ids")?.split(",") || null;

  const queryAction = query.get("action");
  const queryPrintDialog = query.get("print-dialog");
  const queryPrintType = query.get("print-type");
  const listPrinterTypes = bootstrapReducer.data?.print_type;
  const handlePrint = useReactToPrint({
    content: () => printElementRef.current,
  });

  useEffect(() => {
    const isValidatePrintType = () => {
      let result = false;
      let resultFilter = listPrinterTypes?.some((single) => {
        return single.value === queryPrintType;
      });
      if (resultFilter) {
        result = true;
      }
      return result;
    };
    const isCanPrint =
      queryIds &&
      queryPrintType &&
      queryPrintDialog &&
      queryAction &&
      queryAction === "print" &&
      queryPrintDialog === "true" &&
      isValidatePrintType();
    if (queryIds && isCanPrint && handlePrint && queryPrintType) {
      const queryIdsFormatted = queryIds.map((single) => +single);
      dispatch(
        actionFetchPrintFormByOrderIds(
          queryIdsFormatted,
          queryPrintType,
          (response) => {
            const textResponse = response.data.map((single) => {
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
    // remove handlePrint and queryIds to prevent re-rendering
    dispatch,
    // handlePrint,
    listPrinterTypes,
    queryAction,
    // queryIds,
    queryPrintDialog,
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
            path: UrlConfig.ORDER,
          },
          {
            name: "Mẫu in đơn hàng",
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

export default OrderPrint;
