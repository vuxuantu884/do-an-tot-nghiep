import {Button, Card, Dropdown, Space, Table, Menu} from "antd";
import {ICustomTableColumType} from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import {
  GoodsReceiptsTotalProductModel,
} from "model/pack/pack.model";
import React from "react";
import {Link} from "react-router-dom";
import threeDot from "assets/icon/three-dot.svg";
import {
  DownOutlined,
  FileExcelOutlined,
  PrinterOutlined,
} from "@ant-design/icons";

type PackQuantityProductProps = {
  packProductQuantity: GoodsReceiptsTotalProductModel[];
  handleAddOrderInPack: () => void;
};
const PackQuantityProduct: React.FC<PackQuantityProductProps> = (
  props: PackQuantityProductProps
) => {
  const {
    packProductQuantity,
    handleAddOrderInPack,
  } = props;

  const column: Array<ICustomTableColumType<GoodsReceiptsTotalProductModel>> = [
    {
      title: "STT",
      dataIndex: "key",
      visible: true,
      width: "5%",
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
            <Link target="_blank"   to={`#`}>
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
            <div style={{padding: "5px 0"}}>
              <Link target="_blank"  to={`${UrlConfig.PRODUCT}/${i.product_id}/variants/${i.variant_id}`}>
                {value}
              </Link>
              <div style={{fontSize: "0.86em"}}>{i.product_name}</div>
            </div>
          </React.Fragment>
        );
      },
    },
    {
      title: "Tồn trong kho ",
      dataIndex: "inventory",
      visible: true,
      width: "17%",
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
      render: (value: number) => {
        return <div>{value}</div>;
      },
    },
    {
      title: "Thiếu",
      dataIndex: "total_incomplate",
      visible: true,
      width: "8.5px",
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

  return (
    <Card
      title="Bảng tổng hợp số lượng sản phẩm"
      className="pack-card"
      extra={
        <Space>
          <Dropdown trigger={["click"]}  overlay={menuCardProductQuantity}>
            <Button className="t1-btn">
              Thao tác <DownOutlined />
            </Button>
          </Dropdown>
        </Space>
      }
    >
      <Table
        dataSource={packProductQuantity}
        columns={column}
        //pagination={false}
        className="row-padding t1-margin"
      />
    </Card>
  );
};

export default PackQuantityProduct;
