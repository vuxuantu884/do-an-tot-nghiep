import { Button, Row, Space } from "antd";
import AuthWrapper from "component/authorization/AuthWrapper";
import ContentContainer from "component/container/content.container";
import ButtonCreate from "component/header/ButtonCreate";
import { InventoryAdjustmentPermission } from "config/permissions/inventory-adjustment.permission";
import UrlConfig from "config/url.config";
import InventoryAdjustment from "./InventoryAdjustment";
import { StylesWrapper } from "./styles";
import { DownloadOutlined } from "@ant-design/icons";
import React, { useState } from "react";

const ListInventoryAdjustments: React.FC = () => {
  const [isExportConditionRecord, setIsExportConditionRecord] = useState(false);

  return (
    <StylesWrapper>
      <ContentContainer
        title="Kiểm kho"
        breadcrumb={[
          {
            name: "Kho hàng",
          },
          {
            name: "Kiểm kho",
          },
        ]}
        extra={
          <Row>
            <Space>
              <AuthWrapper acceptPermissions={[InventoryAdjustmentPermission.read]}>
                <Button
                  className="btn-view"
                  size="large"
                  icon={<DownloadOutlined className="btn-view-icon"/>}
                  onClick={() => {
                    setIsExportConditionRecord(true);
                  }}
                >
                  Xuất file
                </Button>
              </AuthWrapper>
              <AuthWrapper acceptPermissions={[InventoryAdjustmentPermission.create]}>
                <ButtonCreate
                  child="Thêm phiếu kiểm"
                  path={`${UrlConfig.INVENTORY_ADJUSTMENTS}/create`}
                />
              </AuthWrapper>
            </Space>
          </Row>
        }
      >
        {/* Nội dung chính */}
        <InventoryAdjustment
          isExportConditionRecord={isExportConditionRecord}
          setExportConditionRecord={(value: boolean) => setIsExportConditionRecord(value)}
        />
      </ContentContainer>
    </StylesWrapper>
  );
};
export default ListInventoryAdjustments;
