import { UploadOutlined } from "@ant-design/icons";
import { Button, Col, Form, FormInstance, Input, Row, Select, Table, Tooltip } from "antd";
import NumberInput from "component/custom/number-input.custom";
import { ICustomTableColumType } from "component/table/CustomTable";
import { AppConfig } from "config/app.config";
import {
  EnumEnvironment,
  EnumStore,
  EnumStoreAnh,
  EnumStoreHieu,
  EnumStoreTung,
} from "config/enum.config";
import UrlConfig from "config/url.config";
import { groupBy } from "lodash";
import { ProcurementLineItemField } from "model/procurement/field";
import { POField } from "model/purchase-order/po-field";
import { PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import {
  PurchaseProcument,
  PurchaseProcumentLineItem,
} from "model/purchase-order/purchase-procument";
import moment from "moment";
import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PurchaseOrderCreateContext } from "screens/purchase-order/provider/purchase-order.provider";
import styled from "styled-components";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import { ProcurementStatus } from "utils/Constants";
import { DATE_FORMAT } from "utils/DateUtils";

interface IProps {
  formMain?: FormInstance<any>;
  isEditDetail: boolean;
}

const COUNT_STORE = 3;
const WIDTH_COLUM_STORE = 90;
export const PoSplitGoods = (props: IProps) => {
  //page props
  const { formMain, isEditDetail } = props;
  //page context
  const { purchaseOrder } = useContext(PurchaseOrderCreateContext);
  //page state
  const [dateOption, setDateOption] = useState<string>();
  const [dateSelected, setDateSelected] = useState<PurchaseProcument[]>([]);
  const [dataSource, setDataSource] = useState<PurchaseProcumentLineItem[]>([]);
  const [dataStore, setDataStore] = useState<PurchaseProcument[]>([]);
  const [columns, setColumns] = useState<Array<ICustomTableColumType<PurchaseProcumentLineItem>>>(
    [],
  );

  useEffect(() => {
    const procurements = formMain?.getFieldsValue()?.procurements
      ? (formMain?.getFieldsValue()?.procurements as PurchaseProcument[])
      : purchaseOrder?.procurements;
    const procurementsFilter = groupBy(procurements, ProcurementLineItemField.expect_receipt_date);
    const procurementsAll: Array<PurchaseProcument[]> = Object.values(procurementsFilter);
    const procurementsFilterKeys = Object.keys(procurementsFilter);
    const dateSelected = procurementsAll
      .map((procurement, indexProcurement) => {
        const procurementFitterStatus = groupBy(
          procurements.filter(
            (item) => item.expect_receipt_date === procurement[0].expect_receipt_date,
          ),
          ProcurementLineItemField.status,
        );
        let status: string =
          Object.values(procurementFitterStatus)[0]?.length ===
          procurementsFilter[procurementsFilterKeys[indexProcurement]]?.length
            ? (Object.keys(procurementFitterStatus)[0] as any)
            : ProcurementStatus.not_received;

        status =
          Object.keys(procurementFitterStatus).includes(ProcurementStatus.draft) ||
          Object.keys(procurementFitterStatus).includes(ProcurementStatus.not_received)
            ? status
            : ProcurementStatus.received;
        return {
          ...procurement[0],
          status,
        };
      })
      .filter((item) => item.expect_receipt_date);
    const dateOption =
      dateSelected.length > 0
        ? moment(dateSelected[0]?.expect_receipt_date).format(DATE_FORMAT.DDMMYYY)
        : "";
    setDateSelected(dateSelected);
    setDateOption(dateOption);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchaseOrder?.procurements]);

  useEffect(() => {
    if (dateOption) {
      const line_items = formMain?.getFieldsValue()?.line_items as PurchaseOrderLineItem[];
      const procurements = formMain?.getFieldsValue()?.procurements
        ? (formMain?.getFieldsValue()?.procurements as PurchaseProcument[])
        : purchaseOrder?.procurements;

      const procurementsItems = procurements
        .filter(
          (procurement) =>
            moment(procurement.expect_receipt_date).format(DATE_FORMAT.DDMMYYY) === dateOption,
        )
        .sort((pre, next) => next.procurement_items.length - pre.procurement_items.length);

      const dataStore = procurements.filter(
        (procurement) =>
          moment(procurement.expect_receipt_date).format(DATE_FORMAT.DDMMYYY) === dateOption,
      );
      if (procurementsItems.length >= 0) {
        const dataSource: PurchaseProcumentLineItem[] = procurementsItems[0].procurement_items.map(
          (procurementItem) => {
            const procurementsFilter = groupBy(
              procurements,
              ProcurementLineItemField.expect_receipt_date,
            );
            const procurementsFilterKeys = Object.keys(procurementsFilter);
            procurementsFilterKeys.forEach((oldKey) => {
              const newKey = moment(oldKey).format(DATE_FORMAT.DDMMYYY);
              delete Object.assign(procurementsFilter, {
                [newKey]: procurementsFilter[oldKey],
              })[oldKey];
            });
            const plannedQuantity = procurementsFilter[dateOption]
              ?.reduce(
                (acc, val) => acc.concat(val.procurement_items),
                [] as Array<PurchaseProcumentLineItem>,
              )
              .filter((item) => item.sku === procurementItem.sku)
              .reduce((total, element) => total + element?.quantity || 0, 0);
            const procurement_items = procurementsFilter[dateOption].map(
              (procurementsFilterItem) => {
                const indexProcurementsFilterItem =
                  procurementsFilterItem.procurement_items.findIndex(
                    (item) => item.sku === procurementItem.sku,
                  );
                return {
                  ...procurementsFilterItem.procurement_items[indexProcurementsFilterItem],
                  procurement: procurementsFilterItem,
                  status: procurementsFilterItem.status,
                };
              },
            );
            return {
              ...procurementItem,
              quantity: plannedQuantity,
              procurement_items: procurement_items,
            };
          },
        );
        const dataResult: PurchaseProcumentLineItem[] = [];
        line_items.forEach((item) => {
          const dataItem = dataSource.find((dataSourceItem) => dataSourceItem.sku === item.sku);
          if (dataItem) {
            dataResult.push(dataItem);
          }
        });
        setDataSource(dataResult || []);
      }
      setDataStore(dataStore);
    }
  }, [dateOption, purchaseOrder?.procurements]);

  useEffect(() => {
    const columns: Array<ICustomTableColumType<PurchaseProcumentLineItem>> = [
      {
        title: "Mã sản phẩm",
        align: "center",
        dataIndex: "sku",
        width: 80,
        render: (value, record) => {
          return (
            <Link
              target="_blank"
              to={`${UrlConfig.PRODUCT}/${record.product_id}/variants/${record.variant_id}`}
            >
              {value}
            </Link>
          );
        },
      },
      {
        title: "Kế hoạch",
        align: "center",
        dataIndex: "quantity",
        width: 60,
        render: (value) => {
          return <>{value}</>;
        },
      },
      {
        title: "",
        align: "center",
        dataIndex: "accepted_quantity",
        width: 0,
        render: (value) => {
          return <></>;
        },
      },
    ];
    const width =
      dataStore.length < COUNT_STORE
        ? Math.round((COUNT_STORE * WIDTH_COLUM_STORE) / (dataStore.length || 1))
        : WIDTH_COLUM_STORE;

    const dateIndex = dateSelected.findIndex(
      (item) => moment(item.expect_receipt_date).format(DATE_FORMAT.DDMMYYY) === dateOption,
    );
    const status = dateSelected[dateIndex]?.status;
    moment(dateSelected[0]?.expect_receipt_date).format(DATE_FORMAT.DDMMYYY);
    dataStore.forEach((store, indexStore) => {
      columns.push({
        title: () => {
          return (
            <div className="style-store">
              <span className="title-shop">
                <Tooltip title={store?.store_short_name ? store?.store_short_name : store.store}>
                  {store?.store_short_name ? store?.store_short_name : store.store}
                </Tooltip>
              </span>
              {isEditDetail && store?.status === ProcurementStatus.draft ? (
                <div className="shop-percent">
                  <NumberInput
                    value={store.percent || 0}
                    min={0}
                    max={100}
                    suffix={<div className="vat-suffix">%</div>}
                    style={{ width: "100%" }}
                    className="product-item-vat"
                    isChangeAfterBlur={false}
                    onChange={(value: number | null) => {
                      handleChangePercentStore(store, indexStore, value);
                    }}
                  />
                </div>
              ) : (
                <div className="shop-percent">({store?.percent || 0} %)</div>
              )}
            </div>
          );
        },
        align: "center",
        dataIndex: "procurement_items",
        width: width,
        render: (value, row) => {
          const planned_quantity = row.procurement_items
            ? row.procurement_items[indexStore]?.planned_quantity || 0
            : 0;
          const accepted_quantity = row.procurement_items
            ? row.procurement_items[indexStore]?.accepted_quantity || 0
            : 0;
          const real_quantity = row.procurement_items
            ? row.procurement_items[indexStore]?.real_quantity || 0
            : 0;
          return (
            <>
              {isEditDetail &&
              row.procurement_items &&
              row.procurement_items[indexStore]?.status === ProcurementStatus.draft ? (
                <NumberInput
                  min={0}
                  value={planned_quantity}
                  onChange={(value) => {
                    row?.procurement_items &&
                      row?.procurement_items[indexStore]?.procurement &&
                      handleChangeValueProcumentItem(
                        row.procurement_items[indexStore]?.procurement,
                        row.sku,
                        indexStore,
                        value,
                      );
                  }}
                  format={(a: string) => formatCurrency(a)}
                  replace={(a: string) => replaceFormatString(a)}
                  maxLength={10}
                  isChangeAfterBlur={false}
                />
              ) : (
                <>
                  {" "}
                  {status === ProcurementStatus.not_received ? (
                    <>
                      <StyledNotReceived>{accepted_quantity}</StyledNotReceived>/{planned_quantity}
                    </>
                  ) : status === ProcurementStatus.received ? (
                    <>
                      <StyledReceived>{real_quantity}</StyledReceived>/{planned_quantity}
                    </>
                  ) : (
                    planned_quantity
                  )}
                </>
              )}
            </>
          );
        },
      });
    });

    setColumns(columns);
  }, [dataStore, isEditDetail]);

  const handleChangePercentStore = (
    procument: PurchaseProcument,
    indexStore: number,
    value: number | null,
  ) => {
    const procurements = formMain?.getFieldsValue()?.procurements as PurchaseProcument[];
    const valueResult = value || 0;

    // const indexStore = dataStore.findIndex((item) => item.store_id === storeId);
    const indexProcurements = procurements.findIndex((item) => procument.id === item.id);
    dataStore[indexStore]["percent"] = valueResult;
    if (indexProcurements >= 0) {
      procurements[indexProcurements]["percent"] = valueResult;
      procurements[indexProcurements].procurement_items = procurements[
        indexProcurements
      ].procurement_items.map((procurementItem) => {
        return {
          ...procurementItem,
          percent: valueResult,
        };
      });
      const totalPercent = dataStore.reduce((acc, ele) => acc + (ele.percent || 0), 0);
      const dataSourceResult = dataSource.map((dataSourceItem) => {
        const indexProcurementsItem = procurements[indexProcurements].procurement_items.findIndex(
          (procurementItems) => procurementItems.sku === dataSourceItem.sku,
        );
        if (indexProcurementsItem >= 0 && dataSourceItem.procurement_items) {
          let quantity = Math.round((dataSourceItem.quantity * valueResult) / 100);
          dataSourceItem.procurement_items[indexStore].planned_quantity = quantity;
          const totalPlannedQuantity = dataSourceItem.procurement_items.reduce(
            (acc, ele) => acc + ele.planned_quantity,
            0,
          );
          if (
            totalPercent === AppConfig.ONE_HUNDRED_PERCENT &&
            dataSourceItem.quantity !== totalPlannedQuantity
          ) {
            const quantityPercent = totalPlannedQuantity - dataSourceItem.quantity;
            if (valueResult === 0) {
              quantity = 0;
              let check = false;
              dataSourceItem.procurement_items &&
                dataSourceItem.procurement_items.forEach((item, index) => {
                  if (item.percent && dataSourceItem.procurement_items && !check) {
                    check = true;
                    dataSourceItem.procurement_items[index].planned_quantity =
                      dataSourceItem.procurement_items[index].planned_quantity - quantityPercent;
                  }
                });
            } else {
              quantity = quantity - quantityPercent;
              dataSourceItem.procurement_items[indexStore].planned_quantity =
                quantity >= 0 ? quantity : 0;
            }
          }
          procurements[indexProcurements].procurement_items[
            indexProcurementsItem
          ].planned_quantity = quantity;
        }
        return {
          ...dataSourceItem,
        };
      });
      setDataStore(dataStore);
      setDataSource(dataSourceResult);
      formMain?.setFieldsValue({
        [POField.procurements]: [...procurements],
      });
    }
  };

  const handleChangeValueProcumentItem = (
    procurement: PurchaseProcument | undefined,
    sku: string,
    indexStore: number,
    value: number | null,
  ) => {
    const valueResult = value || 0;
    const procurements = formMain?.getFieldsValue()?.procurements as PurchaseProcument[];
    const indexProcurement = procurements.findIndex((item) => item.id === procurement?.id);
    if (indexProcurement >= 0) {
      const indexProcurementItem = procurements[indexProcurement].procurement_items.findIndex(
        (item) => item.sku === sku,
      );
      const indexDataSource = dataSource.findIndex((item) => item.sku === sku);
      procurements[indexProcurement].procurement_items[indexProcurementItem].planned_quantity =
        valueResult;
      if (indexDataSource >= 0 && dataSource[indexDataSource]?.procurement_items) {
        //@ts-ignore
        dataSource[indexDataSource].procurement_items[indexStore].planned_quantity = valueResult;
      }
      setDataSource([...dataSource]);
      formMain?.setFieldsValue({
        [POField.procurements]: procurements,
      });
    }
  };

  const handleOnchangeDateOption = (value: string) => {
    setDateOption(value);
  };

  return (
    <StyledPOSplGood>
      <StyledRow gutter={24} align="middle" justify="space-between">
        <Col flex={1} className="text-normal">
          Ngày nhận hàng dự kiến:
        </Col>
        <Col style={{ textAlign: "end" }}>
          <Select
            key={Math.random()}
            placeholder="Chọn ngày nhận dự kiến"
            style={{ width: "200px" }}
            maxTagCount="responsive"
            notFoundContent="Không có dữ liệu"
            value={dateOption}
            onChange={handleOnchangeDateOption}
            allowClear
          >
            {dateSelected.map((value) => {
              const dateString = moment(value.expect_receipt_date).format("DD/MM/YYYY");
              return (
                <Select.Option
                  value={dateString}
                  key={value.id}
                  // disabled={
                  //   value.status === ProcurementStatus.not_received ||
                  //   value.status === ProcurementStatus.received
                  // }
                >
                  <StyledDate status={value.status} className="no-style">
                    {dateString}
                  </StyledDate>
                  {value.status === ProcurementStatus.not_received && (
                    <StyledReceivedOrNotReceived
                      status={ProcurementStatus.not_received}
                      className="hidden"
                    >
                      Đã duyệt
                    </StyledReceivedOrNotReceived>
                  )}

                  {value.status === ProcurementStatus.received && (
                    <StyledReceivedOrNotReceived
                      status={ProcurementStatus.received}
                      className="hidden"
                    >
                      Đã nhận
                    </StyledReceivedOrNotReceived>
                  )}
                </Select.Option>
              );
            })}
          </Select>
        </Col>
      </StyledRow>
      <Table
        className="product-table"
        rowKey={(record: PurchaseProcumentLineItem) =>
          record.id ? record.id : record.line_item_id
        }
        rowClassName="product-table-row"
        dataSource={dataSource}
        tableLayout="fixed"
        scroll={{ x: window.screen.width <= 1600 ? 600 : 500 }}
        pagination={false}
        bordered
        columns={columns}
        summary={(data: readonly PurchaseProcumentLineItem[]) => {
          const totalPlannedQuantities = data.reduce((acc, item) => {
            return acc + (item.quantity || 0);
          }, 0);

          return (
            <Table.Summary>
              <Table.Summary.Row>
                <Table.Summary.Cell align="right" colSpan={1} index={0}>
                  <div style={{ fontWeight: 700 }}>Tổng</div>
                </Table.Summary.Cell>
                <Table.Summary.Cell align="center" colSpan={1} index={1}>
                  <div style={{ fontWeight: 700 }}>{totalPlannedQuantities}</div>
                </Table.Summary.Cell>
                <Table.Summary.Cell align="center" colSpan={1} index={2}>
                  {/* <div style={{ fontWeight: 700 }}>{totalAcceptedQuantity}</div> */}
                </Table.Summary.Cell>
                {dataStore.map((dataStoreItem, indexStore) => {
                  let total = 0;
                  data.forEach((dataItem, index) => {
                    total += dataItem?.procurement_items
                      ? dataItem?.procurement_items[indexStore].planned_quantity || 0
                      : 0;
                  });
                  return (
                    <Table.Summary.Cell align="center" colSpan={1} index={3}>
                      <div style={{ fontWeight: 700 }}>{total}</div>
                    </Table.Summary.Cell>
                  );
                })}
              </Table.Summary.Row>
            </Table.Summary>
          );
        }}
      />
      <Form.Item name={POField.line_items} hidden noStyle>
        <Input />
      </Form.Item>
    </StyledPOSplGood>
  );
};

