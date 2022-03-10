import React from "react";
import { Card, Row, Space } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import PackReportHandOver from "./pack/info/pack-report-hand-over";
import { useQuery } from "utils/useQuery";
import { StyledComponent } from "./pack/styles";
import useAuthorization from "hook/useAuthorization";
import { ODERS_PERMISSIONS } from "config/permissions/order.permission";
import ButtonCreate from "component/header/ButtonCreate";
// import './pack/styles.scss';

const PackSupportScreen: React.FC = () => {
  const query = useQuery();

  const [allowCreateGoodsReceipt] = useAuthorization({
    acceptPermissions: [ODERS_PERMISSIONS.CREATE_GOODS_RECEIPT],
    not: false,
  });

  return (
    <ContentContainer
      title="Biên bản bàn giao"
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
          name: "Biên bản bàn giao",
        },
      ]}
      extra={
        <Row>
          <Space size={12} style={{marginLeft: "10px"}}>
            <ButtonCreate
              size="small" 
              path={`${UrlConfig.DELIVERY_RECORDS}/report-hand-over-create`}
              disabled={!allowCreateGoodsReceipt}
            />
          </Space>
        </Row>
      }
    >
      <StyledComponent>
        <Card>
          <PackReportHandOver query={query} />
        </Card>
      </StyledComponent>

    </ContentContainer>
  );
};

export default PackSupportScreen;
