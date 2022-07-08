import { StyledComponent } from "./style";

type RowDetailProps = {
  title: string,
  value: any,
}

const RowDetail: React.FC<RowDetailProps> = (props: RowDetailProps) => {
  return (
    <StyledComponent>
      <div className="row-detail">
        <div className="row-detail-left title text-truncate-1">{props.title}</div>
        <div className="dot data">:</div>
        <div
          className="row-detail-right data"
          dangerouslySetInnerHTML={{
            __html: props.value,
          }}
        />
      </div>
    </StyledComponent>
  )
}

export default RowDetail;
