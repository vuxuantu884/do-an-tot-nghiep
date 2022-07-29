import { UploadOutlined } from "@ant-design/icons";
import { Button, Col, Row, Select, Table } from "antd";
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
import {
  PurchaseProcument,
  PurchaseProcumentLineItem,
} from "model/purchase-order/purchase-procument";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PurchaseOrderCreateContext } from "screens/purchase-order/provider/purchase-order.provider";
import styled from "styled-components";
import { ProcumentStatus, ProcurementStatus } from "utils/Constants";

export const PoSplitGoods = () => {
  //page context
  const { purchaseOrder } = useContext(PurchaseOrderCreateContext);
  //page state
  const [dateOption, setDateOption] = useState<string>();
  const [dateSelected, setDateSelected] = useState<PurchaseProcument[]>([]);
  const [dataSource, setDataSource] = useState<PurchaseProcumentLineItem[]>([]);

  useEffect(() => {
    const procurementsFilter = groupBy(
      purchaseOrder?.procurements,
      ProcurementLineItemField.expect_receipt_date,
    );
    const procurementsAll: Array<PurchaseProcument[]> = Object.values(procurementsFilter);
    const dateSelected = procurementsAll
      .map((procurement) => {
        return {
          ...procurement[0],
        };
      })
      .filter(
        (procurement) =>
          procurement.status === ProcurementStatus.not_received ||
          procurement.status === ProcurementStatus.received,
      );
    const dateOption =
      dateSelected.length > 0
        ? moment(dateSelected[0].expect_receipt_date).format("DD/MM/YYYY")
        : "";
    setDateSelected(dateSelected);
    setDateOption(dateOption);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchaseOrder?.procurements]);

  useEffect(() => {
    if (dateOption) {
      const index = purchaseOrder?.procurements.findIndex(
        (procurement) =>
          moment(procurement.expect_receipt_date).format("DD/MM/YYYY") === dateOption,
      );
      if (index >= 0) {
        const dataSource: PurchaseProcumentLineItem[] = purchaseOrder?.procurements[
          index
        ].procurement_items.map((procurementItem) => {
          const procurementsFilter = groupBy(
            purchaseOrder?.procurements,
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
            .reduce((total, element) => total + element?.planned_quantity || 0, 0);
          const acceptedQuantity = procurementsFilter[dateOption]
            .reduce(
              (acc, val) => acc.concat(val.procurement_items),
              [] as Array<PurchaseProcumentLineItem>,
            )
            .filter((item) => item.variant_id === procurementItem.variant_id)
            .reduce((total, element) => total + element?.accepted_quantity || 0, 0);
          // store_id ánh: 363, 17, 198
          const quantityAnh = procurementsFilter[dateOption]
            .filter((item) => {
              const store_id =
                process.env.REACT_APP_ENVIRONMENT === EnumEnvironment.PROD
                  ? EnumStoreAnh.PROD
                  : process.env.REACT_APP_ENVIRONMENT === EnumEnvironment.UAT
                  ? EnumStoreAnh.UAT
                  : EnumStoreAnh.DEV;
              return item.store_id === store_id;
            })
            .reduce(
              (acc, val) => acc.concat(val.procurement_items),
              [] as Array<PurchaseProcumentLineItem>,
            )
            .filter((item) => item.variant_id === procurementItem.variant_id)
            .reduce((total, element) => total + element?.accepted_quantity || 0, 0);
          // store_id ánh: 364, 16, 197
          const quantityTung = procurementsFilter[dateOption]
            .filter((item) => {
              const store_id =
                process.env.REACT_APP_ENVIRONMENT === EnumEnvironment.PROD
                  ? EnumStoreTung.PROD
                  : process.env.REACT_APP_ENVIRONMENT === EnumEnvironment.UAT
                  ? EnumStoreTung.UAT
                  : EnumStoreTung.DEV;
              return item.store_id === store_id;
            })
            .reduce(
              (acc, val) => acc.concat(val.procurement_items),
              [] as Array<PurchaseProcumentLineItem>,
            )
            .filter((item) => item.variant_id === procurementItem.variant_id)
            .reduce((total, element) => total + element?.accepted_quantity || 0, 0);
          // store_id ánh: 365, 19, 200
          const quantityHieu = procurementsFilter[dateOption]
            .filter((item) => {
              const store_id =
                process.env.REACT_APP_ENVIRONMENT === EnumEnvironment.PROD
                  ? EnumStoreHieu.PROD
                  : process.env.REACT_APP_ENVIRONMENT === EnumEnvironment.UAT
                  ? EnumStoreHieu.UAT
                  : EnumStoreHieu.DEV;
              return item.store_id === store_id;
            })
            .reduce(
              (acc, val) => acc.concat(val.procurement_items),
              [] as Array<PurchaseProcumentLineItem>,
            )
            .filter((item) => item.variant_id === procurementItem.variant_id)
            .reduce((total, element) => total + element?.accepted_quantity || 0, 0);

          return {
            ...procurementItem,
            planned_quantity: plannedQuantity,
            accepted_quantity: acceptedQuantity,
            quantity_anh: quantityAnh,
            quantity_hieu: quantityHieu,
            quantity_tung: quantityTung,
          };
        });
        setDataSource(dataSource || []);
      }
    }
  }, [dateOption]);

  const columns: Array<ICustomTableColumType<PurchaseProcumentLineItem>> = [
    {
      title: "Mã sản phẩm",
      align: "center",
      dataIndex: "sku",
      width: 75,
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
      width: 45,
      render: (value) => {
        return <>{value}</>;
      },
    },
    {
      title: "Được duyệt",
      align: "center",
      dataIndex: "accepted_quantity",
      width: 70,
      render: (value) => {
        return <>{value}</>;
      },
    },
    {
      title: (
        <div>
          <span className="title-shop"> ASM Ánh</span>
        </div>
      ),
      align: "center",
      dataIndex: "quantity_anh",
      width: 90,
      render: (value) => {
        return <>{value}</>;
      },
    },
    {
      title: (
        <div>
          <span className="title-shop"> ASM Tùng</span>
        </div>
      ),
      align: "center",
      dataIndex: "quantity_tung",
      width: 90,
      render: (value) => {
        return <>{value}</>;
      },
    },
    {
      title: (
        <div>
          <span className="title-shop"> ASM Hiếu</span>
        </div>
      ),
      align: "center",
      dataIndex: "quantity_hieu",
      width: 90,
      render: (value) => {
        return <>{value}</>;
      },
    },
  ];

  const handleOnchangeDateOption = (value: string) => {
    setDateOption(value);
  };
  return (
    <>
      <StyledRow gutter={24} align="middle" justify="space-between">
        <Col className="text-normal">Ngày nhận hàng dự kiến:</Col>
        <Col flex={1} style={{ textAlign: "end" }}>
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
                  disabled={
                    value.status === ProcumentStatus.PARTIAL_RECEIVED ||
                    value.status === ProcumentStatus.RECEIVED
                  }
                >
                  <StyledDate isChoose={dateString === dateOption}>{dateString}</StyledDate>
                  {value.status === ProcumentStatus.PARTIAL_RECEIVED && (
                    <StyledReceived status={ProcumentStatus.PARTIAL_RECEIVED} className="hidden">
                      Đã duyệt
                    </StyledReceived>
                  )}

                  {value.status === ProcumentStatus.RECEIVED && (
                    <StyledReceived status={ProcumentStatus.RECEIVED} className="hidden">
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
        scroll={{ x: window.screen.width <= 1440 ? 800 : 600 }}
        pagination={false}
        columns={columns}
        summary={(data: readonly PurchaseProcumentLineItem[]) => {
          const totalPlannedQuantities = data.reduce((acc, item) => {
            return acc + item.planned_quantity;
          }, 0);
          const totalAcceptedQuantity = data.reduce((acc, item) => {
            return acc + item.accepted_quantity;
          }, 0);
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
                  <div style={{ fontWeight: 700 }}>{totalAcceptedQuantity}</div>
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
    </>
  );
};

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
  }
`;

const StyledDate = styled.span<{ isChoose: boolean }>`
  font-size: 14px;
  line-height: 18px;
  font-weight: ${(p) => (p.isChoose ? "700" : "400")};
  color: ${(p) => (p.isChoose ? "#E24343" : "#222222")};
`;

const StyledReceived = styled.span<{ status: string }>`
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;
  padding: 2px 4px;
  margin-left: 4px;
  background: ${(p) => (p.status === ProcumentStatus.PARTIAL_RECEIVED ? "#27AE60" : "initial")};
  background: ${(p) => (p.status === ProcumentStatus.RECEIVED ? "#FCAF17" : "initial")};
  border-radius: 2px;
  color: #fff;
`;
