import React, { ReactNode } from "react";
import { StyledComponent } from "./style";

type RowDetailProps = {
  title: string;
  value: ReactNode;
};

const RowDetail: React.FC<RowDetailProps> = (props: RowDetailProps) => {
  const { title, value } = props;

  return (
    <StyledComponent>
      <div className="row-detail">
        <div style={{ width: "40%" }} className="title text-truncate-1">{title}</div>
        <div className="dot data">:</div>
        <div style={{ width: "60%" }}  className="data">{value}</div>
      </div>
    </StyledComponent>
  );
};

export default RowDetail;
