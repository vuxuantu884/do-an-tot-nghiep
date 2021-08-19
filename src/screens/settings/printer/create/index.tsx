import { PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/UrlConfig";
import { Link } from "react-router-dom";
import FormPrinter from "../component/FormPrinter";
import { StyledComponent } from "./styles";

const SettingCreatePrinter: React.FC = () => {
  return (
    <StyledComponent>
      <ContentContainer
        title="Xử lý đơn hàng"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: UrlConfig.HOME,
          },
          {
            name: "Cài đặt",
            path: UrlConfig.ACCOUNTS,
          },
          {
            name: "Danh sách mẫu in",
            path: UrlConfig.PRINTER,
          },
          {
            name: "Thêm mới mẫu in",
          },
        ]}
      >
        <FormPrinter type="create" />
      </ContentContainer>
    </StyledComponent>
  );
};

export default SettingCreatePrinter;
