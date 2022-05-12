import { Button, Col, Modal, Row, Table } from "antd";
import imgDefIcon from "assets/img/img-def.svg";
import { StyledWrapper, ModalWrapper } from "./styles";
import { InventoryTransferDetailItem, LineItem } from "model/inventory/transfer";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import NumberFormat from "react-number-format";
import { ColumnsType } from "antd/lib/table";
import { PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import { Link } from "react-router-dom";
import UrlConfig from "config/url.config";
import { adjustmentInventoryAction } from "domain/actions/inventory/stock-transfer/stock-transfer.action";
import { useDispatch } from "react-redux";

type InventoryTransferBalanceModalProps = {
  data: InventoryTransferDetailItem | null;
  onCancel: () => void;
  onOk: (item: InventoryTransferDetailItem | null) => void;
  visible: boolean;
};

const InventoryTransferBalanceModal: React.FC<InventoryTransferBalanceModalProps> = (props: InventoryTransferBalanceModalProps) => {
  const { data, onCancel, onOk, visible } = props;

  const dispatch = useDispatch();

  const columns: ColumnsType<any> = [
    {
      title: "STT",
      align: "center",
      width: "70px",
      render: (value: string, record: PurchaseOrderLineItem, index: number) =>
        index + 1,
    },
    {
      title: "Ảnh",
      width: "60px",
      dataIndex: "variant_image",
      render: (value: string, record: any) => {
        return (
          <div className="product-item-image">
            <img src={value ? value : imgDefIcon} alt="" className="" />
          </div>
        );
      },
    },
    {
      title: "Sản phẩm",
      width: "200px",
      className: "ant-col-info",
      dataIndex: "variant_name",
      render: (value: string, record: PurchaseOrderLineItem, index: number) => (
        <div>
          <div>
            <div className="product-item-sku">
              <Link
                target="_blank"
                to={`${UrlConfig.PRODUCT}/${record.product_id}/variants/${record.variant_id}`}
              >
                {record.sku}
              </Link>
            </div>
            <div className="product-item-name">
              <span className="product-item-name-detail">{value}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "SL thừa",
      align: "center",
      width: 100,
      render: (value: string, row: LineItem) => {
        const text = (row.real_quantity - row.transfer_quantity) >= 0 ? row.real_quantity - row.transfer_quantity : '';
        return text;
      },
    },
    {
      title: "SL thiếu",
      width: 100,
      align: "center",
      render: (value: string, row: LineItem) => {
        const text = (row.real_quantity - row.transfer_quantity) < 0 ? row.real_quantity - row.transfer_quantity : '';
        return text;
      },
    },
    {
      title: "Giá bán",
      dataIndex: "price",
      align: "center",
      width: 200,
      render: (value) => {
        return <NumberFormat
          value={value}
          className="foo"
          displayType={"text"}
          thousandSeparator={true}
        />
      },
    },
    {
      title: "Thành tiền",
      align: "center",
      width: 200,
      render: (item, row: LineItem) => {
        const totalDifference = ( row.real_quantity - row.transfer_quantity ) * row.price;
        if (totalDifference) {
          return <NumberFormat
            value={totalDifference}
            className="foo"
            displayType={"text"}
            thousandSeparator={true}
          />
        }
        return 0;
      },
    },
    {
      title: "Cân bằng tồn",
      align: "center",
      width: 150,
      render: (item, row: LineItem) => {
        const totalDifference = row.transfer_quantity - row.real_quantity;
        if (totalDifference > 0) return `+${totalDifference}`;
        return totalDifference;
      },
    },
  ];

  return (
    <StyledWrapper>
      <Modal
        onCancel={onCancel}
        visible={visible}
        centered
        width="900px"
        title={"Cân bằng kho theo gợi ý"}
        footer={[
          <Button key="back" onClick={onCancel}>
            Huỷ
          </Button>,
          <Button style={{borderColor: "#2a2a86", color: "#2a2a86"}} onClick={() => {}}>
            Kiểm kho theo sản phẩm
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              if (data?.id) {
                dispatch(adjustmentInventoryAction(data.id, (result) => {
                  if (result) {
                    onOk(result);
                  }
                }))
              }
            }}
          >
            Nhận lại tồn chênh lệch
          </Button>,
        ]}
      >
        <ModalWrapper>
          <Row>
            <h2>Chuyển hàng <span>{data?.code}</span></h2>
          </Row>
          <Row className="date-info">
            <Col span={8} >
              <div className="row-detail">
                <div className="row-detail-left title">Ngày tạo</div>
                <div className="dot data">:</div>
                <div className="row-detail-right data">{
                  ConvertUtcToLocalDate(
                    data?.created_date,
                    "DD/MM/YYYY"
                  )}
                </div>
              </div>
            </Col>
            <Col span={8} >
              <div className="row-detail">
                <div className="row-detail-left title">Ngày chuyển</div>
                <div className="dot data">:</div>
                <div className="row-detail-right data">{
                  ConvertUtcToLocalDate(
                    data?.transfer_date,
                    "DD/MM/YYYY"
                  )}
                </div>
              </div>
            </Col>
            <Col span={8} >
              <div className="row-detail">
                <div className="row-detail-left title">Ngày nhận</div>
                <div className="dot data">:</div>
                <div className="row-detail-right data">{
                  ConvertUtcToLocalDate(
                    data?.pending_date,
                    "DD/MM/YYYY"
                  )}
                </div>
              </div>
            </Col>
          </Row>
          <Row>
            <Table
              className="inventory-table"
              rowClassName="product-table-row"
              tableLayout="fixed"
              scroll={{ y: 300, x: 900 }}
              pagination={false}
              columns={columns}
              dataSource={data?.line_items}
              summary={() => {
                let excessAmount = 0;
                let missingAmount = 0;
                let totalDifferenceAmount = 0;
                data?.line_items.forEach((element: LineItem) => {
                  totalDifferenceAmount += (element.real_quantity - element.transfer_quantity) * element.price;
                  if (element.real_quantity - element.transfer_quantity > 0) {
                    excessAmount += (element.real_quantity - element.transfer_quantity);
                  }
                  if (element.real_quantity - element.transfer_quantity < 0) {
                    missingAmount += (element.real_quantity - element.transfer_quantity);
                  }
                });
                return (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell align={"right"} index={1} colSpan={3}>
                      <b>Tổng số lượng:</b>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell align={"center"} index={2} >
                      <b>{excessAmount}</b>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell align={"center"} index={3}>
                      <b>{missingAmount}</b>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={4} >
                    </Table.Summary.Cell>
                    <Table.Summary.Cell align={"center"} index={6}>
                      <b>
                        <NumberFormat
                          value={totalDifferenceAmount}
                          className="foo"
                          displayType={"text"}
                          thousandSeparator={true}
                        />
                      </b>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
                )}}
              />
          </Row>
          <Row
            className="note"
            gutter={5}
            style={{ flexDirection: "column" }}
          >
            <Col span={24} style={{ marginBottom: 6 }}>
              <b>Ghi chú nội bộ:</b>
            </Col>
            <Col span={24} >
              {
                data?.note ? (
                  <span
                    className="note-body"
                    style={{ wordWrap: "break-word" }}
                  >
                    {data.note}
                  </span>
                ) : (
                  <span>Không có ghi chú</span>
                )
              }
            </Col>
          </Row>
        </ModalWrapper>
      </Modal>
    </StyledWrapper>
  );
};

export default InventoryTransferBalanceModal;
