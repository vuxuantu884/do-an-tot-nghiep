import { Button, Modal, Tooltip } from "antd";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import { getCustomerOrderHistoryAction } from "domain/actions/customer/customer.action";
import { PageResponse } from "model/base/base-metadata.response";
import { OrderModel } from "model/order/order.model";
import {
  CustomerOrderHistoryResponse,
  OrderLineItemResponse,
} from "model/response/order/order.response";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import NumberFormat from "react-number-format";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { getOrderHistoryService } from "service/order/order.service";
import { formatNumber, handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import { HistoryPurchaseStyled } from "./HistoryPurchase.styles";
// import { fields_order, fields_shipment, fields_return} from "../common/fields.export";
type HistoryPurchaseModalProps = {
  visible: boolean;
  customerID: number | null;
  onOk: () => void;
  onClick: (item: any) => void;
};

const orderHistoryDataDefault: any = {
  limit: 30,
  page: 1,
  sort_type: "desc",
  customer_ids: null,
};

const HistoryPurchaseModal: React.FC<HistoryPurchaseModalProps> = (
  props: HistoryPurchaseModalProps,
) => {
  const { visible, customerID, onOk, onClick } = props;
  const dispatch = useDispatch();
  const [tableLoading, setTableLoading] = useState(false);
  const [orderHistoryData, setOrderHistoryData] = useState<
    PageResponse<CustomerOrderHistoryResponse>
  >({
    metadata: {
      limit: orderHistoryDataDefault.limit,
      page: orderHistoryDataDefault.page,
      total: 0,
    },
    items: [],
  });

  const checkIfOrderReturn = (record: CustomerOrderHistoryResponse) => {
    return record.order_id ? true : false;
  };

  const columnsOrderHistory: Array<ICustomTableColumType<CustomerOrderHistoryResponse>> =
    React.useMemo(
      () => [
        {
          title: "ID đơn hàng",
          dataIndex: "code",
          visible: true,
          fixed: "left",
          className: "custom-shadow-td",
          width: 200,
          render: (value: string, item: CustomerOrderHistoryResponse) => {
            const isOrderReturn = checkIfOrderReturn(item);
            return (
              <div>
                {!isOrderReturn ? (
                  <Link to={`${UrlConfig.ORDER}/${item.id}`} target="_blank">
                    {value}
                  </Link>
                ) : (
                  <Link to={`${UrlConfig.ORDERS_RETURN}/${item.id}`} target="_blank">
                    {value}
                  </Link>
                )}
                <div style={{ fontSize: "12px", color: "#666666" }}>
                  <div>
                    {moment(item.created_date).format(DATE_FORMAT.HHmm_DDMMYYYY)}
                    <Tooltip title="Cửa hàng">
                      <div>{item.store}</div>
                    </Tooltip>
                  </div>
                  {item.source && (
                    <div style={{ fontSize: "12px" }}>
                      <strong style={{ color: "#000000" }}>Nguồn: </strong>
                      <span style={{ color: "#222222", wordBreak: "break-all" }}>
                        {item.source}
                      </span>
                    </div>
                  )}
                  {/* {renderReturn(item)} */}
                </div>
                {isOrderReturn && <span style={{ color: "red" }}>Trả hàng</span>}
              </div>
            );
          },
        },
        {
          title: (
            <div className="productNameQuantityPriceHeader">
              <span className="productNameWidth">
                Sản phẩm
                <span className="separator">, </span>
              </span>
              <span className="quantity quantityWidth">
                <span>
                  SL
                  <span className="separator">, </span>
                </span>
              </span>
              <span className="price priceWidth">
                <span>Bảo hành</span>
              </span>
            </div>
          ),
          dataIndex: "items",
          key: "productNameQuantityPrice",
          className: "productNameQuantityPrice",
          render: (items: Array<OrderLineItemResponse>, record: CustomerOrderHistoryResponse) => {
            return (
              <div className="items">
                {items.map((item, i) => {
                  return (
                    <div className="custom-td" key={item.variant_id}>
                      <div className="product productNameWidth 2">
                        <div className="inner">
                          <Link
                            target="_blank"
                            to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.variant_id}`}
                          >
                            {item.sku}
                          </Link>
                          <br />
                          <div className="productNameText" title={item.variant}>
                            {item.variant}
                          </div>
                        </div>
                      </div>
                      <div className="quantity quantityWidth">
                        <NumberFormat value={formatNumber(item.quantity)} displayType={"text"} />
                      </div>
                      <div className="price priceWidth">
                        <Tooltip
                          title={
                            record.status !== "finished"
                              ? "Sản phẩm chưa được bán hoặc đã đổi trả"
                              : "Thêm sản phẩm bảo hành"
                          }
                        >
                          <Button
                            icon={<AiOutlinePlusCircle size={24} />}
                            type="link"
                            disabled={record.status !== "finished"}
                            onClick={() =>
                              onClick({
                                ...item,
                                finished_on: record.finished_on,
                                finalized_on: record.finalized_on,
                              })
                            }
                          />
                        </Tooltip>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          },
          visible: true,
          align: "center",
          width: 500,
        },
      ],
      [onClick],
    );

  const onPageChange = useCallback(
    (page, limit) => {
      const query: any = {
        ...orderHistoryData,
        limit: limit,
        page: page,
        customer_ids: customerID,
      };
      getOrderHistoryService(query)
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            setOrderHistoryData(response.data);
          } else {
            handleFetchApiError(response, "Danh sách lịch sử đơn hàng", dispatch);
          }
        })
        .catch((error) => {
          console.log("error", error);
        })
        .finally(() => {
          setTableLoading(false);
        });
    },
    [orderHistoryData, customerID, dispatch],
  );

  useEffect(() => {
    if (customerID && visible) {
      const query: any = {
        ...orderHistoryDataDefault,
        customer_ids: customerID,
      };
      getOrderHistoryService(query)
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            setOrderHistoryData(response.data);
          } else {
            handleFetchApiError(response, "Danh sách lịch sử đơn hàng", dispatch);
          }
        })
        .catch((error) => {
          console.log("error", error);
        })
        .finally(() => {
          setTableLoading(false);
        });
    }
  }, [customerID, visible, dispatch]);

  return (
    <Modal
      visible={visible}
      onCancel={() => onOk()}
      centered
      closable
      title={[<span style={{ fontWeight: 600, fontSize: 16 }}>Lịch sử mua hàng</span>]}
      footer={[
        <Button key="ok" type="primary" onClick={() => onOk()}>
          Đóng
        </Button>,
      ]}
      width={750}
    >
      <HistoryPurchaseStyled>
        <CustomTable
          bordered
          sticky={{ offsetScroll: 10, offsetHeader: 0 }}
          isLoading={tableLoading}
          pagination={{
            pageSize: orderHistoryData.metadata.limit,
            total: orderHistoryData.metadata.total,
            current: orderHistoryData.metadata.page,
            showSizeChanger: false,
            onChange: onPageChange,
            onShowSizeChange: onPageChange,
          }}
          dataSource={orderHistoryData.items}
          columns={columnsOrderHistory}
          rowKey={(item: OrderModel) => item.id}
        />
      </HistoryPurchaseStyled>
    </Modal>
  );
};

export default HistoryPurchaseModal;
