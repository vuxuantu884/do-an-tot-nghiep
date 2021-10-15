import { FC, useCallback, useEffect, useState } from "react";
import { StyledWrapper } from "./styles";
import UrlConfig from "config/url.config";
import { Button, Card, Col, Row, Space, Steps, Table, Tag } from "antd";
import imgDefIcon from "assets/img/img-def.svg";
import { PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import WarningRedIcon from "assets/icon/ydWarningRedIcon.svg";
import {
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import { ColumnsType } from "antd/lib/table/interface";
import BottomBarContainer from "component/container/bottom-bar.container";
import RowDetail from "screens/products/product/component/RowDetail";
import { useHistory, useParams } from "react-router";
import PageHeaderDetail from "./components/PageHeader";
import { useDispatch } from "react-redux";
import {
  deleteInventoryTransferAction,
  getDetailInventoryTransferAction,
} from "domain/actions/inventory/stock-transfer/stock-transfer.action";
import { InventoryTransferDetailItem } from "model/inventory/transfer";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { ConvertFullAddress } from "utils/ConvertAddress";
import DeleteTicketModal from "../common/DeleteTicketPopup";

export interface InventoryParams {
  id: string;
}

const DetailTicket: FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [data, setData] = useState<InventoryTransferDetailItem | null>(null);
  const [isDeleteTicket, setIsDeleteTicket] = useState<boolean>(false);

  const { id } = useParams<InventoryParams>();
  const idNumber = parseInt(id);

  const onResult = useCallback(
    (result: InventoryTransferDetailItem | false) => {
      if (!result) {
        return;
      } else {
        setData(result);
      }
    },
    []
  );

  const columns: ColumnsType<any> = [
    {
      title: "STT",
      align: "center",
      width: "50px",
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
      dataIndex: "product_name",
      render: (value: string, record: PurchaseOrderLineItem, index: number) => (
        <div>
          <div>
            <div className="product-item-sku">{record.sku}</div>
            <div className="product-item-name">
              <span className="product-item-name-detail">{value}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Số lượng",
      width: 100,
      align: "center",
      dataIndex: "transfer_quantity",
    },
    {
      title: "Giá bán",
      dataIndex: "price",
      align: "center",
      width: 100,
      render: (value) => {
        return value || "";
      },
    },
    {
      title: "Thành tiền",
      dataIndex: "amount",
      align: "center",
      width: 100,
      render: (value) => {
        return value || 0;
      },
    },
  ];

  const onDeleteTicket = (value: string | undefined) => {
    dispatch(
      deleteInventoryTransferAction(
        idNumber,
        {note: value ? value : ""},
        (result: InventoryTransferDetailItem | false) => {
          if (!result) {
            return;
          } else {
            history.push(`${UrlConfig.INVENTORY_TRANSFER}`);
          }
        }
      )
    );
  };

  useEffect(() => {
    dispatch(getDetailInventoryTransferAction(idNumber, onResult));
    return () => {};
  }, [dispatch, idNumber, onResult]);

  return (
    <StyledWrapper>
      <div>
        <PageHeaderDetail
          title={`Chuyển hàng ${data?.code}`}
          rightContent={
            <Steps
              progressDot={() => (
                <div className="ant-steps-icon-dot">
                  <CheckOutlined />
                </div>
              )}
              size="small"
              current={1}
            >
              <Steps.Step title="Xin hàng" />
              <Steps.Step title="Chờ chuyển" />
              <Steps.Step title="Đang chuyển" />
              <Steps.Step title="Chờ xử lý" />
              <Steps.Step title="Đã nhập" />
            </Steps>
          }
        ></PageHeaderDetail>
        {data && (
          <>
            <Row gutter={24}>
              <Col span={18}>
                <Card
                  title="KHO HÀNG"
                  bordered={false}
                  className={"inventory-selectors"}
                >
                  <Row gutter={24}>
                    <Col span={12}>
                      <RowDetail title="Kho gửi" value={data.from_store_name} />
                      <RowDetail
                        title="Mã CH"
                        value={data.from_store_code?.toString()}
                      />
                      <RowDetail
                        title="SĐT"
                        value={data.from_store_phone?.toString()}
                      />
                      <RowDetail
                        title="Địa chỉ"
                        value={ConvertFullAddress(data.store_receive)}
                      />
                    </Col>{" "}
                    <Col span={12}>
                      <RowDetail title="Kho nhận" value={data.to_store_name} />
                      <RowDetail
                        title="Mã CH"
                        value={data.to_store_code?.toString()}
                      />
                      <RowDetail
                        title="SĐT"
                        value={data.to_store_phone?.toString()}
                      />
                      <RowDetail
                        title="Địa chỉ"
                        value={ConvertFullAddress(data.store_transfer)}
                      />
                    </Col>
                  </Row>
                </Card>

                <Card
                  title="DANH SÁCH SẢN PHẨM"
                  bordered={false}
                  className={"product-detail"}
                >
                  <div>
                    <Table
                      rowClassName="product-table-row"
                      tableLayout="fixed"
                      scroll={{ y: 300 }}
                      pagination={false}
                      columns={columns}
                      dataSource={data.line_items}
                      summary={() => (
                        <Table.Summary>
                          <Table.Summary.Row>
                            <Table.Summary.Cell align={"right"} index={2} colSpan={3}>
                              <b>Tổng số lượng:</b>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell align={"center"} index={3}>
                              <b>{data.total_quantity}</b>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={4}>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell align={"center"} index={5}>
                              <b>{data.total_amount}</b>
                            </Table.Summary.Cell>
                          </Table.Summary.Row>
                        </Table.Summary>
                      )}
                    />
                  </div>
                </Card>
                <Card
                  title={"CHUYỂN HÀNG"}
                  extra={
                    <Button
                      className={"choses-shipper-button"}
                      onClick={() => {}}
                    >
                      Chọn hãng vận chuyển
                    </Button>
                  }
                ></Card>
              </Col>
              <Col span={6}>
                <Card
                  title={"THÔNG TIN PHIẾU"}
                  bordered={false}
                  className={"inventory-info"}
                  extra={<Tag>Chờ chuyển</Tag>}
                >
                  <Col>
                    <RowDetail title="ID Phiếu" value={data.code} />
                    <RowDetail title="Người tạo" value={data.created_by} />
                    <RowDetail
                      title="Ngày tạo"
                      value={ConvertUtcToLocalDate(
                        data.created_date,
                        "DD/MM/YYYY"
                      )}
                    />
                    <RowDetail
                      title="Ngày chuyển"
                      value={
                        data.transfer_date
                          ? ConvertUtcToLocalDate(
                              data.transfer_date,
                              "DD/MM/YYYY"
                            )
                          : " ---"
                      }
                    />
                    <RowDetail
                      title="Ngày nhận"
                      value={
                        data.receive_date
                          ? ConvertUtcToLocalDate(
                              data.receive_date,
                              "DD/MM/YYYY"
                            )
                          : " ---"
                      }
                    />
                  </Col>
                </Card>
                <Card
                  title={"GHI CHÚ"}
                  bordered={false}
                  className={"inventory-note"}
                >
                  <Row
                    className=""
                    gutter={5}
                    style={{ flexDirection: "column" }}
                  >
                    <Col span={24} style={{ marginBottom: 6 }}>
                      <b>Ghi chú nội bộ:</b>
                    </Col>
                    <Col span={24}>
                      <span
                        className="text-focus"
                        style={{ wordWrap: "break-word" }}
                      >
                        {data.note !== "" ? data.note : "Không có ghi chú"}
                      </span>
                    </Col>
                  </Row>

                  <Row
                    className="margin-top-10"
                    gutter={5}
                    style={{ flexDirection: "column" }}
                  >
                    <Col span={24} style={{ marginBottom: 6 }}>
                      <b>File đính kèm:</b>
                    </Col>
                    <Col span={24}>
                      <span className="text-focus">
                        {data.attached_files?.map(
                          (link: string, index: number) => {
                            return (
                              <a
                                key={index}
                                className="file-pin"
                                target="_blank"
                                rel="noreferrer"
                                href={link}
                              >
                                <PaperClipOutlined /> {link}
                              </a>
                            );
                          }
                        )}
                      </span>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
            <BottomBarContainer
              rightComponent={
                <Space>
                  <Button danger onClick={() => setIsDeleteTicket(true)}>
                    <DeleteOutlined /> Hủy phiếu
                  </Button>
                  <Button
                    onClick={() => {
                      history.push(
                        `${UrlConfig.INVENTORY_TRANSFER}/${data?.id}/update`
                      );
                    }}
                  >
                    <EditOutlined /> Sửa thông tin
                  </Button>
                </Space>
              }
            />
          </>
        )}
        {
          isDeleteTicket &&
          <DeleteTicketModal
            onOk={onDeleteTicket}
            onCancel={() => setIsDeleteTicket(false)}
            visible={isDeleteTicket}
            icon={WarningRedIcon}
            textStore={data?.from_store_name}
            okText="Đồng ý"
            cancelText="Thoát"
            title={`Bạn chắc chắn Hủy phiếu chuyển hàng ${data?.code}`}
          />
        }
      
      </div>
    </StyledWrapper>
  );
};

export default DetailTicket;
