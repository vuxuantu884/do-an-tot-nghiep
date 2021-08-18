import { PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/UrlConfig";
import { Link } from "react-router-dom";
import FormPrinter from "../component/FormPrinter";
import { StyledComponent } from "./styles";

const SettingCreatePrinter: React.FC = () => {
  const createPrinterHtml = () => {
    return (
      <Link to={`${UrlConfig.PRINTER}/create`}>
        <Button
          type="primary"
          className="ant-btn-primary"
          size="large"
          onClick={() => {}}
          icon={<PlusOutlined />}
        >
          Thêm mẫu in
        </Button>
      </Link>
    );
  };

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
        extra={createPrinterHtml()}
      >
        <FormPrinter type="create" />
      </ContentContainer>
    </StyledComponent>
  );
};

export default SettingCreatePrinter;
