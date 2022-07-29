import { Table, Tabs } from "antd";
import {
  TOP_CHARTS_KEY,
  TOTAL_SALES_STORE_TAB_KEY,
  TOTAL_SALES_STORE_TAB_NAME,
} from "config/dashboard";
import { DashboardTopSale } from "model/dashboard/dashboard.model";
import React, { ReactElement, useContext, useState } from "react";
import { formatCurrency } from "utils/AppUtils";
import useFetchTotalSaleByStore from "../hooks/useFetchTotalSaleByStore";
import { DashboardContext } from "../provider/dashboard-provider";

interface TotalSalesByStoreTableProps {
  tabKey: string;
  tabName: string;
  currentPage: number;
  changePage: (page: number) => void;
  dataSource: DashboardTopSale[];
  loading: boolean;
}

const { TabPane } = Tabs;

function TotalSalesByStoreTabs(): ReactElement {
  const { topSale } = useContext(DashboardContext);
  const { isFetching } = useFetchTotalSaleByStore();
  const [currentPage, setCurrentPage] = useState(1);

  const onChangePage = (page: number) => {
    setCurrentPage(() => page);
  };

  const TABS = [
    {
      key: TOTAL_SALES_STORE_TAB_KEY.TotalSales,
      name: TOTAL_SALES_STORE_TAB_NAME[TOTAL_SALES_STORE_TAB_KEY.TotalSales],
      Component: (
        <TotalSalesByStoreTable
          tabKey={TOTAL_SALES_STORE_TAB_KEY.TotalSales}
          tabName={TOTAL_SALES_STORE_TAB_NAME[TOTAL_SALES_STORE_TAB_KEY.TotalSales]}
          dataSource={topSale.get(TOP_CHARTS_KEY.STORE_SALES) || []}
          loading={isFetching}
          currentPage={currentPage}
          changePage={onChangePage}
        />
      ),
    },
  ];

  return (
    <div className="product-group">
      <Tabs>
        {TABS.map(({ name, Component, key }) => (
          <TabPane tab={name} key={key}>
            {Component}
          </TabPane>
        ))}
      </Tabs>
    </div>
  );
}

function TotalSalesByStoreTable(props: TotalSalesByStoreTableProps) {
  const { tabKey, tabName, dataSource, loading } = props;
  return (
    <Table
      loading={loading}
      pagination={{ defaultPageSize: 10, showSizeChanger: false }}
      columns={[
        {
          title: "Cửa hàng",
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
          title: tabName,
          dataIndex: tabKey,
          align: "center",
          render: (value: number) => {
            return (
              <div className="value-row">
                <div>{formatCurrency(value, ".") + "đ"}</div>
              </div>
            );
          },
        },
      ]}
      dataSource={dataSource}
      rowClassName={"income-row"}
    />
  );
}

export default TotalSalesByStoreTabs;
