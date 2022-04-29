import { Table, Tabs } from "antd";
import { PRODUCT_RANK_TAB_KEY, PRODUCT_RANK_TAB_NAME } from "config/dashboard/product-rank-config";
import { DashboardTopProduct } from "model/dashboard/dashboard.model";
import React, { ReactElement, useContext } from "react";
import { formatCurrency } from "utils/AppUtils";
import useFetchTopProduct from "../hooks/useFetchTopProduct";
import { DashboardContext } from "../provider/dashboard-provider";
interface ProductGroupTableProps {
  dataSource: DashboardTopProduct[];
  isQuantity: boolean;
  loading: boolean;
}

const { TabPane } = Tabs;

const getPercentOfRow = (value: number, dataSource: DashboardTopProduct[], isQuantity: boolean) => {
  // get total sale of dataSource
  const totalSales = dataSource.reduce((acc, cur) => acc + cur.total_sales, 0);
  //get total quantity of dataSource
  const totalQuantity = dataSource.reduce((acc, cur) => acc + cur.net_quantity, 0);
  // get percent of value of income
  let percentSales = (value / totalSales) * 100;
  percentSales = percentSales < 0 ? 0 : percentSales;
  // get percent of value of quantity
  let percentQuantity = (value / totalQuantity) * 100;
  percentQuantity = percentQuantity < 0 ? 0 : percentQuantity;
  // return percent of value
  return (isQuantity ? percentQuantity : percentSales) + "%";
};

function ProductSaleGroup(): ReactElement {
  const { dataSrcTopProduct } = useContext(DashboardContext);
  const { isFetching } = useFetchTopProduct();

  const INCOME_TABS = [
    {
      key: PRODUCT_RANK_TAB_KEY.total_sales,
      name: PRODUCT_RANK_TAB_NAME[PRODUCT_RANK_TAB_KEY.total_sales],
      Component: <ProductGroupTable dataSource={dataSrcTopProduct} isQuantity={false} loading={isFetching} />,
    },
    {
      key: PRODUCT_RANK_TAB_KEY.net_quantity,
      name: PRODUCT_RANK_TAB_NAME[PRODUCT_RANK_TAB_KEY.net_quantity],
      Component: <ProductGroupTable dataSource={dataSrcTopProduct} isQuantity={true} loading={isFetching} />,
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
  const { dataSource, isQuantity, loading } = props;
  const key = isQuantity ? PRODUCT_RANK_TAB_KEY.net_quantity : PRODUCT_RANK_TAB_KEY.total_sales;
  return (
    <Table
      loading={loading}
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

export default ProductSaleGroup;
