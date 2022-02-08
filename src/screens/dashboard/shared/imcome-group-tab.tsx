import { Tabs } from "antd";
import CustomTable from "component/table/CustomTable";
import React, { ReactElement } from "react";
import { formatCurrency } from "utils/AppUtils";

interface ProductIncomeTableMonth {
  id: number;
  name: string;
  income: number;
  quantity: number;
}

interface Props {}
interface TableImComeProps {
  dataSource: ProductIncomeTableMonth[];
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

const getPercentOfRow = (
  value: number,
  dataSource: ProductIncomeTableMonth[],
  isQuantity: boolean
) => {
  // get max income of dataSource
  const maxIncome = Math.max(...dataSource.map((item) => item.income));
  //get max quantity of dataSource
  const maxQuantity = Math.max(...dataSource.map((item) => item.quantity));
  // get percent of value of income
  const percentIncome = (value / maxIncome) * 100;
  // get percent of value of quantity
  const percentQuantity = (value / maxQuantity) * 100;
  // return percent of value
  return (isQuantity ? percentQuantity : percentIncome)+"%";
};


function dumyData(): ProductIncomeTableMonth[] {
  // return list sample data for table income, quantity, name
  const a = [...Array(10).keys()].map((_, index) => {
    return {
      id: index,
      name: `name ${index}`,
      quantity: index,
      income: Math.random() * 100000000,
    };
  });
  console.log(a);
  return a;
}

function ImcomeGroupTab(props: Props): ReactElement {
  const dataSource: ProductIncomeTableMonth[] = dumyData();

  const INCOME_TABS = [
    {
      key: TAB_KEY.income,
      name: TAB_NAME[TAB_KEY.income],
      Component: <IncomeTable dataSource={dataSource} />,
    },
    {
      key: TAB_KEY.quantity,
      name: TAB_NAME[TAB_KEY.quantity],
      Component: null,
    },
  ];

  return (
    <div className="table-income">
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

function IncomeTable(props: TableImComeProps) {
  const { dataSource } = props;
  return (
    <CustomTable
      columns={[
        {
          title: "Tên nhóm",
          dataIndex: "name",
          render: (text, record) => {
            return (
              <div className="name-row">
                <span>{text}</span>
              </div>
            );
          },
        },
        {
          title: "Doanh thu",
          dataIndex: "income",
          align: "center",
          sorter: (a, b) => a.income - b.income,
          render: (income) => {
            return (
              <div className="value-row">
                <div>{formatCurrency(income, ".")}đ</div>
                <div
                  className="process-bg"
                  style={{
                    width: getPercentOfRow(income, dataSource, false),
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
