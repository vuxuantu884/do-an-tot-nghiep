import { ReactNode } from 'react';
import {StyledComponent} from './style';
import { Link } from "react-router-dom";

type RowDetailProps = {
  title: string,
  link?: string,
  value: ReactNode,
}

const RowDetail: React.FC<RowDetailProps> = (props: RowDetailProps) => {
  return (
    <StyledComponent>
    <div className="row-detail">
      <div className="row-detail-left title text-truncate-1">{props.title}</div>
      <div className="dot data">:</div>
      <div className="row-detail-right data">
        {props.link ? (
          <Link to={props.link}>
            {props.value}
          </Link>
        ) : (
          <span>{props.value}</span>
        )}
      </div>
    </div>
    </StyledComponent>
  )
}

export default RowDetail;
