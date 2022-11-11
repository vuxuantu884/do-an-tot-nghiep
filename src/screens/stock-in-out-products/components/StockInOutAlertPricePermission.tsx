import { Alert } from "antd";
import React from "react";
import styled from "styled-components";

type PropTypes = {
  allowReadImportPrice: boolean;
  allowReadCostPrice: boolean;
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
  const { allowReadImportPrice, allowReadCostPrice } = props;
  const renderPricePermissions = () => {
    let text = "";
    if (!allowReadImportPrice) {
      text = "Bạn có quyền xem giá vốn";
    } else if (!allowReadCostPrice) {
      text = "Bạn có quyền xem giá nhập";
    } else if (!allowReadImportPrice && !allowReadCostPrice) {
      text = "Bạn không có quyền xem giá";
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
