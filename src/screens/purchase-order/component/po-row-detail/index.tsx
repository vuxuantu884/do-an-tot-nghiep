import { StyledComponent } from "./style";

type RowDetailProps = {
  title: string;
  value: string | null;
};

const PORowDetail: React.FC<RowDetailProps> = (props: RowDetailProps) => {
  return (
    <StyledComponent>
      <div className="po-row-detail">
        <div className="po-row-detail-left title">{props.title}</div>
        {/* <div className="dot data">:</div> */}
        <div className="po-row-detail-right data">{props.value}</div>
      </div>
    </StyledComponent>
  );
};

export default PORowDetail;
