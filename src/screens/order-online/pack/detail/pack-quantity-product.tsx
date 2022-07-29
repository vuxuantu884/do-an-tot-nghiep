import { Button, Card, Dropdown, Space, Menu } from "antd";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import { GoodsReceiptsTotalProductModel } from "model/pack/pack.model";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { StyledComponent } from "../styles";
import { DownOutlined, FileExcelOutlined, PrinterOutlined } from "@ant-design/icons";
import { PagingParam, ResultPaging } from "model/paging";
import { flatDataPaging } from "utils/Paging";

type PackQuantityProductProps = {
  packProductQuantity: GoodsReceiptsTotalProductModel[];
  handleAddOrderInPack: () => void;
};

const resultPagingDefault: ResultPaging = {
  currentPage: 1,
  lastPage: 1,
  perPage: 30,
  total: 0,
  result: [],
};

const PackQuantityProduct: React.FC<PackQuantityProductProps> = (
  props: PackQuantityProductProps,
) => {
  const { packProductQuantity, handleAddOrderInPack } = props;

  const [pagingParam, setPagingParam] = useState<PagingParam>({
    currentPage: resultPagingDefault.currentPage,
    perPage: resultPagingDefault.perPage,
  });
  const [resultPaging, setResultPaging] = useState<ResultPaging>(resultPagingDefault);

  const column: Array<ICustomTableColumType<GoodsReceiptsTotalProductModel>> = [
    {
      title: "STT",
      dataIndex: "key",
      visible: true,
      width: "5%",
      align: "center",
      render: (value: number, i: GoodsReceiptsTotalProductModel) => {
        return (
          <React.Fragment>
            <div>{value + 1}</div>
          </React.Fragment>
        );
      },
    },
    {
      title: "Mã vạch sản phẩm",
      dataIndex: "barcode",
      visible: true,
      width: "15%",
      render: (value: string, i: GoodsReceiptsTotalProductModel) => {
        return (
          <React.Fragment>
            <Link target="_blank" to={`#`} style={{ whiteSpace: "nowrap" }}>
              {value}
            </Link>
          </React.Fragment>
        );
      },
    },
    {
      title: "Sản phẩm",
      dataIndex: "product_sku",
      visible: true,
      width: "16.5%",
      render: (value: string, i: GoodsReceiptsTotalProductModel) => {
        return (
          <React.Fragment>
            <div style={{ padding: "5px 0" }}>
              <Link
                target="_blank"
                to={`${UrlConfig.PRODUCT}/${i.product_id}/variants/${i.variant_id}`}
              >
                {value}
              </Link>
              <div style={{ fontSize: "0.86em" }}>{i.product_name}</div>
            </div>
          </React.Fragment>
        );
      },
    },
    {
      title: "Tồn trong kho ",
      dataIndex: "on_hand",
      visible: true,
      width: "17%",
      align: "center",
      render: (value: number) => {
        return <div>{value}</div>;
      },
    },
    {
      title: "Giá",
      dataIndex: "price",
      visible: true,
      width: "10.5%",
      render: (value: number) => {
        return <div>{value}</div>;
      },
    },
    {
      title: "Tổng số lượng ",
      dataIndex: "total_quantity",
      visible: true,
      width: "15%",
      align: "center",
      render: (value: number) => {
        return <div>{value}</div>;
      },
    },
    {
      title: "Thiếu",
      dataIndex: "total_incomplate",
      visible: true,
      width: "8.5%",
      align: "center",
      render: (value: number) => {
        return <div>{value}</div>;
      },
    },
  ];

  const menuCardProductQuantity = (
    <Menu className="yody-line-item-action-menu saleorders-product-dropdown">
      <Menu.Item key="1">
        <Button
          type="text"
          style={{
            paddingLeft: 24,
            background: "transparent",
            border: "none",
          }}
          onClick={handleAddOrderInPack}
          icon={<PrinterOutlined />}
        >
          In bảng tổng hợp sản phẩm
        </Button>
      </Menu.Item>

      <Menu.Item key="1">
        <Button
          type="text"
          style={{
            paddingLeft: 24,
            background: "transparent",
            border: "none",
          }}
          onClick={handleAddOrderInPack}
          icon={<FileExcelOutlined />}
        >
          Xuất excel 
        </Button>
      </Menu.Item>
    </Menu>
  );

  useEffect(() => {
    if (!packProductQuantity || (packProductQuantity && packProductQuantity.length <= 0)) {
      setResultPaging(resultPagingDefault);
    } else {
      let result = flatDataPaging(packProductQuantity, pagingParam);
      setResultPaging(result);
    }
  }, [packProductQuantity, pagingParam]);

  return (
    <StyledComponent>
      <Card
        title="Bảng tổng hợp số lượng sản phẩm"
        className="pack-card-products"
        extra={
          <Space>
            <Dropdown trigger={["click"]} overlay={menuCardProductQuantity}>
              <Button className="t1-btn">
                Thao tác <DownOutlined />
              </Button>
            </Dropdown>
          </Space>
        }
      >
        <CustomTable
          bordered
          pagination={{
            pageSize: resultPaging.perPage,
            total: resultPaging.total,
            current: resultPaging.currentPage,
            showSizeChanger: true,
            onChange: (page, size) => {
              setPagingParam({ perPage: size || 10, currentPage: page });
            },
            onShowSizeChange: (page, size) => {
              setPagingParam({ perPage: size || 10, currentPage: page });
            },
          }}
          dataSource={resultPaging.result}
          columns={column}
          rowKey={(item: any) => item.key}
        />
      </Card>
    </StyledComponent>
  );
};

export default PackQuantityProduct;
