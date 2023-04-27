import { Col, Form, Input, Row, Select, Table, Tooltip } from "antd";
import { FormInstance } from "antd/es/form/Form";
import CustomDatePicker from "component/custom/new-date-picker.custom";
import NumberInput from "component/custom/number-input.custom";
import ButtonAdd from "component/icon/ButtonAdd";
import { IConDivided } from "component/icon/Divided";
import { IConPlan } from "component/icon/Plan";
import { ICustomTableColumType } from "component/table/CustomTable";
import { AppConfig } from "config/app.config";
import { EnumOptionValueOrPercent } from "config/enum.config";
import { cloneDeep, groupBy } from "lodash";
import { ProcurementLineItemField } from "model/procurement/field";
import { POField } from "model/purchase-order/po-field";
import { POLineItemType, PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import { ProcurementTable, PurchaseOrder } from "model/purchase-order/purchase-order.model";
import {
  POProcumentField,
  PercentDate,
  PurchaseProcument,
  PurchaseProcumentLineItem,
} from "model/purchase-order/purchase-procument";
import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { PurchaseOrderCreateContext } from "screens/purchase-order/provider/purchase-order.provider";
import {
  changePODeliveryDate,
  getPercentMonth,
} from "service/purchase-order/purchase-order.service";
import styled from "styled-components";
import { callApiNative } from "utils/ApiUtils";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import { ProcumentStatus, ProcurementStatus } from "utils/Constants";
import { ConvertDateToUtc, DATE_FORMAT } from "utils/DateUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import { v4 as uuidv4 } from "uuid";
import DeliveryCarReceived from "assets/icon/delivery-car-received.svg";
import DeliveryCarAccepted from "assets/icon/delivery-car-accepted.svg";
import { HttpStatus } from "config/http-status.config";
import { hideLoading, showLoading } from "domain/actions/loading.action";
const DEFAULT_SPAN = window.screen.width <= 1360 ? 8 : window.screen.width <= 1600 ? 7 : 5;
const DEFAULT_SCROLL = 50;
const AMOUNT_COLUMNS = window.screen.width <= 1600 ? 3 : 5;

const { Option } = Select;
interface IExpectReceiptDates {
  status: string;
  isAdd: boolean;
  date: string;
  uuid: string;
  option: EnumOptionValueOrPercent;
  value: number;
  deliveryDate?: string;
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
    setDisabledDate,
    handleChangeProcument,
  } = useContext(PurchaseOrderCreateContext);
  const [columns, setColumns] = useState<Array<ICustomTableColumType<any>>>([]);
  const [expectReceiptDates, setExpectReceiptDates] = useState<Array<IExpectReceiptDates>>([]);
  const [ratio, setRatio] = useState({
    span: 0,
    scroll: DEFAULT_SCROLL,
  });
  //page hooks
  const dispatch = useDispatch();

  //page variable
  const receive_status = purchaseOrder.receive_status;

  const handleSetRadio = (expectReceiptDates: IExpectReceiptDates[]) => {
    const span =
      expectReceiptDates?.length === 1
        ? window.screen.width <= 1600
          ? 8
          : 6
        : expectReceiptDates?.length * DEFAULT_SPAN;
    setRatio({
      span: span <= 22 ? span : 22,
      scroll:
        expectReceiptDates.length > AMOUNT_COLUMNS
          ? expectReceiptDates.length * 150
          : DEFAULT_SCROLL,
    });
  };

  const handleSetQuantityWarehouses = (
    indexData: number,
    value: number,
    uuid: string,
    indexTable?: number,
  ) => {
    const procurementItemsIndex: PurchaseProcumentLineItem[] = procurementsAll
      .reduce((acc, val) => acc.concat(val), [])
      .reduce((acc, val) => acc.concat(val.procurement_items), [] as PurchaseProcumentLineItem[])

      .filter((procurementItems) => procurementItems.sku === procurementTable[indexData].sku)
      .filter((procurementTable) => procurementTable.uuid === uuid)
      .map((item) => {
        const quantity = Math.round(((item.percent || 0) * value) / 100);
        return {
          ...item,
          planned_quantity: quantity,
          quantity,
        };
      }); //uuid + index lấy uuid theo vị trí
    //trường hợp đặc biệt khi value = 1
    if (Number(value) === AppConfig.ESPECIALLY_VALUE_PO && procurementItemsIndex.length) {
      const index = procurementItemsIndex.findIndex((item) => item.percent);
      if (index >= 0) {
        procurementItemsIndex[index].planned_quantity = value;
        procurementItemsIndex[index].quantity = value;
      }
    }
    const procurements = formMain?.getFieldValue(POField.procurements) as PurchaseProcument[];
    const totalQuantityProcurementItemsIndex = procurementItemsIndex.reduce(
      (acc, ele) => acc + ele.quantity,
      0,
    );
    let checkQuantity = false;
    const procurementItemsResult = procurementItemsIndex.map((procurementItem, index) => {
      let quantity: number = procurementItem.quantity;
      if (
        totalQuantityProcurementItemsIndex !== procurementItem.quantity &&
        !checkQuantity &&
        procurementItem.percent
      ) {
        checkQuantity = true;
        quantity = value - (totalQuantityProcurementItemsIndex - procurementItem.quantity);
      }
      return {
        ...procurementItem,
        planned_quantity: quantity,
        quantity,
      };
    });
    procurements.forEach((procurement, index) => {
      procurementItemsResult.forEach((procurementItemIndex, indexProcurementItemsIndex) => {
        const indexProcurementItem = procurement.procurement_items.findIndex(
          (item) =>
            item.id === procurementItemIndex.id &&
            procurement.percent === procurementItemIndex.percent,
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
      [POField.procurements]: cloneDeep(procurements),
    });
  };

  const onChangeNumber = (indexData: number, index: number, value: number, uuid: string) => {
    procurementTable[indexData].plannedQuantities[index] = value;
    handleSetQuantityWarehouses(indexData, value, uuid + index, index);
    setProcurementTable([...procurementTable]);
  };

  const onChangeExpectedDate = useCallback(
    async (index: number, value?: string) => {
      if (!value) {
        onRemoveExpectedByDate(expectReceiptDates[index]);
        return;
      }
      const dataCheckDate = expectReceiptDates.map((item) => item.date);
      try {
        if (dataCheckDate.includes(value || "") && value) {
          expectReceiptDates[index].date = "";
          formMain?.setFieldsValue({
            ["expectedDate" + index]: undefined,
          });
          setExpectReceiptDates([...expectReceiptDates]);
          showError(`Ngày dự kiến ${value} đã tồn tại`);
          return;
        }
        setDisabledDate(true);
        const monthChange =
          new Date(moment(value, DATE_FORMAT.DDMMYYY).format(DATE_FORMAT.MM_DD_YYYY)).getMonth() +
          1;
        const lineItems = (
          (formMain?.getFieldValue(POField.line_items) as PurchaseOrderLineItem[]) || []
        ).filter((lineItem) => lineItem.type !== POLineItemType.SUPPLEMENT);
        const datePercents =
          ((await callApiNative({ isShowLoading: false }, dispatch, getPercentMonth, {
            sku: lineItems[0].sku.substring(0, 3),
          })) as PercentDate[]) || [];
        expectReceiptDates[index].date = value || "";
        const procurements: PurchaseProcument[] = (
          formMain?.getFieldValue(POField.procurements) as PurchaseProcument[]
        ).map((procurement) => {
          if (procurement.uuid === expectReceiptDates[index].uuid) {
            const expectReceiptDate = value
              ? ConvertDateToUtc(moment(value, DATE_FORMAT.DDMMYYY).format(DATE_FORMAT.MM_DD_YYYY))
              : "";
            const findStore = datePercents?.findIndex(
              (item) => item.store_id === procurement.store_id,
            );
            return {
              ...procurement,
              percent: findStore >= 0 ? datePercents[findStore].percent : procurement.percent,
              procurement_items: procurement.procurement_items.map((item) => {
                return {
                  ...item,
                  percent: findStore >= 0 ? datePercents[findStore].percent : procurement.percent,
                };
              }),
              expect_receipt_date: expectReceiptDate,
            };
          }
          return {
            ...procurement,
          };
        });
        setExpectReceiptDates([...expectReceiptDates]);
        setDisabledDate(false);
        formMain?.setFieldsValue({ procurements });
        formMain && handleChangeProcument(formMain);
      } catch {
        setDisabledDate(false);
      }
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
              percent: item?.percent || 0,
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

  const onAddExpectedDate = async () => {
    // if (procurementsAll.length > 0) {
    if (!expectReceiptDates.every((date) => date.date)) return;
    try {
      setDisabledDate(true);
      const uuid = uuidv4();
      expectReceiptDates.push({
        status: ProcurementStatus.draft,
        isAdd: true,
        uuid,
        date: "",
        option: EnumOptionValueOrPercent.PERCENT,
        value: 0,
      });
      formMain?.setFieldsValue({
        ["expectedDate" + (expectReceiptDates.length - 1)]: "",
      });
      setExpectReceiptDates([...expectReceiptDates]);
      handleSetRadio(expectReceiptDates);
      const lineItems = (
        (formMain?.getFieldValue(POField.line_items) as PurchaseOrderLineItem[]) || []
      ).filter((lineItem) => lineItem.type !== POLineItemType.SUPPLEMENT);

      const datePercents = await callApiNative(
        { isShowLoading: false },
        dispatch,
        getPercentMonth,
        {
          sku: lineItems[0].sku.substring(0, 3),
        },
      );
      // số store trả về
      const procurementItems = formMain?.getFieldValue(
        POField.line_items,
      ) as PurchaseProcumentLineItem[];
      const procurements: PurchaseProcument[] = formMain?.getFieldValue(
        POField.procurements,
      ) as PurchaseProcument[];
      const procurementAddDefault: PurchaseProcument[] = datePercents.map((datePercent: any) => {
        const uuidProcurement = uuidv4();
        const procurement_items = procurementItems.map((procurementItem) => {
          const uuid2 = uuidv4();
          const procurementItemIndex = procurements?.length
            ? procurements[0].procurement_items.findIndex(
                (item) => item.sku === procurementItem.sku,
              )
            : -1;
          const indexProcurementTable = procurementTable.findIndex(
            (item) => item.sku === procurementItem.sku,
          );
          const totalQuantity =
            procurementTable[indexProcurementTable]?.plannedQuantities.reduce(
              (total, quantity) => (total || 0) + (quantity || 0),
              0,
            ) || 0;
          const planned_quantity =
            totalQuantity >= procurementItem.quantity
              ? 0
              : Math.round(
                  ((procurementItem.quantity - totalQuantity) * (datePercent.percent || 0)) / 100,
                );

          if (procurementItemIndex === -1) {
            return {
              ...procurementItem,
              quantity: planned_quantity,
              id: uuid2,
              planned_quantity: planned_quantity,
              ordered_quantity: 0,
              accepted_quantity: 0,
              real_quantity: 0,
              stock_in_by: "",
              stock_in_date: "",
              activated_by: "",
              activated_date: "",
              totalPlannedQuantities: procurementItem.quantity - totalQuantity,
            };
          }
          return {
            ...procurements[0].procurement_items[procurementItemIndex],
            quantity: planned_quantity,
            id: uuid2,
            planned_quantity: planned_quantity,
            ordered_quantity: 0,
            accepted_quantity: 0,
            real_quantity: 0,
            stock_in_by: "",
            stock_in_date: "",
            activated_by: "",
            activated_date: "",
            totalPlannedQuantities: procurementItem.quantity - totalQuantity,
          };
        });
        return {
          id: uuidProcurement,
          uuid,
          is_cancelled: false,
          created_date: ConvertDateToUtc(new Date(Date.now())) as any,
          updated_date: ConvertDateToUtc(new Date(Date.now())) as any,
          expect_receipt_date: "",
          procurement_items,
          code: "",
          percent: datePercent.percent || 0,
          status: ProcurementStatus.draft,
          // sotre
          store_short_name: datePercent?.store_name || "",
          store: datePercent?.store_name || "",
          store_id: datePercent?.store_id,
          stock_in_by: "",
          stock_in_date: "",
          activated_by: "",
          activated_date: "",
        };
      });
      const procurementAddDefaultAll = procurementAddDefault.reduce(
        (acc, val) => acc.concat(val.procurement_items),
        [] as PurchaseProcumentLineItem[],
      );
      procurementItems.forEach((procurementItem) => {
        const procurementItemFilter = procurementAddDefaultAll.filter(
          (item) => item.sku === procurementItem.sku,
        );
        const totalPlannedQuantitiesProcument = procurementItemFilter.reduce(
          (total, ele) => total + ele.planned_quantity,
          0,
        );
        //@ts-ignore
        const totalPlannedQuantities = procurementItemFilter[0].totalPlannedQuantities;
        const planned_quantity = totalPlannedQuantities - totalPlannedQuantitiesProcument;
        if (planned_quantity !== 0) {
          const indexProcumentItem = procurementAddDefault[0].procurement_items.findIndex(
            (item) => item.sku === procurementItem.sku,
          );
          const checkPlannedQuantity =
            procurementAddDefault[0].procurement_items[indexProcumentItem].planned_quantity +
            planned_quantity;
          const checkQuantity =
            procurementAddDefault[0].procurement_items[indexProcumentItem].quantity +
            planned_quantity;

          procurementAddDefault[0].procurement_items[indexProcumentItem].planned_quantity =
            checkPlannedQuantity >= 0 ? checkPlannedQuantity : 0;
          procurementAddDefault[0].procurement_items[indexProcumentItem].quantity =
            checkQuantity >= 0 ? checkQuantity : 0;
        }
      });
      procurementAddDefault.forEach((item: Partial<PurchaseProcument>) => {
        procurements.push({ ...item } as PurchaseProcument);
      });
      formMain?.setFieldsValue({ procurements });
      handleSetProcurementTableByExpectedDate(procurements);
      setDisabledDate(false);
    } catch {
      setDisabledDate(false);
    }

    // }
  };

  const onRemoveExpectedByDate = (expectReceiptDate: IExpectReceiptDates) => {
    if (expectReceiptDates.length === 1) return;
    const procurements = formMain?.getFieldValue(POField.procurements) as PurchaseProcument[];
    let procurementsBackUp = [...procurements];
    const indexExpectReceipt = expectReceiptDates.findIndex(
      (item) => item.uuid === expectReceiptDate.uuid,
    );
    procurementsBackUp = procurementsBackUp.filter((item) => item.uuid !== expectReceiptDate.uuid);
    formMain?.setFieldsValue({
      [POField.procurements]: procurementsBackUp,
    });
    expectReceiptDates.splice(indexExpectReceipt, 1);
    formMain?.setFieldsValue({
      ["expectedDate" + (expectReceiptDates.length - 1)]: "",
    });
    handleSetRadio(expectReceiptDates);
    setExpectReceiptDates([...expectReceiptDates]);
    handleSetProcurementTableByExpectedDate(procurementsBackUp);
  };

  const onChangeExpectedNumber = (index: number, value: number | null) => {
    expectReceiptDates[index].value = value || 0;
    const totalExpectedDate = expectReceiptDates.reduce((sum, date) => sum + date.value, 0);
    const isCheckOneHundredPercent =
      totalExpectedDate === AppConfig.ONE_HUNDRED_PERCENT &&
      expectReceiptDates.every((item) => item.option === EnumOptionValueOrPercent.PERCENT);

    procurementTable.forEach((item, indexItem) => {
      if (expectReceiptDates[index].option === EnumOptionValueOrPercent.PERCENT) {
        const quantityLineItems = Number(procurementTable[indexItem].quantityLineItems) || 0;
        let valueExpectedDate = quantityLineItems;
        expectReceiptDates.forEach((item, indexDate) => {
          if (item.status !== ProcurementStatus.draft) {
            valueExpectedDate -= procurementTable[indexItem].plannedQuantities[indexDate] || 0;
          }
        });
        const valueExpectedDateItem =
          valueExpectedDate >= 0 ? Math.floor((valueExpectedDate * (value || 0)) / 100) : 0;
        procurementTable[indexItem].plannedQuantities[index] = valueExpectedDateItem;
        const totalValueExpectedDateItem =
          procurementTable[indexItem].plannedQuantities.reduce(
            (sum, ele) => (sum || 0) + (ele || 0),
            0,
          ) || 0;
        if (isCheckOneHundredPercent && totalValueExpectedDateItem < quantityLineItems) {
          procurementTable[indexItem].plannedQuantities[index] =
            quantityLineItems - (totalValueExpectedDateItem - valueExpectedDateItem);
        }
      } else {
        procurementTable[indexItem].plannedQuantities[index] = value || 0;
      }
      handleSetQuantityWarehouses(
        indexItem,
        procurementTable[indexItem].plannedQuantities[index] || 0,
        procurementTable[indexItem].uuids[index] + index,
      );
    });
    setExpectReceiptDates([...expectReceiptDates]);
    setProcurementTable([...procurementTable]);
  };

  const onChangeOptionExpected = (value: EnumOptionValueOrPercent, index: number) => {
    expectReceiptDates[index].option = value;
    setExpectReceiptDates([...expectReceiptDates]);
  };

  const changeDeliveryDate = async (value: string, date: IExpectReceiptDates) => {
    dispatch(showLoading());
    try {
      const procurements: Array<PurchaseProcument> = purchaseOrder.procurements.filter(
        (pr: PurchaseProcument) => {
          const expectedDate = moment(pr.expect_receipt_date).format(DATE_FORMAT.DDMMYYY);
          return expectedDate === date.date && pr.status !== ProcumentStatus.CANCELLED;
        },
      );
      const prIds = procurements.map((el: PurchaseProcument) => el.id);
      const receiptDateArr = cloneDeep(expectReceiptDates);
      const findReceiptDateIdx = receiptDateArr.findIndex(
        (el: IExpectReceiptDates) => el.date === date.date,
      );
      const data = moment(value, "DD/MM/YYYY HH:mm").utc(true);
      const response = await changePODeliveryDate(purchaseOrder.id, {
        delivery_date: data,
        procurement_ids: prIds,
      });
      const newProcurements = purchaseOrder.procurements.map((pr: PurchaseProcument) => {
        if (procurements.find((el: PurchaseProcument) => pr.id === el.id)) {
          return {
            ...pr,
            delivery_date: moment(value, DATE_FORMAT.DDMMYYY).format("YYYY-MM-DD[T]HH:mm:ss.SSSZ"),
          };
        } else {
          return { ...pr };
        }
      });
      if (findReceiptDateIdx !== -1 && response.code === HttpStatus.SUCCESS) {
        receiptDateArr[findReceiptDateIdx].deliveryDate = value;
        setExpectReceiptDates(receiptDateArr);
        formMain?.setFieldsValue({ ...purchaseOrder, procurements: newProcurements });
        showSuccess("Cập nhật ngày hàng về thành công");
      } else if (!response.data && response.errors.length > 0) {
        response.errors.forEach((err: string) => showError(err));
      }
    } catch (err) {
      showSuccess("Đã có lỗi xảy ra!");
    } finally {
      dispatch(hideLoading());
    }
  };

  const title = useCallback(
    (date: IExpectReceiptDates, index: number, received: boolean, notReceived: boolean) => {
      if (date.status === ProcumentStatus.DRAFT && isEditDetail) {
        formMain?.setFieldsValue({
          ["expectedDate" + index]: date.date,
        });
      }
      return (
        <StyleHeader>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            {date.status === ProcumentStatus.DRAFT ? null : date.deliveryDate ? (
              <Tooltip title={date.deliveryDate}>
                <img src={DeliveryCarReceived} alt="delivery-car" />
              </Tooltip>
            ) : (
              <StyledCustomDatePicker>
                <span className="deliver-date-input">
                  <span className="deliver-date-icon">
                    <img src={DeliveryCarAccepted} alt="delivery-car" />
                  </span>
                  <CustomDatePicker
                    id={"expectedDate" + index}
                    format={DATE_FORMAT.DDMMYYY}
                    showTime={{ format: "HH:mm", defaultValue: moment("00:00", "HH:mm") }}
                    showToday
                    placeholder=""
                    onChange={(value) => {
                      if (!value) return;
                      changeDeliveryDate(value, date);
                    }}
                  />
                </span>
              </StyledCustomDatePicker>
            )}

            {date.isAdd || (date.status === ProcumentStatus.DRAFT && isEditDetail) ? (
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
                  disableDate={(date) => date < moment().startOf("days")} // nhớ sửa lại ngày cho đúng
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
                <span>{date.date}</span>

                {date.status === ProcumentStatus.NOT_RECEIVED && (
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
                {date.status === ProcumentStatus.RECEIVED && (
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
          {date.isAdd ||
            (date.status === ProcumentStatus.DRAFT && isEditDetail && (
              <Row justify="end" style={{ margin: "4px 0", marginLeft: "20px" }}>
                <Col span={24}>
                  <Input.Group compact style={{ display: "flex" }}>
                    <Form.Item style={{ marginBottom: "0", flex: "1", display: "flex" }}>
                      <NumberInput
                        size="small"
                        min={0}
                        className="input-number"
                        value={date.value}
                        onChange={(value) => {
                          onChangeExpectedNumber(index, value);
                        }}
                      />
                    </Form.Item>
                    <Select
                      defaultValue={EnumOptionValueOrPercent.PERCENT}
                      value={date.option}
                      style={{ width: 60 }}
                      onChange={(value) => {
                        onChangeOptionExpected(value, index);
                      }}
                    >
                      <Option value={EnumOptionValueOrPercent.PERCENT}>
                        {EnumOptionValueOrPercent.PERCENT}
                      </Option>
                      <Option value={EnumOptionValueOrPercent.SL}>
                        {EnumOptionValueOrPercent.SL}
                      </Option>
                    </Select>
                  </Input.Group>
                </Col>
              </Row>
            ))}
        </StyleHeader>
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      onChangeExpectedDate,
      expectReceiptDates,
      isEditDetail,
      purchaseOrder,
      procurementTable,
      formMain?.getFieldValue(POField.procurements),
    ],
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

      const procurementsExpectReceiptDates = Object.keys(procurementsFilter).map(
        (procurementsExpectReceiptDate) => {
          const procurementFitterStatus = groupBy(
            result?.procurements.filter(
              (item) => item.expect_receipt_date === procurementsExpectReceiptDate,
            ),
            ProcurementLineItemField.status,
          );
          let status: string = "";

          const statues = Object.keys(procurementFitterStatus);
          if (
            statues.every(
              (e: string) => e !== ProcurementStatus.draft && e !== ProcurementStatus.received,
            )
          ) {
            status = ProcurementStatus.not_received;
          } else if (statues.some((e: string) => e === ProcurementStatus.received)) {
            status = ProcurementStatus.received;
          } else {
            status = ProcurementStatus.draft;
          }
          const procurementsDeliverDate = groupBy(
            result?.procurements.filter(
              (item) => item.expect_receipt_date === procurementsExpectReceiptDate,
            ),
            POProcumentField.delivery_date,
          );
          const deliverDates = Object.keys(procurementsDeliverDate);
          let deliverDateValue = "";
          if (
            Object.values(procurementsDeliverDate)[0].length ===
              procurementsFilter[procurementsExpectReceiptDate]?.length &&
            !deliverDates.includes("null")
          ) {
            deliverDateValue = moment(deliverDates[0]).format(DATE_FORMAT.DDMMYYY);
          } else if (deliverDates.length > 1 && deliverDates.includes("null")) {
            const filterDeliverDate = deliverDates.filter((date: string) => date !== "null");
            deliverDateValue =
              filterDeliverDate.length > 0
                ? moment(filterDeliverDate[0]).format(DATE_FORMAT.DDMMYYY)
                : "";
          }
          return {
            uuid:
              Object.values(procurementFitterStatus)[0]?.length > 0
                ? Object.values(procurementFitterStatus)[0][0]?.uuid || ""
                : "",
            status,
            isAdd: false,
            date: procurementsExpectReceiptDate
              ? moment(procurementsExpectReceiptDate).format(DATE_FORMAT.DDMMYYY)
              : "",
            option: EnumOptionValueOrPercent.PERCENT,
            value: 0,
            deliveryDate: deliverDateValue,
          };
        },
      );
      setExpectReceiptDates(procurementsExpectReceiptDates);
      handleSetRadio(procurementsExpectReceiptDates);
    }
  }, [purchaseOrder, formMain, procurementsAll]);

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
          width: receivedOrNotReceived ? 50 : 40,
          render: (value, record, index) => {
            const real_quantity = record?.realQuantities?.length
              ? //@ts-ignore
                record.realQuantities[indexDate] === NaN
                ? NaN
                : record.realQuantities[indexDate] || 0
              : 0;
            const planned_quantity = record?.plannedQuantities?.length
              ? //@ts-ignore
                record.plannedQuantities[indexDate] === NaN
                ? NaN
                : record.plannedQuantities[indexDate] || 0
              : 0;
            const uuid = record?.uuids?.length ? record.uuids[indexDate] || "" : "";
            //@ts-ignore
            if (real_quantity === NaN || planned_quantity === NaN) return <></>;
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
  }, [expectReceiptDates, purchaseOrder, title, isEditDetail, procurementTable]);
  useEffect(() => {
    return () => {
      setExpectReceiptDates([]);
    };
  }, []);

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
          bordered
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
                        index={index}
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
            <ButtonAdd
              style={{
                marginTop: "4px",
              }}
              onClick={onAddExpectedDate}
            />
          </Col>
        )}

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
  /* .ant-table-thead {
    position: sticky !important;
    top: 55px;
    z-index: 100;
  } */

  .ant-picker-clear {
    margin-right: 18px;
    padding-bottom: 38px;
    background: transparent;
    @media screen and (max-width: 1550px) {
      margin-right: 18px;
    }
  }
`;

const StyledCustomDatePicker = styled.span`
  margin-right: 5px;
  .deliver-date-input {
    position: relative;
  }
  .deliver-date-icon {
    position: absolute;
    top: -2px;
  }
  .deliver-date-input > .ant-picker {
    width: 0px;
    background: transparent;
    border: none;
    box-shadow: none;
    cursor: pointer;
  }
  .ant-picker-input > input {
    color: transparent;
    caret-color: transparent;
    cursor: pointer;
  }
  .anticon-close-circle {
    display: none;
  }
  .ant-picker-suffix {
    display: none;
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

const StyleHeader = styled.div`
  .ant-input.ant-input-sm.input-number,
  .ant-select-selector {
    height: 32px !important;
  }
  .ant-select-selector {
    align-items: center;
  }
  .ant-select-selection-item {
    font-size: 12px !important;
  }
`;
