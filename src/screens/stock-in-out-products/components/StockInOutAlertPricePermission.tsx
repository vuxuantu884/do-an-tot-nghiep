import { Alert } from "antd";
import React from "react";
import styled from "styled-components";
import { PricePermissionMapping } from "../constant";

type PropTypes = {
  readPricePermissions: string[];
};

const StyledComponent = styled.div`
  .ant-alert {
    margin: 20px 0;
  }
  ul {
    margin-bottom: 0;
    li {
      &:not(:last-child) {
        margin-bottom: 5px;
      }
    }
  }
`;

function StockInOutAlertPricePermission(props: PropTypes): JSX.Element {
  const { readPricePermissions } = props;
  const renderPricePermissions = () => {
    let text = "";
    if (readPricePermissions.length === 0) {
      text = "Bạn không có quyền xem giá";
    } else {
      const permissionMapping = readPricePermissions
        .map((item: string) => PricePermissionMapping[item])
        .join(",");
      text = "Bạn có quyền xem " + permissionMapping;
    }
    return text;
  };
  return (
    <StyledComponent>
      <Alert
        message={
          <StyledComponent>
            <div className="wrapper">
              <div>
                <b>Lưu ý:</b> Chỉ có người được phân quyền mới có thể xem giá của sản phẩm
              </div>
              <ul>
                <li>{renderPricePermissions()}</li>
              </ul>
            </div>
          </StyledComponent>
        }
        type="warning"
        closable
      />
    </StyledComponent>
  );
}

export default StockInOutAlertPricePermission;
