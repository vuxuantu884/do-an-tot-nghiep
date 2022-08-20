import { Col, Form, Input, Row, Select, Table } from "antd";
import CustomDatePicker from "component/custom/new-date-picker.custom";
import ButtonAdd from "component/icon/ButtonAdd";
import { PODataSourceGrid, POExpectedDate } from "model/purchase-order/purchase-order.model";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { ICustomTableColumType } from "screens/ecommerce/table/CustomTable";
import styled from "styled-components";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import {
  INITIAL_EXPECTED_DATE,
  PurchaseOrderCreateContext,
} from "../provider/purchase-order.provider";
import NumberInput from "component/custom/number-input.custom";
import { FormInstance } from "antd/es/form/Form";
import { Link } from "react-router-dom";
import UrlConfig from "config/url.config";
import { showError } from "utils/ToastUtils";
import ButtonRemove from "component/icon/ButtonRemove";
import { EnumOptionValueOrPercent } from "config/enum.config";
import { AppConfig } from "config/app.config";

const { Option } = Select;
const DEFAULT_SPAN = 9;

interface Props {
  form: FormInstance;
}

export const PoPrTable = (props: Props) => {
  const { form } = props;
  const { procurementTableData, expectedDate, setExpectedDate, setProcurementTableData } =
    useContext(PurchaseOrderCreateContext);
  const [settingTable, setSettingTable] = useState(DEFAULT_SPAN);
  const [dataSource, setDataSource] = useState<PODataSourceGrid[]>([]);

  //page variable
  const defaultColumns: Array<ICustomTableColumType<any>> = [
    {
      title: "Mã sản phẩm",
      align: "center",
      width: 55,
      dataIndex: "sku",
      render: (text: string, row: PODataSourceGrid, index: number) => {
        return (
          <Link to={`${UrlConfig.PRODUCT}/${row.productId}${UrlConfig.VARIANTS}/${row.variantId}`}>
            {text ? text + (row.color_code ? "-" + row.color_code : "") : row.color_code}
          </Link>
        );
      },
      fixed: "left",
    },
    {
      title: "SL đặt hàng",
      align: "center",
      width: 50,
      dataIndex: "quantity",
      fixed: "left",
      render: (quantity: string) => {
        return formatCurrency(quantity);
      },
    },
  ];
  const [columns, setColumn] = useState<Array<ICustomTableColumType<any>>>(defaultColumns);

  const Summary = (data: Readonly<PODataSourceGrid[]>) => {
    let ordered_quantity = 0;
    data.forEach((item: PODataSourceGrid) => {
      ordered_quantity += Number(item.quantity) || 0;
    });
    return (
      <Table.Summary>
        <Table.Summary.Row>
          <Table.Summary.Cell align="right" colSpan={1} index={0}>
            <div style={{ fontWeight: 700 }}>Tổng</div>
          </Table.Summary.Cell>
          <Table.Summary.Cell align="center" index={1}>
            <div style={{ fontWeight: 700 }}>{formatCurrency(ordered_quantity, ".")}</div>
          </Table.Summary.Cell>
          {expectedDate.map((itemExpectedDate, index) => {
            let real_quantity = 0;
            data.forEach((item: PODataSourceGrid) => {
              real_quantity += item.expectedDate[index]?.value || 0;
            });
            return (
              <Table.Summary.Cell align="right" index={1}>
                <div style={{ fontWeight: 700 }}>{formatCurrency(real_quantity, ".")}</div>
              </Table.Summary.Cell>
            );
          })}
        </Table.Summary.Row>
      </Table.Summary>
    );
  };

  const handleSetRadio = (expectReceiptDates: POExpectedDate[]) => {
    const span =
      expectReceiptDates?.length === 1
        ? DEFAULT_SPAN
        : DEFAULT_SPAN + expectReceiptDates?.length * 2;
    setSettingTable(span <= 23 ? span : 23);
  };

  const onAddExpectedDate = () => {
    if (!expectedDate.every((date) => date.date)) return;
    expectedDate.push({
      date: "",
      value: 0,
      option: EnumOptionValueOrPercent.PERCENT,
    });
    procurementTableData.forEach((item, index) => {
      const total = procurementTableData[index].expectedDate.reduce(
        (sum, date) => sum + (date.value || 0),
        0,
      );
      if (total >= Number(procurementTableData[index].quantity || 0)) {
        procurementTableData[index].expectedDate.push({
          date: "",
          value: 0,
          option: EnumOptionValueOrPercent.PERCENT,
        });
      } else {
        procurementTableData[index].expectedDate.push({
          date: "",
          value: (Number(procurementTableData[index]?.quantity) || 0) - total,
          option: EnumOptionValueOrPercent.PERCENT,
        });
      }
    });
    setExpectedDate([...expectedDate]);
    setProcurementTableData([...procurementTableData]);
  };

  const onRemoveExpectedDate = () => {
    if (expectedDate.length === 1) return;
    form.setFieldsValue({
      ["expectedDate" + (expectedDate.length - 1)]: "",
    });
    expectedDate.pop();
    procurementTableData.forEach((item, index) => {
      procurementTableData[index].expectedDate.pop();
    });

    setExpectedDate([...expectedDate]);
    setProcurementTableData([...procurementTableData]);
  };

  const onChangeExpectedDate = (index: number, value?: string) => {
    if (!value) return;
    const dateCheck = expectedDate.map((date) => date.date);
    const indexDateCheck = dateCheck.findIndex((date) => date === value);
    if (indexDateCheck !== -1 && indexDateCheck !== index) {
      expectedDate[index].date = "";
      form?.setFieldsValue({
        ["expectedDate" + index]: undefined,
      });
      setExpectedDate([...expectedDate]);
      showError(`Ngày dự kiến ${value} đã tồn tại`);
      return;
    }
    expectedDate[index].date = value;
    procurementTableData.forEach((item, indexItem) => {
      procurementTableData[indexItem].expectedDate[index].date = value || "";
      const expectedDateSortItem = procurementTableData[indexItem].expectedDate;
      expectedDateSortItem.sort((pre, next) => {
        if (!pre.date || !next.date) return 0;
        const preDate = new Date(moment(pre.date, "DD/MM/YYYY").format("MM-DD-YYYY"));
        const nextDate = new Date(moment(next.date, "DD/MM/YYYY").format("MM-DD-YYYY"));
        return preDate.getTime() - nextDate.getTime() > 0 ? 1 : -1;
      });
      procurementTableData[indexItem].expectedDate = [...expectedDateSortItem];
    });
    const expectedDateSort = expectedDate.sort((pre, next) => {
      if (!pre.date || !next.date) return 0;
      const preDate = new Date(moment(pre.date, "DD/MM/YYYY").format("MM-DD-YYYY"));
      const nextDate = new Date(moment(next.date, "DD/MM/YYYY").format("MM-DD-YYYY"));
      return preDate.getTime() - nextDate.getTime() > 0 ? 1 : -1;
    });
    expectedDateSort.forEach((item, index) => {
      form.setFieldsValue({
        ["expectedDate" + index]: item.date,
      });
    });
    setExpectedDate([...expectedDateSort]);
    setProcurementTableData([...procurementTableData]);
  };

  const onChangeExpectedNumber = (index: number, value: number | null) => {
    expectedDate[index].value = value || 0;
    const totalExpectedDate = expectedDate.reduce((sum, date) => sum + date.value, 0);
    const isCheckOneHundredPercent =
      totalExpectedDate === AppConfig.ONE_HUNDRED_PERCENT &&
      expectedDate.every((item) => item.option === EnumOptionValueOrPercent.PERCENT);
    procurementTableData.forEach((item, indexItem) => {
      if (
        procurementTableData[indexItem].expectedDate[index].option ===
        EnumOptionValueOrPercent.PERCENT
      ) {
        const valueExpectedDate = Number(procurementTableData[indexItem].quantity) || 0;
        const valueExpectedDateItem = Math.floor((valueExpectedDate * (value || 0)) / 100);
        procurementTableData[indexItem].expectedDate[index]["value"] = valueExpectedDateItem;
        const totalValueExpectedDateItem = procurementTableData[indexItem].expectedDate.reduce(
          (sum, date) => sum + date.value,
          0,
        );
        if (isCheckOneHundredPercent && totalValueExpectedDateItem < valueExpectedDate) {
          procurementTableData[indexItem].expectedDate[index]["value"] =
            valueExpectedDate - (totalValueExpectedDateItem - valueExpectedDateItem);
        }
      } else {
        procurementTableData[indexItem].expectedDate[index]["value"] = value || 0;
      }
    });
    console.log(expectedDate);
    console.log(procurementTableData.filter((item) => item.quantity));

    setExpectedDate([...expectedDate]);
    setProcurementTableData([...procurementTableData]);
  };

  const onChangeAmountExpectedNumber = (value: number | null, index: number, variantID: number) => {
    const dataClone = [...procurementTableData];
    const indexRow = dataClone.findIndex((data) => data.variantId === variantID);
    if (indexRow >= 0) {
      dataClone[indexRow].expectedDate[index].value = value || 0;
    }
    setProcurementTableData([...dataClone]);
  };

  const onChangeOptionExpected = (value: EnumOptionValueOrPercent, index: number) => {
    expectedDate[index].option = value;
    procurementTableData.forEach((item, indexItem) => {
      procurementTableData[indexItem].expectedDate[index].option = value;
    });
    setProcurementTableData([...procurementTableData]);
    setExpectedDate([...expectedDate]);
  };

  const titleColumn = (index: number) => {
    return (
      <React.Fragment key={index}>
        <Row align="middle" style={{ marginBottom: "4px" }}>
          <Col span={3} style={{ display: "flex", justifyContent: "center" }}>
            <StyledButton type="button">{index + 1}</StyledButton>
          </Col>
          <Col span={21}>
            <Form.Item
              name={"expectedDate" + index}
              style={{ marginBottom: "0", flex: "1" }}
              rules={[
                {
                  required: true,
                },
              ]}
              help={false}
            >
              <CustomDatePicker
                id={"expectedDate" + index}
                value={expectedDate[index].date}
                disableDate={(date) => date < moment().startOf("days")}
                format={DATE_FORMAT.DDMMYYY}
                style={{ width: "100%" }}
                placeholder="Ngày nhận dự kiến"
                onChange={(value) => {
                  onChangeExpectedDate(index, value);
                }}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row align="middle">
          {/* lấy khoang trong bang ben tren */}
          <Col span={3} style={{ display: "flex", justifyContent: "center" }}>
            <StyledButton type="button" style={{ margin: "0 4px", opacity: "0" }}>
              1
            </StyledButton>
          </Col>
          <Col span={21}>
            <Input.Group compact style={{ display: "flex" }}>
              <Form.Item style={{ marginBottom: "0", flex: "1", display: "flex" }}>
                <NumberInput
                  size="small"
                  min={0}
                  className="input-number"
                  value={expectedDate[index].value}
                  onChange={(value) => {
                    onChangeExpectedNumber(index, value);
                  }}
                />
              </Form.Item>
              <Select
                defaultValue={EnumOptionValueOrPercent.PERCENT}
                value={expectedDate[index].option}
                style={{ width: 60 }}
                onChange={(value) => {
                  onChangeOptionExpected(value, index);
                }}
              >
                <Option value={EnumOptionValueOrPercent.PERCENT}>
                  {EnumOptionValueOrPercent.PERCENT}
                </Option>
                <Option value={EnumOptionValueOrPercent.SL}>{EnumOptionValueOrPercent.SL}</Option>
              </Select>
            </Input.Group>
          </Col>
        </Row>
      </React.Fragment>
    );
  };

  useEffect(() => {
    const dataSource = procurementTableData.filter((item) => item.quantity);
    setDataSource(dataSource);
  }, [procurementTableData]);

  useEffect(() => {
    handleSetRadio(expectedDate);
  }, [expectedDate]);

  useEffect(() => {
    const titleColumns: ICustomTableColumType<any>[] = expectedDate.map((date, index) => {
      return {
        title: titleColumn(index),
        align: "right",
        dataIndex: "expectedDate",
        width: 25,
        render: (expectedDate: POExpectedDate[], row: PODataSourceGrid, indexRow: number) => {
          const valueRow = row.expectedDate[index]?.value || 0;
          return (
            <NumberInput
              min={0}
              value={valueRow}
              onChange={(value) => onChangeAmountExpectedNumber(value, index, row.variantId)}
              format={(a: string) => formatCurrency(a)}
              replace={(a: string) => replaceFormatString(a)}
              maxLength={10}
              key={index}
            />
          );
        },
      };
    });
    const contactColumns = defaultColumns.concat(titleColumns);
    setColumn([...contactColumns]);
  }, [expectedDate, procurementTableData]);

  useEffect(() => {
    return () => {
      setExpectedDate([
        {
          date: "",
          value: 0,
          option: EnumOptionValueOrPercent.PERCENT,
        },
      ]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <StyledPoPrTable>
      {" "}
      <Row gutter={24}>
        <Col span={settingTable} className="custom-table">
          <Table
            className="yody-table-product-search small-padding"
            rowKey={"sku"}
            rowClassName="product-table-row"
            dataSource={dataSource}
            pagination={false}
            size="middle"
            columns={columns}
            summary={Summary}
          />
        </Col>
        <Col span={24 - settingTable} style={{ paddingRight: "0", paddingLeft: "0" }}>
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
      </Row>
    </StyledPoPrTable>
  );
};

const StyledPoPrTable = styled.div``;

const StyledButton = styled.button`
  padding: 2px 4px;
  border: none;
  background: #2a2a86;
  border-radius: 2px;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 18px;
  color: #ffffff;
  height: fit-content;
  width: fit-content;
`;
