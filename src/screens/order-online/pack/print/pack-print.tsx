import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { useRef, useState } from "react";
import {StyledComponent} from "../../print/styles";
import purify from "dompurify";

const PackPrint:React.FC=()=>{
    // const pageBreak = "<div class='pageBreak'></div>";
  const [printContent] = useState("");
  // const dispatch = useDispatch();
  const printElementRef = useRef(null);

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
            path: UrlConfig.PACK_SUPPORT,
          },
          {
            name: "Hỗ trợ đóng gói",
            path: UrlConfig.PACK_SUPPORT,
          },
          {
            name: "Mẫu in biên bản bàn giao",
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

export default PackPrint;