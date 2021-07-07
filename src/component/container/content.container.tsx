import {Button, Card, Layout, Result, Skeleton} from 'antd';
import React from 'react';
import { useHistory } from 'react-router-dom';
import HeaderContainer, {BreadcrumbProps} from './header.container';

const {Content} = Layout;

type ContentContainerProps = {
  children: React.ReactNode;
  title: string;
  extra?: React.ReactNode;
  breadcrumb?: BreadcrumbProps[];
  isError?: boolean;
  isLoading?: boolean;
};

const ContentContainer: React.FC<ContentContainerProps> = (
  props: ContentContainerProps
) => {
  const history = useHistory();
  return (
    <Content>
      {props.isError ? (
      <Result
        status="404"
        title="Không tìm thấy dữ liệu"
        extra={<Button onClick={() => {history.goBack()}} type="primary">Trở về</Button>}
      />
      ) : (
      <React.Fragment>
        <HeaderContainer
          title={props.title}
          breadcrumb={props.breadcrumb}
          extra={props.extra}
        />
        {props.isLoading ? (<Card><div className="padding-20"><Skeleton /></div></Card>) : props.children}
      </React.Fragment>
      )}
    </Content>
  );
};

export default ContentContainer;
