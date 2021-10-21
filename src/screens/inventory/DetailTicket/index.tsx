import { FC, useCallback, useEffect, useState } from "react";
import { StyledWrapper } from "./styles";
import UrlConfig from "config/url.config";
import { Button, Card, Col, Row, Space, Table, Tag } from "antd";
import arrowLeft from "assets/icon/arrow-back.svg";
import imgDefIcon from "assets/img/img-def.svg";
import { PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import WarningRedIcon from "assets/icon/ydWarningRedIcon.svg";
import {
  DeleteOutlined,
  EditOutlined,
  PaperClipOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { ColumnsType } from "antd/lib/table/interface";
import BottomBarContainer from "component/container/bottom-bar.container";
import RowDetail from "screens/products/product/component/RowDetail";
import { useHistory, useParams } from "react-router";
import { useDispatch } from "react-redux";
import {
  deleteInventoryTransferAction,
  getDetailInventoryTransferAction,
  inventoryGetSenderStoreAction,
} from "domain/actions/inventory/stock-transfer/stock-transfer.action";
import { InventoryTransferDetailItem, Store } from "model/inventory/transfer";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { ConvertFullAddress } from "utils/ConvertAddress";
import DeleteTicketModal from "../common/DeleteTicketPopup";
import InventoryShipment from "../common/ChosesShipment";
import { getFeesAction } from "domain/actions/order/order.action";
import { SumWeightInventory } from "utils/AppUtils";
import NumberFormat from "react-number-format";
import { Link } from "react-router-dom";
import ContentContainer from "component/container/content.container";
import InventoryStep from "./components/InventoryTransferStep";

export interface InventoryParams {
  id: string;
}

const DetailTicket: FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [data, setData] = useState<InventoryTransferDetailItem | null>(null);
  const [isDeleteTicket, setIsDeleteTicket] = useState<boolean>(false);
  const [isVisibleInventoryShipment, setIsVisibleInventoryShipment] = useState<boolean>(false);

  const [stores, setStores] = useState<Array<Store>>([] as Array<Store>);
  const [isError, setError] = useState(false);
  const [isLoading, setLoading] = useState<boolean>(false);

  const [infoFees, setInfoFees] = useState<Array<any>>([]);

  const { id } = useParams<InventoryParams>();
  const idNumber = parseInt(id);

  const onResult = useCallback(
    (result: InventoryTransferDetailItem | false) => {
      setLoading(false);
      if (!result) {
        setError(true);
        return;
      } else {
        setData(result);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch]
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
      dataIndex: "amount",
      align: "center",
      width: 100,
      render: (value) => {
        return <NumberFormat
          value={value}
          className="foo"
          displayType={"text"}
          thousandSeparator={true}
        />
      },
    },
  ];

  const deleteTicketResult = useCallback(result => {
    if (!result) {
      setError(true);
      return;
    } else {            
      history.push(`${UrlConfig.INVENTORY_TRANSFER}`);
    }
  }, [history])

  const onDeleteTicket = (value: string | undefined) => {
    dispatch(
      deleteInventoryTransferAction(
        idNumber,
        {note: value ? value : ""},
        deleteTicketResult
      )
    );
  };
  useEffect(() => {
    if (!stores && !data) return;
    else {
      const fromStoreData = stores.find(item => item.id === data?.from_store_id);
      const toStoreData = stores.find(item => item.id === data?.to_store_id);
      
      let request = {
        from_city_id: fromStoreData?.city_id,
        from_city: fromStoreData?.city_name,
        from_district_id: fromStoreData?.district_id,
        from_district: fromStoreData?.district_name,
        from_ward_id: fromStoreData?.ward_id,
        to_country_id: toStoreData?.country_id,
        to_city_id: toStoreData?.city_id,
        to_city: toStoreData?.city_name,
        to_district_id: toStoreData?.district_id,
        to_district: toStoreData?.district_name,
        to_ward_id: toStoreData?.ward_id,
        from_address: fromStoreData?.address,
        to_address: toStoreData?.full_address,
        price: data?.total_amount,
        quantity: 1,
        weight: SumWeightInventory(data?.line_items),
        length: 0,
        height: 0,
        width: 0,
        service_id: 0,
        service: "",
        option: "",
        insurance: 0,
        coupon: "",
        cod: 0,
      };
      dispatch(getFeesAction(request, setInfoFees));
    }
  }, [data, dispatch, stores]);

  useEffect(() => {
    dispatch(
      inventoryGetSenderStoreAction(
        { status: "active", simple: true },
        setStores
      )
    );
    dispatch(getDetailInventoryTransferAction(idNumber, onResult));
  }, [dispatch, idNumber, onResult]);

  return (
    <StyledWrapper>
      <ContentContainer
        isError={isError}
        isLoading={isLoading}
        title={`Chuyển hàng ${data?.code}`}
        breadcrumb={[
          {
            name: "Tổng quản",
            path: UrlConfig.HOME,
          },
          {
            name: "Đặt hàng",
            path: `${UrlConfig.PURCHASE_ORDER}`,
          },
          {
            name: `Đơn hàng ${id}`,
          },
        ]}
        extra={
          <InventoryStep
            status={"canceled"}
            inventoryTransferDetail={data}
          />
        }
      >
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
                              <b><NumberFormat
                                  value={data.total_amount}
                                  className="foo"
                                  displayType={"text"}
                                  thousandSeparator={true}
                                /></b>
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
                      onClick={() => setIsVisibleInventoryShipment(true)}
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
              leftComponent = {
                <div onClick={() => history.push(`${UrlConfig.INVENTORY_TRANSFER}`)} style={{ cursor: "pointer" }}>
                  <img style={{ marginRight: "10px" }} src={arrowLeft} alt="" />
                  {"Quay lại danh sách"}
                </div>
              }
              rightComponent={
                <Space>
                  <Button>
                    <Link
                      to={`${UrlConfig.INVENTORY_TRANSFER}/print-preview?ids=${data.id}&type=inventory_transfer_bill`}
                      target="_blank"
                    >
                      <PrinterOutlined />
                      {" In vận đơn"}
                    </Link>
                  </Button>
                  <Button>
                    <Link
                      to={`${UrlConfig.INVENTORY_TRANSFER}/print-preview?ids=${data.id}&type=inventory_transfer`}
                      target="_blank"
                    >
                      <PrinterOutlined /> 
                      {" In phiếu chuyển"}
                    </Link>
                  </Button>
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
        {
          isVisibleInventoryShipment && 
          <InventoryShipment
            visible={isVisibleInventoryShipment}
            dataTicket={data}
            onCancel={() => setIsVisibleInventoryShipment(false)}
            onOk={() => {}}
            infoFees={infoFees}
          />
        }
      </ContentContainer>
    </StyledWrapper>
  );
};

export default DetailTicket;
