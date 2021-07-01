import {Layout} from 'antd';
import HeaderContainer, { BreadcrumbProps } from './header.container';

const {Content} = Layout;

type ContentContainerProps = {
  children: React.ReactNode;
  title: string;
  extra?: React.ReactNode;
  breadcrumb?: BreadcrumbProps[];
}

const ContentContainer: React.FC<ContentContainerProps> = (props: ContentContainerProps) => {
  return (
    <Content>
      <HeaderContainer
        title={props.title}
        breadcrumb={props.breadcrumb}
        extra={props.extra}
      />
      {props.children}
    </Content>
  );
};

export default ContentContainer;
