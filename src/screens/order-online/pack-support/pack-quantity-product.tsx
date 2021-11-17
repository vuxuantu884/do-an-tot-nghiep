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
  ReconciliationOutlined,
} from "@ant-design/icons";

type PackQuantityProductProps = {
  packProductQuantity: GoodsReceiptsTotalProductModel[];
  handlePrintPackFull: () => void;
  handlePrintPackCompact: () => void;
  handleExportExcelOrderPack: () => void;
  handleAddOrderInPack: () => void;
};
const PackQuantityProduct: React.FC<PackQuantityProductProps> = (
  props: PackQuantityProductProps
) => {
  const {
    packProductQuantity,
    handlePrintPackFull,
    handlePrintPackCompact,
    handleExportExcelOrderPack,
    handleAddOrderInPack,
  } = props;

  const actionColumn = (
    handlePrintPackFull: any,
    handlePrintPackCompact: any,
    handleExportExcelOrderPack: any,
    handleAddOrderInPack: any
  ) => {
    const _actionColumn = {
      title: "",
      key: "14",
      visible: true,
      width: "5%",
      className: "saleorder-product-card-action ",
      render: (l: any, item: any, index: number) => {
        const menu = (
          <Menu className="yody-line-item-action-menu saleorders-product-dropdown">
            <Menu.Item key="1">
              <Button
                type="text"
                className=""
                style={{
                  paddingLeft: 24,
                  background: "transparent",
                  border: "none",
                }}
                onClick={handlePrintPackFull}
                icon={<PrinterOutlined />}
              >
                In biên bản đầy đủ
              </Button>
            </Menu.Item>

            <Menu.Item key="2">
              <Button
                type="text"
                className=""
                style={{
                  paddingLeft: 24,
                  background: "transparent",
                  border: "none",
                }}
                onClick={handlePrintPackCompact}
                icon={<PrinterOutlined />}
              >
                In biên bản rút gọn
              </Button>
            </Menu.Item>
            <Menu.Item key="3">
              <Button
                type="text"
                className=""
                style={{
                  paddingLeft: 24,
                  background: "transparent",
                  border: "none",
                }}
                onClick={handleExportExcelOrderPack}
                icon={<FileExcelOutlined />}
              >
                Xuất excel đơn hàng trong biên bản
              </Button>
            </Menu.Item>
            <Menu.Item key="4">
              <Button
                type="text"
                className=""
                style={{
                  paddingLeft: 24,
                  background: "transparent",
                  border: "none",
                }}
                onClick={handleAddOrderInPack}
                icon={<ReconciliationOutlined />}
              >
                Thêm đơn hàng vào biên bản
              </Button>
            </Menu.Item>
          </Menu>
        );
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "0 4px",
            }}
          >
            <div
              className="site-input-group-wrapper saleorder-input-group-wrapper"
              style={{
                borderRadius: 5,
              }}
            >
              <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
                <Button
                  type="text"
                  className="p-0 ant-btn-custom"
                  icon={<img src={threeDot} alt=""></img>}
                ></Button>
              </Dropdown>
            </div>
          </div>
        );
      },
    };
    return _actionColumn;
  };

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
            <Link target="_blank" to={`${UrlConfig.ORDER}/${i.barcode}`}>
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
              <Link target="_blank" to={`${UrlConfig.ORDER}/${i.product_sku}`}>
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
        return {value};
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
    actionColumn(
      handlePrintPackFull,
      handlePrintPackCompact,
      handleExportExcelOrderPack,
      handleAddOrderInPack
    ),
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
