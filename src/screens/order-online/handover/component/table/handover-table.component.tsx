import CustomTable, { ICustomTablePaginationConfig } from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import { FulfillmentDto, FulfillmentLineItemDto } from "model/handover/fulfillment.dto";
import { useCallback } from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "utils/AppUtils";
import { HandoverTableStyle } from "./handover-table.style";

export interface HandoverTableType {
  data: Array<FulfillmentDto>,
  setSelected: (selected: Array<FulfillmentDto>) => void;
  selected: Array<string>;
  pagination: false | ICustomTablePaginationConfig;
  isLoading: boolean
}

const HandoverTable: React.FC<HandoverTableType> = (props: HandoverTableType) => {
  const { data, setSelected, selected, pagination, isLoading } = props;
  const onSelectedChange = useCallback((selectedRow: Array<FulfillmentDto>) => {
    setSelected(
      selectedRow.filter(function (el) {
        return el !== undefined;
      })
    );
  }, [setSelected]);
  return (
    <HandoverTableStyle>
      <CustomTable
        selectedRowKey={selected}
        isRowSelection
        rowSelection={{
          getCheckboxProps: record => ({
            disabled: isLoading
          })
        }}
        dataSource={data}
        
        onSelectedChange={onSelectedChange}
        rowKey={handover => handover.code}
        pagination={pagination}
        columns={[
          {
            title: 'STT',
            align: 'center',
            render: (value, record, index) => index + 1
          },
          {
            dataIndex: 'code',
            title: 'ID',
            align: 'center',
            render: (value, record) => <Link target="_blank" to={`${UrlConfig.ORDER}/${(record.order? record.order.id : record.order_id)}`}>
              {value}
            </Link>
          },
          {
            dataIndex: 'customer',
            key: 'customer',
            title: 'Người nhận',
            render: (value, record) => value || record?.order.customer
          },
          {
            dataIndex: 'items',
            title: 'Sản phẩm',
            className: 'products',
            render: (data) => {
              return (
                <div>
                  {data.map((item: FulfillmentLineItemDto, index: number) => {
                    return (
                      <div key={index.toString()} className="row-item">
                        <Link
                          target="_blank"
                          to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.variant_id}`}
                        >
                          {item.variant}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )
            }
          },
          {
            dataIndex: 'items',
            title: 'SL',
            className: 'products',
            render: (data) => {
              return (
                <div>
                  {data.map((item: FulfillmentLineItemDto, index: number) => {
                    return (
                      <div key={index.toString()} className="row-item center">
                        {item.quantity}
                      </div>
                    );
                  })}
                </div>
              )
            }
          },
          {
            dataIndex: 'items',
            title: 'Giá',
            align: 'center',
            className: 'products',
            render: (data) => {
              return (
                <div>
                  {data.map((item: FulfillmentLineItemDto, index: number) => {
                    return (
                      <div key={index.toString()} className="row-item center">
                        {formatCurrency(item.price)}
                      </div>
                    );
                  })}
                </div>
              )
            }
          },
          {
            dataIndex: 'shipment',
            title: 'Cước phí',
            align: 'center',
            render: (data) => formatCurrency(data.shipping_fee_informed_to_customer)
          },
          {
            dataIndex: 'total',
            title: 'Tổng thu',
            align: 'center',
            render: (data) => formatCurrency(data)
          },
        ]}
      />
    </HandoverTableStyle>
  )
};

export default HandoverTable;