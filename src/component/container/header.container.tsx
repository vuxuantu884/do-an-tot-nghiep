import React from 'react';
import { Helmet } from 'react-helmet';
import {Layout, Breadcrumb} from 'antd';
import { Link } from 'react-router-dom';
import menu from 'routes/menu';
import {getListBreadcumb} from 'utils/AppUtils';
import ButtonCreate from 'component/header/ButtonCreate';
import CreateBillStep from 'component/header/create-bill-step';
import { HEADER_TYPE } from 'config/HeaderConfig';

type HeaderContainerProps = {
  type: number
  object: any
  path: string
  title: string
}

const {Header} = Layout;
const {Item} = Breadcrumb;

const HeaderContainer: React.FC<HeaderContainerProps> = (props: HeaderContainerProps) => {
  const {path} = props;
  let listBreadcumb = getListBreadcumb(menu, path);
  return (
    <React.Fragment>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Yody-o2o</title>
      </Helmet>
      <Header className="yody-header">
        <div>
          <span className="yody-title">{props.title}</span>
          <Breadcrumb>
            {listBreadcumb.map((item, index) => (
              <Item key={index}>
                {
                  index === listBreadcumb.length - 1? item.title
                    : (
                      <Link to={item.path}>{item.title}</Link>
                    )
                }
              </Item>
            ))}
          </Breadcrumb>
        </div>
        <div>
          {props.type === HEADER_TYPE.BUTTON_CREATE && (
            <ButtonCreate path={props.object.pathCreate} />
          )}
          {
            props.type === HEADER_TYPE.STEP && (
              <CreateBillStep />
            )
          }
        </div>
      </Header>
    </React.Fragment>
  )
}

export default HeaderContainer;