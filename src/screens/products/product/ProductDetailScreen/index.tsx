import { Button, Card, Col, List, Row, Switch } from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { useCallback, useEffect } from "react";
import { useHistory } from "react-router";
import { StyledComponent } from "./styles";

const ProductDetailScreen: React.FC = () => {
  const history = useHistory();
  const onEdit = useCallback(() => {
    history.push(`${UrlConfig.PRODUCT}/23/edit`);
  }, [history]);

  useEffect(() => {
    return () => {};
  }, []);
  return (
    <StyledComponent>
      <ContentContainer
        title="Chi tiết sản phẩm"
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
        <Row gutter={24}>
          <Col span={24} md={18}>
            <Card title="Thông tin sản phẩm" className="card">
              <div className="padding-20"></div>
            </Card>
          </Col>
          <Col span={24} md={6}>
            <Card title="Ảnh" className="card">
              <div className="padding-20"></div>
            </Card>
            <Card title="Phòng win" className="card">
              <div className="padding-20"></div>
            </Card>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24}>
            <Card className="card">
              <Row className="card-container">
                <Col className="left" span={24} md={6}>
                  <List 
                    header={
                      <div>

                      </div>
                    }
                  />
                </Col>
                <Col className="right" span={24} md={18}>
                  <div className="header-view">
                    <div className="header-view-left">
                     <b>THÔNG TIN SẢN PHẨM</b>
                    </div>
                    <div className="header-view-right">
                      <Switch />
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
        <BottomBarContainer
          back="Quay lại sản phẩm"
          rightComponent={<Button onClick={onEdit}>Chỉnh sửa thông tin</Button>}
        />
      </ContentContainer>
    </StyledComponent>
  );
};

export default ProductDetailScreen;
