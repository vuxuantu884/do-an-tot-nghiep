import ContentContainer from "component/container/content.container"
import UrlConfig from "config/url.config";
import {StyledComponent} from './style';

const ImportProductScreen: React.FC = () => {
  return (
    <ContentContainer
      title="Nhập File"
      breadcrumb={[
        {
          name: "Tổng quản",
          path: UrlConfig.HOME,
        },
        {
          name: "Sản phẩm",
          path: `${UrlConfig.PRODUCT}`,
        },
        {
          name: "Nhập file",
        },
      ]}
    >
      <StyledComponent>

      </StyledComponent>
    </ContentContainer>
  )
};

export default ImportProductScreen;