import { Col, Row } from "antd";
import { LeftContentHeader, RightContentHeader, StyledPageHeaderWrapper } from "./styles";
interface PageHeaderProps {
  title: string;
  rightContent: React.ReactNode;
}
const PageHeaderDetail: React.FC<PageHeaderProps> = (props: PageHeaderProps) => {
  const { title, rightContent } = props;
  return (
    <StyledPageHeaderWrapper>
      <Row>
      <Col >
        <LeftContentHeader>{title}</LeftContentHeader>
      </Col>
      <Col className="step-content" >
        <RightContentHeader>{rightContent}</RightContentHeader>
      </Col>
    </Row>

    </StyledPageHeaderWrapper>
  )
}

export default PageHeaderDetail;