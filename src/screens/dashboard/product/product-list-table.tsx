import { Table, TablePaginationConfig, Tabs } from "antd";
import { PAGE_SIZE, PRODUCT_LIST_TAB_KEY, PRODUCT_LIST_TAB_NAME } from "config/dashboard/product-list-config";
import { DashboardProductList } from "model/dashboard/dashboard.model";
import React, { ReactElement, useContext, useState } from "react";
import { useDispatch } from "react-redux";
import { formatCurrency } from "utils/AppUtils";
import { mapOnHandByVariantSkusIntoProducts } from "utils/DashboardUtils";
import useFetchProductList from "../hooks/useFetchProductList";
import { DashboardContext } from "../provider/dashboard-provider";

interface ProductListTableProps {
  tabKey: string;
  tabName: string;
  currentPage: number;
  changePage: (page: number) => void;
  dataSource: DashboardProductList[];
  loading: boolean;
}

const { TabPane } = Tabs;

function ProductListTabs(): ReactElement {
  const { dataProductList } = useContext(DashboardContext);
  const { isFetching } = useFetchProductList();

  const [currentPage, setCurrentPage] = useState(1);

  const onChangePage = (page: number) => {
    setCurrentPage(() => page);
  }

  const TABS = [
    {
      key: PRODUCT_LIST_TAB_KEY.TotalSales,
      name: PRODUCT_LIST_TAB_NAME[PRODUCT_LIST_TAB_KEY.TotalSales],
      Component: <ProductListTable tabKey={PRODUCT_LIST_TAB_KEY.TotalSales} tabName={PRODUCT_LIST_TAB_NAME[PRODUCT_LIST_TAB_KEY.TotalSales]} 
        dataSource={dataProductList} loading={isFetching} currentPage={currentPage} changePage={onChangePage} />,
    },
    {
      key: PRODUCT_LIST_TAB_KEY.NetQuantity,
      name: PRODUCT_LIST_TAB_NAME[PRODUCT_LIST_TAB_KEY.NetQuantity],
      Component: <ProductListTable tabKey={PRODUCT_LIST_TAB_KEY.NetQuantity} tabName={PRODUCT_LIST_TAB_NAME[PRODUCT_LIST_TAB_KEY.NetQuantity]} 
      dataSource={dataProductList} loading={isFetching} currentPage={currentPage} changePage={onChangePage} />,
    },
    {
      key: PRODUCT_LIST_TAB_KEY.OnHand,
      name: PRODUCT_LIST_TAB_NAME[PRODUCT_LIST_TAB_KEY.OnHand],
      Component: <ProductListTable tabKey={PRODUCT_LIST_TAB_KEY.OnHand} tabName={PRODUCT_LIST_TAB_NAME[PRODUCT_LIST_TAB_KEY.OnHand]} 
        dataSource={dataProductList} loading={isFetching} currentPage={currentPage}  changePage={onChangePage} />,
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

function ProductListTable(props: ProductListTableProps) {
  const { tabKey, tabName, changePage, currentPage, dataSource, loading } = props;
  const { setDataProductList, deparmentIdList } = useContext(DashboardContext);
  const dispatch = useDispatch();
  return (
    <Table
      loading={loading}
      pagination={{ defaultPageSize: PAGE_SIZE, showSizeChanger: false, current: currentPage }}
      onChange={async (pagination: TablePaginationConfig) => {
        if (pagination?.current && pagination?.current !== currentPage) {
          changePage(pagination.current);
          const productListMapper = await mapOnHandByVariantSkusIntoProducts(dataSource, dispatch, pagination.current, deparmentIdList);
          setDataProductList(() => productListMapper);
        }
      }}
      columns={[
        {
          title: "Sản phẩm",
          dataIndex: "label",
          width: '60%',
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
                {tabKey === PRODUCT_LIST_TAB_KEY.TotalSales ? <div>{formatCurrency(value, ".") + "đ"}</div> : <div>{typeof value === "number" ? formatCurrency(value, ".") : value}</div>}
              </div>
            );
          },
        },
      ]}
      dataSource={dataSource || []}
      rowClassName={"income-row"}
    />
  );
}

export default ProductListTabs;
