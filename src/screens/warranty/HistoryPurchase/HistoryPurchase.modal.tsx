import {  Button, Modal, Tooltip } from "antd";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import { OrderModel } from "model/order/order.model";
import { OrderLineItemResponse } from "model/response/order/order.response";
import moment from "moment";
import React from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import NumberFormat from "react-number-format";
import { Link } from "react-router-dom";
import { DATE_FORMAT } from "utils/DateUtils";
import { HistoryPurchaseStyled } from "./HistoryPurchase.styles";
// import { fields_order, fields_shipment, fields_return} from "../common/fields.export";
type HistoryPurchaseModalProps = {
  visible: boolean;
  isLoading: boolean;
  orderHistoryData: any;
  onPageChange: (page: any, limit: any) => void;
  onOk: () => void;
  onClick: (item: any) => void;
};

const HistoryPurchaseModal: React.FC<HistoryPurchaseModalProps> = (
  props: HistoryPurchaseModalProps
) => {
  const { visible, isLoading, orderHistoryData, onPageChange, onOk, onClick } = props;
  
  const columnsOrderHistory: Array<ICustomTableColumType<OrderModel>> =
    React.useMemo(() => [
      {
        title: "ID đơn hàng",
        dataIndex: "code",
        visible: true,
        fixed: "left",
        className: "custom-shadow-td",
        width: 200,
        render: (value: string, item: any) => {
          return (
            <div>
              {
                !item.code_order_return
                ?  
                <Link to={`${UrlConfig.ORDER}/${item.id}`} target="_blank">
                  {value}
                </Link>
                :
                <Link to={`${UrlConfig.ORDERS_RETURN}/${item.id}`} target="_blank">
                {value}
                </Link>
              }
              <div style={{ fontSize: "12px", color: "#666666" }}>
                <div>
                  {moment(item.created_date).format(
                    DATE_FORMAT.HHmm_DDMMYYYY
                  )}
                  <Tooltip title="Cửa hàng">
                    <div>{item.store}</div>
                  </Tooltip>
                </div>
                {item.source && (
                  <div style={{ fontSize: "12px" }}>
                    <strong style={{ color: "#000000" }}>Nguồn: </strong>
                    <span
                      style={{ color: "#222222", wordBreak: "break-all" }}>
                      {item.source}
                    </span>
                  </div>
                )}
                {/* {renderReturn(item)} */}
              </div>
              {
                item.code_order_return !== undefined
                && <span style={{ color: "red" }}>Trả hàng</span>
              }
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
        render: (items: Array<OrderLineItemResponse>) => {
          return (
            <div className="items">
              {items.map((item, i) => {
                return (
                  <div className="custom-td" key={item.variant_id}>
                    <div className="product productNameWidth 2">
                      <div className="inner">
                        <Link
                          target="_blank"
                          to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.variant_id}`}>
                          {item.sku}
                        </Link>
                        <br />
                        <div className="productNameText" title={item.variant}>
                          {item.variant}
                        </div>
                      </div>
                    </div>
                    <div className="quantity quantityWidth">
                      <NumberFormat
                        value={item.quantity}
                        displayType={"text"}
                        thousandSeparator={true}
                      />
                    </div>
                    <div className="price priceWidth">
                      <Button
                        icon={<AiOutlinePlusCircle size={24} />}
                        className="dropdown-custom-add-new"
                        type="link"
                        onClick={() => onClick(item)}
                      />
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
    ], [onClick]
  );

  return (
    <Modal
      visible={visible}
      onCancel={() => onOk()}
      centered
      closable
      title={[
        <span style={{fontWeight: 600, fontSize: 16}}>
          Lịch sử mua hàng
        </span>
      ]}
      footer={[
        <Button key="ok"
          type="primary"
          onClick={() => onOk()}
        >
          Đóng
        </Button>,
        
      ]}
      width={750}
    >
      <HistoryPurchaseStyled>
        <CustomTable
          bordered
          sticky={{ offsetScroll: 10, offsetHeader: 55 }}
          isLoading={isLoading}
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