const StyledPOSplGood = styled.div`
  .style-store {
    display: flex;
    align-items: center;
    gap: 12px;
    justify-content: center;
    .shop-percent {
      min-width: 55px;
      flex: 1;
      max-width: 80px;
    }
    .title-shop {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-right: 4px;
    }
  }
`;

const StyledRow = styled(Row)`
  margin-bottom: 20px;
  .text-normal {
    font-weight: 400;
    color: #000000;
    font-size: 14px;
    line-height: 18px;
  }
  .ant-input {
    height: 32px !important;
    width: 48px !important;
    padding: 7px 8px !important;
  }
  .vat-suffix {
    height: 100%;
    width: 30px;
    background-color: #f5f5f5;
    border-radius: 5px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .ant-input-affix-wrapper {
    padding: 0 !important;
  }
  .ant-select-selection-item {
    .hidden {
      display: none;
    }
    .no-style {
      color: #222222 !important;
    }
  }
  .ant-select-arrow,
  .ant-select-clear {
    margin-right: 12px !important;
  }
`;

const StyledDate = styled.span<{ status: string }>`
  font-size: 14px;
  line-height: 18px;
  /* font-weight: ${(p) => (p.status === ProcurementStatus.draft ? "700" : "400")}; */
  color: ${(p) => (p.status === ProcurementStatus.draft ? "#E24343" : "#222222")};
`;

const StyledReceivedOrNotReceived = styled.span<{ status: string }>`
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;
  padding: 2px 4px;
  margin-left: 4px;
  background: ${(p) => {
    if (p.status === ProcurementStatus.received) return "#27AE60;";
    if (p.status === ProcurementStatus.not_received) return "#FCAF17;";
  }} !important;
  border-radius: 2px;
  color: #fff;
  z-index: 100;
`;

const StyledNotReceived = styled.span`
  color: #fcaf17;
`;
const StyledReceived = styled.span`
  color: #27ae60;
`;
