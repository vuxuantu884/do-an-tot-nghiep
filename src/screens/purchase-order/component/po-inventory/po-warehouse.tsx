import { Col, Form, Input, Row, Table, Tooltip } from "antd";
import { FormInstance } from "antd/es/form/Form";
import CustomDatePicker from "component/custom/new-date-picker.custom";
import NumberInput from "component/custom/number-input.custom";
import ButtonAdd from "component/icon/ButtonAdd";
import ButtonRemove from "component/icon/ButtonRemove";
import { IConDivided } from "component/icon/Divided";
import { IConPlan } from "component/icon/Plan";
import { ICustomTableColumType } from "component/table/CustomTable";
import { groupBy } from "lodash";
import { ProcurementLineItemField } from "model/procurement/field";
import { POField } from "model/purchase-order/po-field";
import { POLineItemType, PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import { ProcurementTable, PurchaseOrder } from "model/purchase-order/purchase-order.model";
import {
  PurchaseProcument,
  PurchaseProcumentLineItem,
} from "model/purchase-order/purchase-procument";
import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { PurchaseOrderCreateContext } from "screens/purchase-order/provider/purchase-order.provider";
import styled from "styled-components";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import { ProcumentStatus, ProcurementStatus } from "utils/Constants";
import { ConvertDateToUtc, DATE_FORMAT } from "utils/DateUtils";
import { showError } from "utils/ToastUtils";
import { v4 as uuidv4 } from "uuid";
const DEFAULT_SPAN = window.screen.width <= 1360 ? 8 : window.screen.width <= 1600 ? 7 : 4.5;
const DEFAULT_SCROLL = 50;
const AMOUNT_COLUMNS = window.screen.width <= 1440 ? 3 : 5;
interface IExpectReceiptDates extends PurchaseProcument {
  isAdd: boolean;
  date: string;
}

interface IProps {
  isEditDetail: boolean;
  formMain?: FormInstance<any>;
}

export const PoWareHouse = (props: IProps) => {
  //page props
  const { isEditDetail, formMain } = props;
  const {
    purchaseOrder,
    procurementsAll,
    setProcurementsAll,
    procurementTable,
    setProcurementTable,
    handleSetProcurementTableContext,
  } = useContext(PurchaseOrderCreateContext);
  const [columns, setColumns] = useState<Array<ICustomTableColumType<any>>>([]);
  const [expectReceiptDates, setExpectReceiptDates] = useState<Array<IExpectReceiptDates>>([]);
  const [ratio, setRatio] = useState({
    span: 0,
    scroll: DEFAULT_SCROLL,
  });

  //page variable
  const receive_status = purchaseOrder.receive_status;

  const handleSetRadio = (expectReceiptDates: IExpectReceiptDates[]) => {
    const span =
      expectReceiptDates?.length === 1 ? AMOUNT_COLUMNS : expectReceiptDates?.length * DEFAULT_SPAN;
    setRatio({
      span: span <= 22 ? span : 22,
      scroll:
        expectReceiptDates.length > AMOUNT_COLUMNS
          ? expectReceiptDates.length * 150
          : DEFAULT_SCROLL,
    });
  };

  const handleSetQuantityWarehouses = (indexData: number, value: number, uuid: string) => {
    const procurementItemsIndex: PurchaseProcumentLineItem[] = procurementsAll
      .reduce((acc, val) => acc.concat(val), [])
      .reduce((acc, val) => acc.concat(val.procurement_items), [] as PurchaseProcumentLineItem[])
      .filter(
        (procurementItems) =>
          procurementItems.variant_id === procurementTable[indexData].variant_id,
      )
      .filter((procurementTable) => procurementTable.uuid === uuid)
      .map((item) => {
        const quantity = Math.floor(((item.percent || 0) * value) / 100);
        return {
          ...item,
          planned_quantity: quantity,
          quantity,
          ordered_quantity: quantity,
        };
      }); //uuid + index lấy uuid theo vị trí

    const procurements = formMain?.getFieldValue(POField.procurements) as PurchaseProcument[];
    const procurementItemsResult = procurementItemsIndex.map((procurementItem, index) => {
      const quantity: number =
        index === procurementItemsIndex.length - 1
          ? value -
            (procurementItemsIndex.reduce((acc, ele) => acc + ele.quantity, 0) -
              procurementItem.quantity)
          : procurementItem.quantity;
      return {
        ...procurementItem,
        planned_quantity: quantity,
        quantity,
        ordered_quantity: quantity,
      };
    });
    procurements.forEach((procurement, index) => {
      procurementItemsResult.forEach((procurementItemIndex, indexProcurementItemsIndex) => {
        const indexProcurementItem = procurement.procurement_items.findIndex(
          (item) => item.id === procurementItemIndex.id,
        );
        if (indexProcurementItem >= 0) {
          procurements[index].procurement_items.splice(
            indexProcurementItem,
            1,
            procurementItemsResult[indexProcurementItemsIndex],
          );
        }
      });
    });

    formMain?.setFieldsValue({
      [POField.procurements]: [...procurements],
    });
  };

  const onChangeNumber = (indexData: number, index: number, value: number, uuid: string) => {
    procurementTable[indexData].plannedQuantities[index] = value;
    handleSetQuantityWarehouses(indexData, value, uuid + index);
    setProcurementTable([...procurementTable]);
  };

  const onChangeExpectedDate = useCallback(
    (index: number, value?: string) => {
      // if (!value) return;
      const dataCheckDate = expectReceiptDates.map((item) => item.date);
      if (dataCheckDate.includes(value || "")) {
        expectReceiptDates[index].date = "";
        formMain?.setFieldsValue({
          ["expectedDate" + index]: undefined,
        });
        setExpectReceiptDates([...expectReceiptDates]);
        showError(`Ngày dự kiến ${value} đã tồn tại`);
        return;
      }
      expectReceiptDates[index].date = value || "";
      const procurements: PurchaseProcument[] = (
        formMain?.getFieldValue(POField.procurements) as PurchaseProcument[]
      ).map((procurement) => {
        if (procurement.uuid === expectReceiptDates[index].uuid) {
          const expectReceiptDate = value
            ? ConvertDateToUtc(moment(value, DATE_FORMAT.DDMMYYY).format(DATE_FORMAT.MM_DD_YYYY))
            : "";
          return {
            ...procurement,
            expect_receipt_date: expectReceiptDate,
          };
        }
        return {
          ...procurement,
        };
      });
      formMain?.setFieldsValue({ procurements });
      setExpectReceiptDates([...expectReceiptDates]);
    },
    [expectReceiptDates, formMain],
  );
  const handleSetProcurementTableByExpectedDate = (procurements: PurchaseProcument[]) => {
    const line_items: PurchaseOrderLineItem[] =
      (formMain?.getFieldsValue()?.line_items as PurchaseOrderLineItem[]) || [];
    const procurementsFilter = groupBy(procurements, ProcurementLineItemField.expect_receipt_date);
    const procurementsAllResult: Array<PurchaseProcument[]> = Object.values(procurementsFilter).map(
      (procurementAll, indexProcurementAll) => {
        const uuid = uuidv4();
        return [
          ...procurementAll.map((item) => {
            return {
              ...item,
              uuid: uuid,
              percent: item?.percent || 33.33,
              procurement_items: [
                ...item.procurement_items.map((procurementItem) => {
                  return {
                    ...procurementItem,
                    percent: item?.percent,
                    uuid: uuid + indexProcurementAll,
                  };
                }),
              ],
            };
          }),
        ];
      },
    );
    setProcurementsAll(procurementsAllResult);
    handleSetProcurementTableContext(procurements, line_items, procurementsAllResult);
  };
  const onAddExpectedDate = () => {
    if (procurementsAll.length > 0) {
      // số store trả về
      if (!expectReceiptDates.every((date) => date.date)) return;
      const uuid = uuidv4();
      const procurementItems = formMain?.getFieldValue(
        POField.line_items,
      ) as PurchaseProcumentLineItem[];
      const procurements: PurchaseProcument[] = formMain?.getFieldValue(
        POField.procurements,
      ) as PurchaseProcument[];
      const procurementAddDefault: PurchaseProcument[] = procurementsAll[0].map((procurement) => {
        const procurement_items = procurementItems.map((procurementItem) => {
          const uuid2 = uuidv4();
          const procurementItemIndex = procurements[0].procurement_items.findIndex(
            (item) => item.variant_id === procurementItem.variant_id,
          );
          if (procurementItemIndex === -1) {
            return {
              ...procurementItem,
              quantity: 0,
              id: uuid2,
              planned_quantity: 0,
              ordered_quantity: 0,
              accepted_quantity: 0,
              real_quantity: 0,
              stock_in_by: "",
              stock_in_date: "",
              activated_by: "",
              activated_date: "",
            };
          }
          return {
            ...procurements[0].procurement_items[procurementItemIndex],
            quantity: 0,
            id: uuid2,
            planned_quantity: 0,
            ordered_quantity: 0,
            accepted_quantity: 0,
            real_quantity: 0,
            stock_in_by: "",
            stock_in_date: "",
            activated_by: "",
            activated_date: "",
          };
        });
        return {
          ...procurement,
          id: 0,
          uuid,
          is_cancelled: false,
          created_date: ConvertDateToUtc(new Date(Date.now())) as any,
          updated_date: ConvertDateToUtc(new Date(Date.now())) as any,
          expect_receipt_date: "",
          procurement_items,
          code: "",
          status: ProcurementStatus.draft,
          stock_in_by: "",
          stock_in_date: "",
          activated_by: "",
          activated_date: "",
        };
      });
      procurementAddDefault.forEach((item: Partial<PurchaseProcument>) => {
        delete item.id;
        delete item.code;
        procurements.push({ ...item } as PurchaseProcument);
      });
      expectReceiptDates.push({
        ...procurementAddDefault[0],
        isAdd: true,
        date: "",
      });
      procurementTable.forEach((procurement, index) => {
        procurementTable[index].plannedQuantities.push(0);
        procurementTable[index].realQuantities.push(0);
        procurementTable[index].uuids.push(uuid);
      });
      formMain?.setFieldsValue({
        ["expectedDate" + (expectReceiptDates.length - 1)]: "",
      });
      formMain?.setFieldsValue({ procurements });
      setProcurementTable([...procurementTable]);
      setExpectReceiptDates([...expectReceiptDates]);
      handleSetRadio(expectReceiptDates);
      handleSetProcurementTableByExpectedDate(procurements);
    }
  };

  const onRemoveExpectedDate = () => {
    if (expectReceiptDates.length === 1) return;
    for (
      let indexExpectReceipt = expectReceiptDates.length - 1;
      indexExpectReceipt >= 0;
      indexExpectReceipt--
    ) {
      const procurements = formMain?.getFieldValue(POField.procurements) as PurchaseProcument[];
      let procurementsBackUp = [...procurements];
      let check = false;
      procurements.forEach((procurement, index) => {
        const status = procurements
          .filter(
            (procurementChildren) =>
              procurementChildren.uuid === expectReceiptDates[indexExpectReceipt].uuid,
          )
          .every((item) => item.status === ProcurementStatus.draft);
        if (status && indexExpectReceipt !== 0) {
          procurementsBackUp = procurementsBackUp.filter(
            (item) => item.uuid !== expectReceiptDates[indexExpectReceipt].uuid,
          );
          check = true;
        }
      });
      formMain?.setFieldsValue({
        [POField.procurements]: procurementsBackUp,
      });
      if (check) {
        expectReceiptDates.splice(indexExpectReceipt, 1);
        procurementTable.forEach((procurement, index) => {
          procurementTable[index].plannedQuantities.splice(indexExpectReceipt, 1);
          procurementTable[index].realQuantities.splice(indexExpectReceipt, 1);
          procurementTable[index].uuids.splice(indexExpectReceipt, 1);
        });
        handleSetRadio(expectReceiptDates);
        setExpectReceiptDates([...expectReceiptDates]);
        setProcurementTable([...procurementTable]);
        handleSetProcurementTableByExpectedDate(procurementsBackUp);
        return;
      }
    }
  };

  const title = useCallback(
    (date: IExpectReceiptDates, index: number, received: boolean, notReceived: boolean) => {
      if (!(received || notReceived) && isEditDetail) {
        formMain?.setFieldsValue({
          ["expectedDate" + index]: date.date,
        });
      }
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <StyledButton type="button">{index + 1}</StyledButton>
          {date.isAdd || (!(received || notReceived) && isEditDetail) ? (
            <Form.Item
              name={"expectedDate" + index}
              rules={[
                {
                  required: true,
                },
              ]}
              help={false}
            >
              <CustomDatePicker
                id={"expectedDate" + index}
                value={date.date}
                disableDate={(date) => date < moment().startOf("days")}
                format={DATE_FORMAT.DDMMYYY}
                style={{ width: "100%" }}
                placeholder="Ngày nhận dự kiến"
                onChange={(value) => {
                  onChangeExpectedDate(index, value);
                }}
              />
            </Form.Item>
          ) : (
            <>
              <span
                style={{
                  flex: "1",
                  textAlign: "center",
                }}
              >
                {date.date}
              </span>
              {notReceived && (
                <Tooltip title="Đã duyệt">
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginRight: "8px",
                    }}
                  >
                    <IConDivided />
                  </span>
                </Tooltip>
              )}
              {received && (
                <Tooltip title="Đã nhận">
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginRight: "8px",
                    }}
                  >
                    <IConPlan />
                  </span>
                </Tooltip>
              )}
            </>
          )}
        </div>
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onChangeExpectedDate, expectReceiptDates, isEditDetail],
  );

  // convert 3 đơn PO về 1 đơn PO và hiện thị table kế hoạch nhận hàng
  useEffect(() => {
    const result = formMain?.getFieldsValue()?.procurements
      ? (formMain?.getFieldsValue() as PurchaseOrder)
      : purchaseOrder;
    if (result?.procurements) {
      const procurementsFilter = groupBy(
        result?.procurements,
        ProcurementLineItemField.expect_receipt_date,
      );
      const procurementsAll: Array<PurchaseProcument[]> = Object.values(procurementsFilter).map(
        (procurementAll, indexProcurementAll) => {
          const uuid = uuidv4();
          return [
            ...procurementAll.map((item) => {
              return {
                ...item,
                uuid: uuid,
                percent: item?.percent || 33.33,
                procurement_items: [
                  ...item.procurement_items.map((procurementItem) => {
                    return {
                      ...procurementItem,
                      percent: item?.percent,
                      uuid: uuid + indexProcurementAll, // ada them vị trí của procuments
                    };
                  }),
                ],
              };
            }),
          ];
        },
      );
      const procurementsExpectReceiptDates = Object.keys(procurementsFilter).map(
        (procurementsExpectReceiptDate) => {
          const procurementSplit = procurementsAll.reduce((acc, val) => acc.concat(val), []);
          // purchaseOrder.procurements = procurementSplit;
          formMain?.setFieldsValue({
            procurements: procurementSplit,
          });

          const procurementFitterStatus = groupBy(
            procurementSplit.filter(
              (item) => item.expect_receipt_date === procurementsExpectReceiptDate,
            ),
            ProcurementLineItemField.status,
          );
          const status: string =
            Object.values(procurementFitterStatus)[0].length === procurementsAll[0].length
              ? (Object.keys(procurementFitterStatus)[0] as any)
              : ProcurementStatus.not_received;
          return {
            ...Object.values(procurementFitterStatus)[0][0],
            status,
            isAdd: false,
            date: procurementsExpectReceiptDate
              ? moment(procurementsExpectReceiptDate).format(DATE_FORMAT.DDMMYYY)
              : "",
          };
        },
      );
      handleSetProcurementTableContext(result.procurements, result.line_items, procurementsAll);
      setExpectReceiptDates(procurementsExpectReceiptDates);
      setProcurementsAll(procurementsAll);
      handleSetRadio(procurementsExpectReceiptDates);
    }
  }, [purchaseOrder]);

  useEffect(() => {
    const columns: Array<ICustomTableColumType<ProcurementTable>> =
      expectReceiptDates?.map((data, indexDate) => {
        const receivedOrNotReceived =
          data.status === ProcurementStatus.not_received ||
          data.status === ProcurementStatus.received;
        const notReceived = data.status === ProcurementStatus.not_received;
        const received = data.status === ProcurementStatus.received;
        return {
          title: title(data, indexDate, received, notReceived),
          align: "center",
          className: isEditDetail ? "custom-date" : "",
          width:
            receivedOrNotReceived || data.isAdd || (!receivedOrNotReceived && isEditDetail)
              ? 50
              : 40,
          render: (value, record, index) => {
            const real_quantity = record?.realQuantities?.length
              ? record.realQuantities[indexDate] === undefined
                ? undefined
                : record.realQuantities[indexDate] || 0
              : 0;
            const planned_quantity = record?.plannedQuantities?.length
              ? record.plannedQuantities[indexDate] === undefined
                ? undefined
                : record.plannedQuantities[indexDate] || 0
              : 0;
            const uuid = record?.uuids?.length ? record.uuids[indexDate] || "" : "";
            if (real_quantity === undefined || planned_quantity === undefined) return <></>;
            return (
              <>
                {data.isAdd ||
                (data.status === ProcurementStatus.draft &&
                  isEditDetail &&
                  !receivedOrNotReceived) ? (
                  <NumberInput
                    min={0}
                    value={planned_quantity}
                    onChange={(value) => onChangeNumber(index, indexDate, value || 0, uuid)}
                    format={(a: string) => formatCurrency(a)}
                    replace={(a: string) => replaceFormatString(a)}
                    maxLength={10}
                  />
                ) : (
                  <Row>
                    <Col span={12} style={{ textAlign: "end" }}>
                      <StyledSpanGreen notReceived={data.status === ProcurementStatus.not_received}>
                        {real_quantity}
                      </StyledSpanGreen>
                      /
                    </Col>
                    <Col span={12} style={{ textAlign: "start" }}>
                      <StyledSpan>{planned_quantity}</StyledSpan>
                    </Col>
                  </Row>
                )}
              </>
            );
          },
        };
      }) || [];
    setColumns(columns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expectReceiptDates, purchaseOrder?.procurements, title, isEditDetail, procurementTable]);
  useEffect(() => {
    return () => {
      setExpectReceiptDates([]);
    };
  }, []);

  // useEffect(() => {
  // handleSetProcurementTable();
  // }, [formMain?.getFieldValue(POField.line_items)])

  return (
    <StyledRowPoWareHouse gutter={24}>
      <Col span={ratio.span}>
        {" "}
        <Table
          className="product-table"
          rowKey={(record: PurchaseOrderLineItem) => (record.id ? record.id : record.temp_id)}
          rowClassName="product-table-row"
          dataSource={procurementTable}
          tableLayout="fixed"
          scroll={{ x: ratio.scroll }}
          pagination={false}
          columns={columns}
          summary={(data: readonly ProcurementTable[]) => {
            return (
              <Table.Summary>
                <Table.Summary.Row>
                  {expectReceiptDates?.map((procurement, index: number) => {
                    const totalPlannedQuantity = data.reduce((value, item) => {
                      return (
                        value +
                        (item?.plannedQuantities?.length ? item?.plannedQuantities[index] || 0 : 0)
                      );
                    }, 0);
                    const totalRealQuantity = data.reduce((value, item) => {
                      return (
                        value +
                        (item?.realQuantities?.length ? item?.realQuantities[index] || 0 : 0)
                      );
                    }, 0);
                    return (
                      <Table.Summary.Cell
                        align={procurement.isAdd ? "right" : "center"}
                        index={procurement.id}
                      >
                        <Row>
                          <StyledColSummary span={12} style={{ textAlign: "end", fontWeight: 700 }}>
                            <span>{formatCurrency(totalRealQuantity, ".")}</span>/
                          </StyledColSummary>
                          <StyledColSummary
                            span={12}
                            style={{ textAlign: "start", fontWeight: 700 }}
                          >
                            <span>{formatCurrency(totalPlannedQuantity, ".")}</span>
                          </StyledColSummary>
                        </Row>
                      </Table.Summary.Cell>
                    );
                  })}
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
        />
      </Col>
      {isEditDetail &&
        receive_status !== ProcumentStatus.FINISHED &&
        receive_status !== ProcumentStatus.CANCELLED && (
          <Col span={24 - ratio.span} style={{ padding: 0 }}>
            <ButtonRemove
              style={{
                marginTop: "12px",
                marginRight: "4px",
              }}
              onClick={onRemoveExpectedDate}
            />
            <ButtonAdd
              style={{
                marginTop: "4px",
              }}
              onClick={onAddExpectedDate}
            />
          </Col>
        )}
      <Form.Item noStyle hidden name={POField.procurements}>
        <Input />
      </Form.Item>
      <Form.Item noStyle hidden name={POField.line_items}>
        <Input />
      </Form.Item>
    </StyledRowPoWareHouse>
  );
};

const StyledButton = styled.button`
  padding: 2px 4px;
  border: none;
  background: rgb(42, 42, 134);
  border-radius: 2px;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 18px;
  color: rgb(255, 255, 255);
  height: fit-content;
  width: fit-content;
  margin-right: 4px;
`;

const StyledRowPoWareHouse = styled(Row)`
  .ant-form-item {
    margin-bottom: 0;
  }
  .custom-date {
    input,
    .ant-picker {
      height: 32px !important;
    }
  }
  .custom-date.ant-table-cell {
    padding: 0px 5px !important;
    min-height: 44px;
  }
  .ant-table-thead .custom-date.ant-table-cell {
    height: 44px;
  }
`;

const StyledSpanGreen = styled.span<{ notReceived: boolean }>`
  font-family: "Roboto";
  font-style: normal;
  font-weight: 500;
  font-size: 15px;
  line-height: 16px;
  color: ${(p: any) => (p.notReceived ? "#27AE60" : "#000000")};
`;

const StyledSpan = styled.span`
  font-family: "Roboto";
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 16px;
  color: #666666;
`;

const StyledColSummary = styled(Col)`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;
