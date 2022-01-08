import { ReactNode } from 'react';
import {StyledComponent} from './style';

type RowDetailProps = {
  title: string,
  value: ReactNode,
}

const RowDetail: React.FC<RowDetailProps> = (props: RowDetailProps) => {
  return (
    <StyledComponent>
    <div className="row-detail">
      <div className="row-detail-left title">{props.title}</div>
      <div className="dot data">:</div>
      <div className="row-detail-right data">{props.value}</div>
    </div>
    </StyledComponent>
  )
}

export default RowDetail;