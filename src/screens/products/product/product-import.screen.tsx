import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config"

const ProductImportScreen: React.FC = () => {
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

    </ContentContainer>
  )
}

export default ProductImportScreen;
