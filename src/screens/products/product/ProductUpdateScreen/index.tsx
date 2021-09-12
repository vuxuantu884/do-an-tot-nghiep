import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { useEffect } from "react";
import { StyledComponent } from "./styles";

const ProductDetailScreen: React.FC = () => {
  useEffect(() => {
    
    return () => {
    }
  }, [])
  return (
    <StyledComponent>
      <ContentContainer
        title="Sửa thông tin sản phẩm"
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
            name: "",
          },
        ]}
      >
        
      </ContentContainer>
    </StyledComponent>
  );
};


export default ProductDetailScreen;