import "assets/css/_printer.scss";
import BaseResponse from "base/base.response";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import purify from "dompurify";
import { RootReducerType } from "model/reducers/RootReducerType";
import { PrintFormByOrderIdsResponseModel } from "model/response/printer.response";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import { getEcommerceOrdersPrintFormService } from "service/ecommerce/ecommerce.service";
import { handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";
import { useQuery } from "utils/useQuery";
import { StyledComponent } from "./styles";

const printType = {
  shipment: "shipment",
};

type PropType = {};

function EcommercePrint(props: PropType) {
  const pageBreak = "<div class='pageBreak'></div>";
  const [printContent, setPrintContent] = useState("");
  const dispatch = useDispatch();
  const printElementRef = useRef(null);
  const bootstrapReducer = useSelector((state: RootReducerType) => state.bootstrapReducer);
  const query = useQuery();
  // const queryIds = query.getAll("ids[]");
  const queryIds: any = query.get("ids")?.split(",") || null;

  const queryAction = query.get("action");
  const queryPrintDialog = query.get("print-dialog");
  const queryPrintType = query.get("print-type");
  const queryPackType = query.get("pack-type");
  const listPrinterTypes = bootstrapReducer.data?.print_type;
  const handlePrint = useReactToPrint({
    content: () => printElementRef.current,
    onAfterPrint: () => {
      setTimeout(() => {
        window.close();
      }, 500);
    },
  });

  const handlePrintIfGetData = (response: BaseResponse<PrintFormByOrderIdsResponseModel>) => {
    if (!response || response.data?.length === 0) {
      return null;
    }
    const textResponse = response.data.map((single) => {
      return "<div class='singleOrderPrint'>" + single.html_content + "</div>";
    });

    let textResponseFormatted = textResponse.join(pageBreak);
    //xóa thẻ p thừa
    let result = textResponseFormatted.replaceAll("<p></p>", "");
    setPrintContent(result);
    handlePrint();
  };

  useEffect(() => {
    dispatch(showLoading());
    if (queryPrintType && queryPrintType === printType.shipment) {
      if (queryIds && queryIds.length > 0) {
        getEcommerceOrdersPrintFormService(queryIds, queryPrintType).then((response) => {
          if (isFetchApiSuccessful(response)) {
            handlePrintIfGetData(response);
          } else {
            handleFetchApiError(response, "In phiếu giao hàng", dispatch);
          }
          dispatch(hideLoading());
        });
      }
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
    queryPackType,
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

export default EcommercePrint;
