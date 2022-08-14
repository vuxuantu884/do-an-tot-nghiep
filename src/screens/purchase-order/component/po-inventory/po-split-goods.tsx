import { UploadOutlined } from "@ant-design/icons";
import { Button, Col, Form, FormInstance, Input, Row, Select, Table } from "antd";
import NumberInput from "component/custom/number-input.custom";
import { ICustomTableColumType } from "component/table/CustomTable";
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

interface IProps {
  formMain?: FormInstance<any>;
  isEditDetail: boolean;
}

const store_hieu =
  process.env.REACT_APP_ENVIRONMENT === EnumEnvironment.PROD
    ? EnumStoreHieu.PROD
    : process.env.REACT_APP_ENVIRONMENT === EnumEnvironment.UAT
    ? EnumStoreHieu.UAT
    : EnumStoreHieu.DEV;
const store_tung =
  process.env.REACT_APP_ENVIRONMENT === EnumEnvironment.PROD
    ? EnumStoreTung.PROD
    : process.env.REACT_APP_ENVIRONMENT === EnumEnvironment.UAT
    ? EnumStoreTung.UAT
    : EnumStoreTung.DEV;
const store_anh =
  process.env.REACT_APP_ENVIRONMENT === EnumEnvironment.PROD
    ? EnumStoreAnh.PROD
    : process.env.REACT_APP_ENVIRONMENT === EnumEnvironment.UAT
    ? EnumStoreAnh.UAT
    : EnumStoreAnh.DEV;

