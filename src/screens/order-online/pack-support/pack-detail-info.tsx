import {DeleteOutlined, DownloadOutlined, VerticalAlignBottomOutlined} from "@ant-design/icons";
import {Button, Card, Col, Dropdown, Row, Space, Table,Menu} from "antd";
import {ICustomTableColumType} from "component/table/CustomTable";
import {GoodsReceiptsFileModel} from "model/pack/pack.model";
import {GoodsReceiptsResponse} from "model/response/pack/pack.response";
import moment from "moment";
import React from "react";
import threeDot from "assets/icon/three-dot.svg";

type PackDetailInfoProps = {
  packDetail: GoodsReceiptsResponse | any;
  packFile: GoodsReceiptsFileModel[] | any;
  handleDownLoad:()=>void;
  handleDeleteFile:()=>void;
};

const PackDetailInfo: React.FC<PackDetailInfoProps> = (props: PackDetailInfoProps) => {
  const {packDetail, packFile,handleDownLoad,handleDeleteFile} = props;

  const actionColumn = (handleDownLoad: any, handleDeleteFile: any) => {
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
                icon={<DownloadOutlined />}
                type="text"
                className=""
                style={{
                  paddingLeft: 24,
                  background: "transparent",
                  border: "none",
                }}
                onClick={handleDownLoad}
              >
                Tải về
              </Button>
            </Menu.Item>

            <Menu.Item key="2">
              <Button
                icon={<DeleteOutlined />}
                type="text"
                className=""
                style={{
                  paddingLeft: 24,
                  background: "transparent",
                  border: "none",
                  color:"#E24343"
                }}
                onClick={handleDeleteFile}
              >
                Xóa
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

  const column: Array<ICustomTableColumType<GoodsReceiptsFileModel>> = [
    {
      title: "File",
      dataIndex: "file_name",
      visible: true,
      width: "53%",
      render: (value: string, i: GoodsReceiptsFileModel) => {
        return (
          <React.Fragment>
            <div>{value}</div>
          </React.Fragment>
        );
      },
    },

    {
      title: "Người tạo",
      dataIndex: "create_name",
      visible: true,
      width: "21%",
      render: (value: string, i: GoodsReceiptsFileModel) => {
        return (
          <React.Fragment>
            <div>{value}</div>
          </React.Fragment>
        );
      },
    },
    {
      title: "Thời gian",
      dataIndex: "create_time",
      visible: true,
      width: "28%",
      render: (value: string, i: GoodsReceiptsFileModel) => {
        return (
          <React.Fragment>
            <div>{value}</div>
          </React.Fragment>
        );
      },
    },
    actionColumn(handleDownLoad,handleDeleteFile)
  ];
  return (
    <Card title="Thông tin biên bản bàn giao" className="pack-card">
      <Row
        align="middle"
        justify="space-between"
        style={{
          height: "40px",
        }}
        className="pack-info-order row-padding"
      >
        <Col md={6}>
          <Space>
            <span className="t1-color">Ngày:</span>
            <span className="t1">
              {moment(packDetail?.updated_date).format("DD/MM/YYYY")}
            </span>
            <span className="t1">{packDetail?.orders?.length} đơn</span>
          </Space>
        </Col>

        <Col md={8}>
          <Space>
            <span className="t1-color">Cửa hàng:</span>
            <span className="t1">{packDetail?.store_name}</span>
          </Space>
        </Col>

        <Col md={10}>
          <Space>
            <span className="t1-color">Biên bản sàn:</span>
            <span className="t1">{packDetail?.ecommerce_name}</span>
          </Space>
        </Col>
      </Row>
      <Row
        align="middle"
        justify="space-between"
        style={{
          height: "40px",
        }}
        className="pack-info-order row-padding"
      >
        <Col md={6}>
          <Space>
            <span className="t1-color">Loại:</span>
            <span className="t1">{packDetail?.receipt_type_name}</span>
          </Space>
        </Col>

        <Col md={8}>
          <Space>
            <span className="t1-color">Hãng vận chuyển:</span>
            <span className="t1">{packDetail?.delivery_service_name}</span>
          </Space>
        </Col>
        <Col md={10}></Col>
      </Row>
      <div style={{borderBottom: "1px dashed #E5E5E5", margin: "14px 14px"}}></div>
      <div className="title-note-file">
        <p>
          {" "}
          Lưu file đính kèm hoặc ảnh biên bản bàn giao hàng cho bưu tá, dùng để khiếu nại
          nếu cần.
        </p>
      </div>
      <Row className="row-padding">
        <Button>
          <VerticalAlignBottomOutlined /> Chọn file
        </Button>
        <span className="file-info">
          (File 20MB: jpg, jpeg, gif, png, doc, docx, xml, csv, xls, xlsx).
        </span>
      </Row>
        <Table dataSource={packFile} columns={column} pagination={false} className="row-padding t1-margin"/>
    </Card>
  );
};

export default PackDetailInfo;
