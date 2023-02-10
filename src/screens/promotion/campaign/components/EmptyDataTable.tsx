import React from "react";
import { EmptyDataTableStyled } from "screens/promotion/campaign/campaign.style";
import emptyIcon from "assets/icon/empty.svg";

export const EmptyDataTable = () => {
  return (
    <EmptyDataTableStyled>
      <div className="empty-data">
        <div><img src={emptyIcon} alt="empty data" /></div>
        <div style={{ marginTop: "8px" }}>Không có dữ liệu!</div>
      </div>
    </EmptyDataTableStyled>
  );
}
