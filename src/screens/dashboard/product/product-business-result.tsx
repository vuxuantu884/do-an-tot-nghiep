import { Tabs } from "antd";
import CustomTable from "component/table/CustomTable";
import { PRODUCT_RANK_TAB_KEY, PRODUCT_RANK_TAB_NAME } from "config/dashboard/product-rank-config";
import { DashboardTopProduct } from "model/dashboard/dashboard.model";
import React, { ReactElement } from "react";
import { formatCurrency } from "utils/AppUtils";

interface Props {
  data: DashboardTopProduct[];
}
interface ProductGroupTableProps {
  dataSource: DashboardTopProduct[];
  isQuantity: boolean;
}

const { TabPane } = Tabs;

const getPercentOfRow = (value: number, dataSource: DashboardTopProduct[], isQuantity: boolean) => {
  // get max income of dataSource
  const maxIncome = Math.max(...dataSource.map((item) => item.total_sales));
  //get max quantity of dataSource
  const maxQuantity = Math.max(...dataSource.map((item) => item.net_quantity));
  // get percent of value of income
  let percentIncome = (value / maxIncome) * 100;
  percentIncome = percentIncome < 0 ? 0 : percentIncome;
  // get percent of value of quantity
  let percentQuantity = (value / maxQuantity) * 100;
  percentQuantity = percentQuantity < 0 ? 0 : percentQuantity;
  // return percent of value
  return (isQuantity ? percentQuantity : percentIncome) + "%";
};

function ImcomeGroupTab(props: Props): ReactElement {
  const { data } = props;
  console.log("data", data);
  const INCOME_TABS = [
    {
      key: PRODUCT_RANK_TAB_KEY.total_sales,
      name: PRODUCT_RANK_TAB_NAME[PRODUCT_RANK_TAB_KEY.total_sales],
      Component: <ProductGroupTable dataSource={data} isQuantity={false} />,
    },
    {
      key: PRODUCT_RANK_TAB_KEY.net_quantity,
      name: PRODUCT_RANK_TAB_NAME[PRODUCT_RANK_TAB_KEY.net_quantity],
      Component: <ProductGroupTable dataSource={data} isQuantity={true} />,
    },
  ];

  return (
    <div className="product-group">
      <Tabs>
        {INCOME_TABS.map(({ name, Component, key }) => (
          <TabPane tab={name} key={key}>
            {Component}
          </TabPane>
        ))}
      </Tabs>
    </div>
  );
}

function ProductGroupTable(props: ProductGroupTableProps) {
  const { dataSource, isQuantity } = props;
  const key = isQuantity ? PRODUCT_RANK_TAB_KEY.net_quantity : PRODUCT_RANK_TAB_KEY.total_sales;
  return (
    <CustomTable
      columns={[
        {
          title: "Tên nhóm",
          dataIndex: "label",
          render: (text: string) => {
            return (
              <div className="name-row">
                <span>{text}</span>
              </div>
            );
          },
        },
        {
          title: PRODUCT_RANK_TAB_NAME[key],
          dataIndex: key,
          align: "center",
          sorter: (a: any, b: any) => a[key] - b[key],
          render: (value: number) => {
            return (
              <div className="value-row">
                <div>{isQuantity ? value : formatCurrency(value, ".") + "đ"}</div>
                <div
                  className="process-bg"
                  style={{
                    width: getPercentOfRow(value, dataSource, isQuantity),
                  }}></div>
              </div>
            );
          },
        },
      ]}
      dataSource={dataSource}
      rowClassName={"income-row"}
      pagination={false}
    />
  );
}

export default ImcomeGroupTab;
