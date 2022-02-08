import { Tabs } from "antd";
import CustomTable from "component/table/CustomTable";
import { ProductGroup, ProductGroupIncome, ProductGroupQuantity } from "model/dashboard/dashboard.model";
import React, { ReactElement } from "react";
import { formatCurrency } from "utils/AppUtils";

interface Props {
  data: ProductGroup;
}
interface ProductGroupTableProps {
  dataSource: ProductGroupIncome[] | ProductGroupQuantity[];
  isQuantity: boolean;
}

const { TabPane } = Tabs;

const TAB_KEY = {
  income: "income",
  quantity: "quantity",
};
const TAB_NAME = {
  [TAB_KEY.income]: "Doanh thu",
  [TAB_KEY.quantity]: "Số lượng",
};

const getPercentOfRow = (value: number, dataSource: any[], isQuantity: boolean) => {
  // get max income of dataSource
  const maxIncome = Math.max(...dataSource.map((item) => item.income));
  //get max quantity of dataSource
  const maxQuantity = Math.max(...dataSource.map((item) => item.quantity));
  // get percent of value of income
  const percentIncome = (value / maxIncome) * 100;
  // get percent of value of quantity
  const percentQuantity = (value / maxQuantity) * 100;
  // return percent of value
  return (isQuantity ? percentQuantity : percentIncome) + "%";
};

function ImcomeGroupTab(props: Props): ReactElement {
  const { data } = props;
  const INCOME_TABS = [
    {
      key: TAB_KEY.income,
      name: TAB_NAME[TAB_KEY.income],
      Component: <ProductGroupTable dataSource={data.product_group_incomes} isQuantity={false} />,
    },
    {
      key: TAB_KEY.quantity,
      name: TAB_NAME[TAB_KEY.quantity],
      Component: <ProductGroupTable dataSource={data.product_group_quantities} isQuantity={true} />,
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
  const key = isQuantity ? "quantity" : "income";
  return (
    <CustomTable
      columns={[
        {
          title: "Tên nhóm",
          dataIndex: "product_group_name",
          render: (text: string) => {
            return (
              <div className="name-row">
                <span>{text}</span>
              </div>
            );
          },
        },
        {
          title: "Doanh thu",
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
