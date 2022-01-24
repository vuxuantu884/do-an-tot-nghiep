import React, { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Breadcrumb } from "antd";

interface IProps {
  title: string;
  extra?: ReactNode;
  breadcrumb?: BreadcrumbProps[];
}

export interface BreadcrumbProps {
  name: string;
  path?: string;
}
const BreadcrumbContainer = (props: IProps) => {
  const { title, extra, breadcrumb } = props;

  return (
    <div className="page-header">
      <div className="page-header-heading">
        <div className="page-header-heading-left">
          <h1 className="page-header-heading-title">{title}</h1>
          {breadcrumb && (
            <Breadcrumb separator=">">
              {breadcrumb.map((item, index) => {
                const { name, path } = item;
                if (!path)
                  return (
                    <Breadcrumb.Item key={`breadcrumb_item_${index}`}>
                      {name}
                    </Breadcrumb.Item>
                  );
                return (
                  <Breadcrumb.Item key={`breadcrumb_item_${index}`}>
                    <Link className="breadcrumb_hover" to={path}>{name}</Link>
                  </Breadcrumb.Item>
                );
              })}
            </Breadcrumb>
          )}
        </div>
        {extra && <div className="page-header-heading-extra">{extra}</div>}
      </div>
    </div>
  );
};

export default BreadcrumbContainer;