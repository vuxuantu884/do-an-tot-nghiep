import { Card } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import React from "react";
import BottomBar from "../BottomBar";
import SingleLogisticCardHeader from "../CardHeader";
import { StyledComponent } from "./styles";

type PropType = {
  logoSingleThirdPartyLogistic?: string;
  nameSingleThirdPartyLogistic?: string;
  onSubmit: () => void;
  onConnect: () => void;
  onCancelConnect: () => void;
  isConnected: boolean;
  urlGuide: string;
  children: React.ReactElement;
};

function SingleThirdPartyLogisticLayout(props: PropType) {
  const {
    logoSingleThirdPartyLogistic,
    nameSingleThirdPartyLogistic,
    onSubmit,
    onConnect,
    onCancelConnect,
    isConnected,
    urlGuide,
  } = props;
  const renderCardTitle = () => {
    return (
      <SingleLogisticCardHeader
        title={nameSingleThirdPartyLogistic}
        logoUrl={logoSingleThirdPartyLogistic}
        urlGuide={urlGuide}
      />
    );
  };
  return (
    <StyledComponent>
      <ContentContainer
        title="Chỉnh sửa Kết nối hãng vận chuyển"
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
            name: "Kết nối hãng vận chuyển",
            path: UrlConfig.THIRD_PARTY_LOGISTICS_INTEGRATION,
          },
          {
            name: nameSingleThirdPartyLogistic || "",
          },
        ]}
      >
        <div className="singleThirdPartyLogistic">
          <Card title={renderCardTitle()}>{props.children}</Card>
          <BottomBar
            onSubmit={onSubmit}
            onConnect={onConnect}
            onCancelConnect={onCancelConnect}
            isConnected={isConnected}
          />
        </div>
      </ContentContainer>
    </StyledComponent>
  );
}

export default SingleThirdPartyLogisticLayout;
