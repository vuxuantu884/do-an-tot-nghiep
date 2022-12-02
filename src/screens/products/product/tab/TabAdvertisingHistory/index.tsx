import CustomTable from "component/table/CustomTable";
import { PageResponse } from "model/base/base-metadata.response";
import { AdvertisingHistoryResponse } from "model/inventory";
import { formatCurrencyForProduct } from "screens/products/helper";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { DiscountValueType, PriceRuleMethod } from "model/promotion/price-rules.model";
import { Link } from "react-router-dom";
import UrlConfig from "config/url.config";
import React from "react";

type AdvertisingHistoryProps = {
  data: PageResponse<AdvertisingHistoryResponse>;
  dataVariant: any;
  onChange: (page: number, pageSize?: number) => void;
  isLoadingAdvertisingHistory?: boolean;
}

const TabAdvertisingHistory: React.FC<AdvertisingHistoryProps> = (props: AdvertisingHistoryProps) => {
  const { data, onChange, isLoadingAdvertisingHistory, dataVariant } = props;

  const getEntitledMethod = (data: any) => {
    switch (data) {
      case PriceRuleMethod.FIXED_PRICE:
        return "Đồng giá";
      case PriceRuleMethod.QUANTITY:
        return "Chiết khấu theo từng sản phẩm";
      case PriceRuleMethod.ORDER_THRESHOLD:
        return "Chiết khấu theo đơn hàng";
      case PriceRuleMethod.BUY_X_GET_Y:
        return "Quà tặng";
    }
  };

  return (
    <div>
      <CustomTable
        isLoading={isLoadingAdvertisingHistory}
        className="small-padding"
        dataSource={data.items}
        scroll={{ x: "max-content" }}
        pagination={{
          total: data.metadata.total,
          pageSize: data.metadata.limit,
          current: data.metadata.page,
          onChange: onChange,
        }}
        sticky={{ offsetHeader: 55, offsetScroll: 10 }}
        rowKey={(record) => record.id}
        columns={[
          {
            title: "Mã",
            dataIndex: "code",
            width: 120,
            render: (value, row: AdvertisingHistoryResponse) => {
              return (
                <>
                  <Link to={`${UrlConfig.PROMOTION}/discounts/${row.id}`}>{value}</Link>
                </>
              )
            }
          },
          {
            title: "Tên chương trình",
            dataIndex: "title",
            width: 200,
          },
          {
            title: "Phương thức KM",
            dataIndex: "entitled_method",
            render: (value) => getEntitledMethod(value),
            align: "left",
            width: 200,
          },
          {
            title: "SL tối thiểu",
            dataIndex: "prerequisite_quantity_gte",
            align: "center",
            render: (value) => formatCurrencyForProduct(value),
            width: 100,
          },
          {
            title: "Giá bán",
            dataIndex: "suggested_discounts",
            align: "center",
            width: 150,
            render: () => {
              return (
                <div>{dataVariant?.variant_prices && dataVariant?.variant_prices[0]
                && formatCurrencyForProduct(dataVariant.variant_prices[0].retail_price)}</div>
              )
            },
          },
          {
            title: "Giá sau chiết khấu",
            dataIndex: "suggested_discounts",
            align: "center",
            width: 150,
            render: (value, row: AdvertisingHistoryResponse) => {
              return (
                <div>
                  {dataVariant?.variant_prices && dataVariant?.variant_prices[0] && (
                    <>
                      {row?.suggested_discounts?.value_type === DiscountValueType.FIXED_PRICE && (
                        <>{formatCurrencyForProduct(value.value)}</>
                      )}
                      {row?.suggested_discounts?.value_type === DiscountValueType.FIXED_AMOUNT && (
                        <>{formatCurrencyForProduct(dataVariant.variant_prices[0].retail_price - value.value)}</>
                      )}
                      {row?.suggested_discounts?.value_type === DiscountValueType.PERCENTAGE && (
                        <>{formatCurrencyForProduct(dataVariant.variant_prices[0].retail_price * (1 - value.value / 100))}</>
                      )}
                    </>
                  )}
                </div>
              )
            }
          },
          {
            title: "Thời gian",
            width: 200,
            dataIndex: "transaction_date",
            render: (value, row: AdvertisingHistoryResponse) => {
              return (
                <div>
                  <div>
                    {ConvertUtcToLocalDate(row.starts_date, 'DD/MM/YYYY')}
                  </div>
                  <div>
                    {ConvertUtcToLocalDate(row.ends_date, 'DD/MM/YYYY')}
                  </div>
                </div>
              )
            },
            align: "left",
          },
        ]}
      />
    </div>
  );
};

export default TabAdvertisingHistory;