const isSore = (store_id: number) => {
  if (store_id === store_hieu) return EnumStore.HIEU;
  if (store_id === store_tung) return EnumStore.TUNG;
  if (store_id === store_anh) return EnumStore.ANH;
};

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

  useEffect(() => {
    const procurements = formMain?.getFieldsValue()?.procurements
      ? (formMain?.getFieldsValue()?.procurements as PurchaseProcument[])
      : purchaseOrder?.procurements;
    const procurementsFilter = groupBy(procurements, ProcurementLineItemField.expect_receipt_date);
    const procurementsAll: Array<PurchaseProcument[]> = Object.values(procurementsFilter);
    const dateSelected = procurementsAll
      .map((procurement) => {
        const procurementFitterStatus = groupBy(
          procurements.filter(
            (item) => item.expect_receipt_date === procurement[0].expect_receipt_date,
          ),
          ProcurementLineItemField.status,
        );
        const status: string =
          Object.values(procurementFitterStatus)[0]?.length === procurementsAll[0]?.length
            ? (Object.keys(procurementFitterStatus)[0] as any)
            : ProcurementStatus.not_received;
        return {
          ...procurement[0],
          status,
        };
      })
      .filter((item) => item.expect_receipt_date);
    const dateOption =
      dateSelected.length > 0
        ? moment(
            dateSelected.filter((item) => item.status === ProcurementStatus.draft)[0]
              ?.expect_receipt_date,
          ).format("DD/MM/YYYY")
        : "";
    setDateSelected(dateSelected);
    setDateOption(dateOption);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchaseOrder?.procurements]);

  useEffect(() => {
    if (dateOption) {
      const procurements = formMain?.getFieldsValue()?.procurements
        ? (formMain?.getFieldsValue()?.procurements as PurchaseProcument[])
        : purchaseOrder?.procurements;
      const index = procurements.findIndex(
        (procurement) =>
          moment(procurement.expect_receipt_date).format("DD/MM/YYYY") === dateOption,
      );

      if (index >= 0) {
        const dataSource: PurchaseProcumentLineItem[] = procurements[index].procurement_items.map(
          (procurementItem) => {
            const procurementsFilter = groupBy(
              procurements,
              ProcurementLineItemField.expect_receipt_date,
            );
            const procurementsFilterKeys = Object.keys(procurementsFilter);
            procurementsFilterKeys.forEach((oldKey) => {
              const newKey = moment(oldKey).format("DD/MM/YYYY");
              delete Object.assign(procurementsFilter, {
                [newKey]: procurementsFilter[oldKey],
              })[oldKey];
            });
            const plannedQuantity = procurementsFilter[dateOption]
              .reduce(
                (acc, val) => acc.concat(val.procurement_items),
                [] as Array<PurchaseProcumentLineItem>,
              )
              .filter((item) => item.variant_id === procurementItem.variant_id)
              .reduce((total, element) => total + element?.quantity || 0, 0);
            const acceptedQuantity = procurementsFilter[dateOption]
              .reduce(
                (acc, val) => acc.concat(val.procurement_items),
                [] as Array<PurchaseProcumentLineItem>,
              )
              .filter((item) => item.variant_id === procurementItem.variant_id)
              .reduce((total, element) => total + element?.accepted_quantity || 0, 0);
            // store_id ánh: 363, 17, 198
            const storeAnh = procurementsFilter[dateOption].filter((item) => {
              return item.store_id === store_anh;
            });
            const quantityAnh = storeAnh
              .reduce(
                (acc, val) => acc.concat(val.procurement_items),
                [] as Array<PurchaseProcumentLineItem>,
              )
              .filter((item) => item.variant_id === procurementItem.variant_id)
              .reduce((total, element) => total + element?.planned_quantity || 0, 0);
            // store_id ánh: 364, 16,
            const storeTung = procurementsFilter[dateOption].filter((item) => {
              return item.store_id === store_tung;
            });
            const quantityTung = storeTung
              .reduce(
                (acc, val) => acc.concat(val.procurement_items),
                [] as Array<PurchaseProcumentLineItem>,
              )
              .filter((item) => item.variant_id === procurementItem.variant_id)
              .reduce((total, element) => total + element?.planned_quantity || 0, 0);
            // store_id ánh: 365, 19, 200
            const storeHieu = procurementsFilter[dateOption].filter((item) => {
              return item.store_id === store_hieu;
            });
            const quantityHieu = storeHieu
              .reduce(
                (acc, val) => acc.concat(val.procurement_items),
                [] as Array<PurchaseProcumentLineItem>,
              )
              .filter((item) => item.variant_id === procurementItem.variant_id)
              .reduce((total, element) => total + element?.planned_quantity || 0, 0);
            return {
              ...procurementItem,
              quantity: plannedQuantity,
              planned_quantity: plannedQuantity,
              accepted_quantity: acceptedQuantity,
              quantity_anh: quantityAnh,
              quantity_hieu: quantityHieu,
              quantity_tung: quantityTung,
              status: storeHieu[0].status,
            };
          },
        );
        setDataSource(dataSource || []);
      }
      const dataStore = procurements.filter(
        (procurement) =>
          moment(procurement.expect_receipt_date).format("DD/MM/YYYY") === dateOption,
      );
      setDataStore(dataStore);
    }
  }, [dateOption, purchaseOrder?.procurements]);

  const handleChangePercentStore = (storeId: number, value: number | null) => {
    const procurements = formMain?.getFieldsValue()?.procurements as PurchaseProcument[];
    const valueResult = value || 0;
    const dataStore = procurements.filter(
      (procurement) => moment(procurement.expect_receipt_date).format("DD/MM/YYYY") === dateOption,
    );
    const indexStore = dataStore.findIndex((item) => item.store_id === storeId);
    const indexProcurements = procurements.findIndex(
      (item) =>
        item.store_id === dataStore[indexStore].store_id &&
        item.uuid === dataStore[indexStore].uuid,
    );
    if (indexProcurements >= 0) {
      procurements[indexProcurements].percent = value || 0;
      const totalPercent = procurements
        .filter(
          (procurement) =>
            moment(procurement.expect_receipt_date).format("DD/MM/YYYY") === dateOption,
        )
        .reduce((acc, ele) => acc + (ele.percent || 0), 0);
      const dataSourceResult = dataSource.map((item) => {
        const indexProcurementsItem = procurements[indexProcurements].procurement_items.findIndex(
          (procurementItems) => procurementItems.variant_id === item.variant_id,
        );

        if (isSore(storeId) === EnumStore.ANH) {
          let quantity = 0;
          if (
            totalPercent === 100 &&
            (item.quantity_tung || 0) + (item.quantity_hieu || 0) < item.quantity
          ) {
            quantity = item.quantity - ((item.quantity_tung || 0) + (item.quantity_hieu || 0));
          } else {
            quantity = Math.floor((item.quantity * valueResult) / 100);
          }
          if (indexProcurementsItem >= 0) {
            procurements[indexProcurements].procurement_items[
              indexProcurementsItem
            ].planned_quantity = quantity;
          }
          return {
            ...item,
            quantity_anh: quantity,
          };
        }
        if (isSore(storeId) === EnumStore.TUNG) {
          let quantity = 0;
          if (
            totalPercent === 100 &&
            (item.quantity_anh || 0) + (item.quantity_hieu || 0) < item.quantity
          ) {
            quantity = item.quantity - ((item.quantity_anh || 0) + (item.quantity_hieu || 0));
          } else {
            quantity = Math.floor((item.quantity * valueResult) / 100);
          }
          if (indexProcurementsItem >= 0) {
            procurements[indexProcurements].procurement_items[
              indexProcurementsItem
            ].planned_quantity = quantity;
          }
          return {
            ...item,
            quantity_tung: quantity,
          };
        }
        if (isSore(storeId) === EnumStore.HIEU) {
          let quantity = 0;
          if (
            totalPercent === 100 &&
            (item.quantity_anh || 0) + (item.quantity_tung || 0) < item.quantity
          ) {
            quantity = item.quantity - ((item.quantity_anh || 0) + (item.quantity_tung || 0));
          } else {
            quantity = Math.floor((item.quantity * valueResult) / 100);
          }
          if (indexProcurementsItem >= 0) {
            procurements[indexProcurements].procurement_items[
              indexProcurementsItem
            ].planned_quantity = quantity;
          }

          return {
            ...item,
            quantity_hieu: quantity,
          };
        }
        return {
          ...item,
        };
      });
      setDataSource(dataSourceResult);
      formMain?.setFieldsValue({
        [POField.procurements]: [...procurements],
      });
    }
  };

  const handleChangeValueProcumentItem = (
    storeId: number,
    variantId: number,
    value: number | null,
  ) => {
    const valueResult = value || 0;
    const procurements = formMain?.getFieldsValue()?.procurements as PurchaseProcument[];
    const dataStore = procurements.filter(
      (procurement) => moment(procurement.expect_receipt_date).format("DD/MM/YYYY") === dateOption,
    );
    const indexDataSource = dataSource.findIndex((item) => item.variant_id === variantId);
    const indexStore = dataStore.findIndex((item) => item.store_id === storeId);
    const indexProcurements = procurements.findIndex(
      (item) =>
        item.store_id === dataStore[indexStore].store_id &&
        item.uuid === dataStore[indexStore].uuid,
    );
    const indexProcurementsItem = procurements[indexProcurements].procurement_items.findIndex(
      (item) => item.variant_id === variantId,
    );
    if (isSore(storeId) === EnumStore.TUNG) {
      dataSource[indexDataSource].quantity_tung = valueResult;
    }
    if (isSore(storeId) === EnumStore.HIEU) {
      dataSource[indexDataSource].quantity_hieu = valueResult;
    }
    if (isSore(storeId) === EnumStore.ANH) {
      dataSource[indexDataSource].quantity_anh = valueResult;
    }
    if (indexProcurementsItem >= 0) {
      procurements[indexProcurements].procurement_items[indexProcurementsItem].planned_quantity =
        valueResult;
    }
    setDataSource(dataSource);
    formMain?.setFieldsValue({
      [POField.procurements]: procurements,
    });
  };

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
      dataIndex: "planned_quantity",
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
    {
      title: () => {
        const storeAnh = dataStore.filter((item) => {
          return item.store_id === store_anh;
        });
        return (
          <div className="style-store">
            <span className="title-shop"> Ánh</span>
            {isEditDetail && storeAnh[0]?.status === ProcurementStatus.draft ? (
              <div className="shop-percent">
                <NumberInput
                  value={storeAnh.length > 0 ? storeAnh[0].percent : 0}
                  min={0}
                  max={100}
                  suffix={<div className="vat-suffix">%</div>}
                  style={{ width: "100%" }}
                  className="product-item-vat"
                  isChangeAfterBlur={false}
                  onChange={(value: number | null) => {
                    handleChangePercentStore(storeAnh[0].store_id, value);
                  }}
                />
              </div>
            ) : (
              <>({storeAnh[0]?.percent} %)</>
            )}
          </div>
        );
      },
      align: "center",
      dataIndex: "quantity_anh",
      width: 90,
      render: (value, row) => {
        return (
          <>
            {isEditDetail && row.status === ProcurementStatus.draft ? (
              <NumberInput
                min={0}
                value={value}
                onChange={(value) =>
                  handleChangeValueProcumentItem(store_anh, row.variant_id, value)
                }
                format={(a: string) => formatCurrency(a)}
                replace={(a: string) => replaceFormatString(a)}
                maxLength={10}
                isChangeAfterBlur={false}
              />
            ) : (
              <>{value}</>
            )}
          </>
        );
      },
    },
    {
      title: () => {
        const storeTung = dataStore.filter((item) => {
          return item.store_id === store_tung;
        });
        return (
          <div className="style-store">
            <span className="title-shop"> Tùng</span>
            {isEditDetail && storeTung[0]?.status === ProcurementStatus.draft ? (
              <div className="shop-percent">
                <NumberInput
                  value={storeTung.length > 0 ? storeTung[0].percent : 0}
                  min={0}
                  max={100}
                  suffix={<div className="vat-suffix">%</div>}
                  style={{ width: "100%" }}
                  className="product-item-vat"
                  isChangeAfterBlur={false}
                  onChange={(value: number | null) => {
                    handleChangePercentStore(storeTung[0].store_id, value);
                  }}
                />
              </div>
            ) : (
              <>({storeTung[0]?.percent} %)</>
            )}
          </div>
        );
      },
      align: "center",
      dataIndex: "quantity_tung",
      width: 90,
      render: (value, row) => {
        return (
          <>
            {isEditDetail && row.status === ProcurementStatus.draft ? (
              <NumberInput
                min={0}
                value={value}
                onChange={(value) =>
                  handleChangeValueProcumentItem(store_tung, row.variant_id, value)
                }
                format={(a: string) => formatCurrency(a)}
                replace={(a: string) => replaceFormatString(a)}
                maxLength={10}
                isChangeAfterBlur={false}
              />
            ) : (
              <>{value}</>
            )}
          </>
        );
      },
    },
    {
      title: () => {
        const storeHieu = dataStore.filter((item) => {
          return item.store_id === store_hieu;
        });
        return (
          <div className="style-store">
            <span className="title-shop"> Hiếu</span>
            {isEditDetail && storeHieu[0]?.status === ProcurementStatus.draft ? (
              <div className="shop-percent">
                <NumberInput
                  value={storeHieu.length > 0 ? storeHieu[0].percent : 0}
                  min={0}
                  max={100}
                  suffix={<div className="vat-suffix">%</div>}
                  style={{ width: "100%" }}
                  className="product-item-vat"
                  isChangeAfterBlur={false}
                  onChange={(value: number | null) => {
                    handleChangePercentStore(storeHieu[0].store_id, value);
                  }}
                />
              </div>
            ) : (
              <>({storeHieu[0]?.percent} %)</>
            )}
          </div>
        );
      },
      align: "center",
      dataIndex: "quantity_hieu",
      width: 90,
      render: (value, row) => {
        return (
          <>
            {isEditDetail && row.status === ProcurementStatus.draft ? (
              <NumberInput
                min={0}
                value={value}
                onChange={(value) =>
                  handleChangeValueProcumentItem(store_hieu, row.variant_id, value)
                }
                format={(a: string) => formatCurrency(a)}
                replace={(a: string) => replaceFormatString(a)}
                maxLength={10}
                isChangeAfterBlur={false}
              />
            ) : (
              <>{value}</>
            )}
          </>
        );
      },
    },
  ];

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
                    <StyledReceived status={ProcurementStatus.not_received} className="hidden">
                      Đã duyệt
                    </StyledReceived>
                  )}

                  {value.status === ProcurementStatus.received && (
                    <StyledReceived status={ProcurementStatus.received} className="hidden">
                      Đã nhận
                    </StyledReceived>
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
        scroll={{ x: window.screen.width <= 1440 ? 600 : 500 }}
        pagination={false}
        bordered
        columns={columns}
        summary={(data: readonly PurchaseProcumentLineItem[]) => {
          const totalPlannedQuantities = data.reduce((acc, item) => {
            return acc + item.planned_quantity;
          }, 0);
          // const totalAcceptedQuantity = data.reduce((acc, item) => {
          //   return acc + item.accepted_quantity;
          // }, 0);
          const totalQuantityAnh = data.reduce((acc, item) => {
            return acc + (item.quantity_anh || 0);
          }, 0);
          const totalQuantityTung = data.reduce((acc, item) => {
            return acc + (item.quantity_tung || 0);
          }, 0);
          const totalQuantityHieu = data.reduce((acc, item) => {
            return acc + (item.quantity_hieu || 0);
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
                <Table.Summary.Cell align="center" colSpan={1} index={3}>
                  <div style={{ fontWeight: 700 }}>{totalQuantityAnh}</div>
                </Table.Summary.Cell>
                <Table.Summary.Cell align="center" colSpan={1} index={4}>
                  <div style={{ fontWeight: 700 }}>{totalQuantityTung}</div>
                </Table.Summary.Cell>
                <Table.Summary.Cell align="center" colSpan={1} index={5}>
                  <div style={{ fontWeight: 700 }}>{totalQuantityHieu}</div>
                </Table.Summary.Cell>
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
      flex: 1;
      max-width: 80px;
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
  .title-shop {
    margin-right: 4px;
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

const StyledReceived = styled.span<{ status: string }>`
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;
  padding: 2px 4px;
  margin-left: 4px;
  background: ${(p) => {
    if (p.status === ProcurementStatus.received) return "#FCAF17;";
    if (p.status === ProcurementStatus.not_received) return "#27AE60;";
  }} !important;
  border-radius: 2px;
  color: #fff;
  z-index: 100;
`;
