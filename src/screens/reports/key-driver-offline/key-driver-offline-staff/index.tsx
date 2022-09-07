import { CheckSquareOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Spin, Table, Tooltip } from "antd";
import { ColumnGroupType, ColumnsType, ColumnType } from "antd/lib/table";
import classnames from "classnames";
import ContentContainer from "component/container/content.container";
import CustomDatePicker from "component/custom/new-date-picker.custom";
import NumberInput from "component/custom/number-input.custom";
import { AppConfig } from "config/app.config";
import UrlConfig from "config/url.config";
import { debounce } from "lodash";
import { KeyDriverDimension, KeyDriverField, KeyDriverTarget } from "model/report";
import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";
import { DATE_FORMAT } from "utils/DateUtils";
import {
  calculateDayRateUtil,
  calculateDayTargetUtil,
  calculateKDAverageCustomerSpent,
  calculateKDAverageOrderValue,
  calculateKDConvertionRate,
  calculateMonthRateUtil,
  nonAccentVietnameseKD,
  updateTargetDayUtil,
  updateTargetMonthUtil,
} from "utils/KeyDriverOfflineUtils";
import StaffsSelect from "../components/staffs-select";
import {
  keyDriverOfflineTemplateData,
  loadingMessage,
} from "../constant/key-driver-offline-template-data";
import useFetchStoresCustomerVisitors from "../hooks/useFetchStoresCustomerVisitors";
import useFetchStoresKDOfflineTotalSales from "../hooks/useFetchStoresKDOfflineTotalSales";
import useFetchStoresKDTargetDay from "../hooks/useFetchStoresKDTargetDay";
import useFetchStoresKeyDriverTarget from "../hooks/useFetchStoresKeyDriverTarget";
import useFetchStoresOfflineOnlineTotalSales from "../hooks/useFetchStoresOfflineOnlineTotalSales";
import useFetchStoresOfflineTotalSalesLoyalty from "../hooks/useFetchStoresOfflineTotalSalesLoyalty";
import useFetchStoresOfflineTotalSalesPotential from "../hooks/useFetchStoresOfflineTotalSalesPotential";
import useFetchStoresProductTotalSales from "../hooks/useFetchStoresProductTotalSales";
import { KeyDriverOfflineStyle } from "../index.style";
import KDOfflineStoresProvider, {
  KDOfflineStoresContext,
} from "../provider/kd-offline-stores-provider";

type RowData = {
  name: string;
  method: string;
  hideInput?: boolean;
  key: string;
  children?: Array<RowData>;
  [key: string]: any;
};

type RowRender = {
  value: any;
  record: RowData;
  index?: number;
  defaultValue?: number;
  column?: string;
  type: string;
  time: "month" | "day";
  onChange?: (value: number, row: RowRender) => void;
  suffix?: string;
};
const baseColumns: any = [
  {
    title: "CHỈ SỐ KEY",
    key: "name",
    dataIndex: "name",
    width: 250,
    fixed: "left",
    render: (text: string, record: any) => {
      return (
        <Tooltip className="text-truncate-2 key-cell" title={record.method}>
          {text?.toUpperCase()}
        </Tooltip>
      );
    },
  },
];

function CellInput(props: RowRender) {
  const { setKDTarget } = useContext(KDOfflineStoresContext);
  const { onChange, record, value, type, time, suffix } = props;
  const { key } = record;

  return (
    <NumberInput
      className="input-number"
      isFloat={true}
      value={value}
      format={(a: string) => formatCurrency(a)}
      replace={(a: string) => replaceFormatString(a)}
      suffix={suffix}
      onChange={debounce((inputValue: number | null) => {
        const tmpValue: number = inputValue || 0;

        onChange?.(tmpValue, props);

        setKDTarget((prev: KeyDriverTarget[]) => {
          const departmentIdx = prev.findIndex(
            (item) => item.department === type && item.time === time,
          );
          if (departmentIdx !== -1) {
            const keyDriverIdx = prev[departmentIdx].key_drivers.findIndex(
              (item) => item.key_driver === key,
            );
            if (keyDriverIdx !== -1) {
              prev[departmentIdx].key_drivers[keyDriverIdx].value = tmpValue;
            } else {
              prev[departmentIdx].key_drivers.push({
                key_driver: key,
                value: tmpValue,
              });
            }
          } else {
            prev.push({
              department: type,
              key_drivers: [
                {
                  key_driver: key,
                  value: tmpValue,
                },
              ],
              time,
            });
          }
          return prev;
        });
      }, AppConfig.TYPING_TIME_REQUEST)}
    />
  );
}

function KeyDriverOfflineStaff() {
  const [form] = Form.useForm();
  const history = useHistory();
  // get query from url
  const query = new URLSearchParams(useLocation().search);
  const date = query.get("date");
  const day = date
    ? moment(date).format(DATE_FORMAT.DDMMYYY)
    : moment().format(DATE_FORMAT.DDMMYYY);
  const [finalColumns, setFinalColumns] = useState<ColumnsType<any>>([]);
  const [loadingPage, setLoadingPage] = useState<boolean | undefined>();
  const { Staff } = KeyDriverDimension;
  const { isFetchingStoresKeyDriverTarget, refetch } = useFetchStoresKeyDriverTarget(Staff);
  const { isFetchingStoresKDOfflineTotalSales } = useFetchStoresKDOfflineTotalSales(Staff);
  const { isFetchingStoresOfflineTotalSalesLoyalty } =
    useFetchStoresOfflineTotalSalesLoyalty(Staff);
  const { isFetchingStoresCustomerVisitors } = useFetchStoresCustomerVisitors(Staff);
  const { isFetchingStoresOfflineOnlineTotalSales } = useFetchStoresOfflineOnlineTotalSales(Staff);
  const { isFetchingStoresProductTotalSales } = useFetchStoresProductTotalSales(Staff);
  const { isFetchingStoresOfflineTotalSalesPotential } =
    useFetchStoresOfflineTotalSalesPotential(Staff);
  const { isFetchingStoresKDTargetDay, refetch: refetchTargetDay } =
    useFetchStoresKDTargetDay(Staff);
  const {
    data,
    kdTarget,
    setData,
    selectedAsm,
    selectedStores,
    selectedStaffs,
    setSelectedDate,
    selectedDate,
  } = useContext(KDOfflineStoresContext);
  const dispatch = useDispatch();
  const asmName = useParams<{ asmName: string }>().asmName.toUpperCase();
  const storeName = useParams<{ storeName: string }>().storeName.toUpperCase();
  const [syncDataTime, setSyncDataTime] = useState<string>(
    moment().format(DATE_FORMAT.DD_MM_YY_HHmmss),
  );

  const setObjectiveColumns = useCallback(
    (
      departmentKey: string,
      department: string,
      className: string = "department-name--secondary",
    ): ColumnGroupType<any> | ColumnType<any> => {
      return {
        title: department,
        className: classnames("department-name", className),
        onHeaderCell: (data: any) => {
          return {
            onClick: () => {
              console.log("header", data);
            },
          };
        },

        children: [
          {
            title: () => {
              return (
                <div>
                  <span>MỤC TIÊU THÁNG</span>
                  <Button
                    ghost
                    size={"small"}
                    title="Cập nhật mục tiêu tháng"
                    onClick={() => {
                      updateTargetMonthUtil(
                        { departmentKey, kdTarget, date: selectedDate },
                        dispatch,
                        () => {
                          refetch();
                          refetchTargetDay();
                        },
                      );
                    }}
                  >
                    <CheckSquareOutlined />
                  </Button>
                </div>
              );
            },
            width: 140,
            align: "center",
            dataIndex: `${departmentKey}_month`,
            className: "input-cell",
            render: (text: any, record: RowData, index: number) => {
              return record.key !== KeyDriverField.ProductTotalSales ? (
                <CellInput
                  value={text}
                  record={record}
                  type={departmentKey}
                  time="month"
                  suffix={record.suffix}
                />
              ) : (
                "-"
              );
            },
          },
          {
            title: "TT LUỸ KẾ",
            width: 140,
            align: "center",
            dataIndex: `${departmentKey}_accumulatedMonth`,
            className: "input-cell",
            render: (text: any, record: RowData, index: number) => {
              return text || text === 0
                ? record.key === KeyDriverField.ConvertionRate && formatCurrency(text)
                  ? `${text}%`
                  : formatCurrency(text)
                : "-";
            },
          },
          {
            title: "TỶ LỆ",
            width: 80,
            align: "center",
            dataIndex: `${departmentKey}_rateMonth`,
            className: "input-cell",
            render: (text: any, record: RowData, index: number) => {
              return text || text === 0 ? `${text}%` : "-";
            },
          },
          {
            title: "DỰ KIẾN ĐẠT",
            width: 140,
            align: "center",
            dataIndex: `${departmentKey}_targetMonth`,
            className: "input-cell",
            render: (text: any, record: RowData, index: number) => {
              return text
                ? record.key === KeyDriverField.ConvertionRate && formatCurrency(text)
                  ? `${text}%`
                  : formatCurrency(text)
                : "-";
            },
          },
          {
            title: () => {
              return (
                <div>
                  <span>MỤC TIÊU NGÀY</span>
                  <Button
                    ghost
                    size={"small"}
                    title="Cập nhật mục tiêu ngày"
                    onClick={() => {
                      updateTargetDayUtil(
                        { departmentKey, kdTarget, date: selectedDate },
                        dispatch,
                        () => refetchTargetDay(),
                      );
                    }}
                  >
                    <CheckSquareOutlined />
                  </Button>
                </div>
              );
            },
            width: 140,
            align: "center",
            dataIndex: `${departmentKey}_day`,
            className: "input-cell",
            render: (text: any, record: RowData, index: number) => {
              return record.key !== KeyDriverField.ProductTotalSales ? (
                <CellInput
                  value={text}
                  record={record}
                  type={departmentKey}
                  time="day"
                  suffix={record.suffix}
                />
              ) : (
                "-"
              );
            },
          },
          {
            title: "THỰC ĐẠT",
            width: 140,
            align: "center",
            dataIndex: `${departmentKey}_actualDay`,
            className: "input-cell",
            render: (text: any, record: RowData, index: number) => {
              return text || text === 0
                ? record.key === KeyDriverField.ConvertionRate && formatCurrency(text)
                  ? `${text}%`
                  : formatCurrency(text)
                : "-";
            },
          },
          {
            title: "TỶ LỆ",
            width: 80,
            align: "center",
            dataIndex: `${departmentKey}_rateDay`,
            className: "input-cell",
            render: (text: any, record: RowData, index: number) => {
              return text || text === 0 ? `${text}%` : "-";
            },
          },
        ],
      };
    },
    [dispatch, kdTarget, refetch, refetchTargetDay, selectedDate],
  );

  const calculateMonthRate = useCallback(
    (keyDriver: any) => {
      calculateMonthRateUtil(
        keyDriver,
        selectedStaffs.map((item) => JSON.parse(item).code),
      );
    },
    [selectedStaffs],
  );

  const calculateDayRate = useCallback(
    (keyDriver: any) => {
      calculateDayRateUtil(
        keyDriver,
        selectedStaffs.map((item) => JSON.parse(item).code),
      );
    },
    [selectedStaffs],
  );

  const calculateDayTarget = useCallback(
    (keyDriver: any) => {
      calculateDayTargetUtil(
        keyDriver,
        selectedStaffs.map((item) => JSON.parse(item).code),
        selectedDate,
      );
    },
    [selectedDate, selectedStaffs],
  );

  useEffect(() => {
    const temp = [...baseColumns];
    selectedStaffs.forEach((item) => {
      const staffCode = JSON.parse(item).code.toLocaleLowerCase();
      const staffName = JSON.parse(item).full_name;
      temp.push(setObjectiveColumns(nonAccentVietnameseKD(staffCode), staffName.toUpperCase()));
    });
    setFinalColumns(temp);
  }, [selectedStaffs, selectedStores, setObjectiveColumns]);

  useEffect(() => {
    setLoadingPage(true);
    if (
      isFetchingStoresKDOfflineTotalSales === false &&
      isFetchingStoresKeyDriverTarget === false &&
      isFetchingStoresOfflineTotalSalesLoyalty === false &&
      isFetchingStoresCustomerVisitors === false &&
      isFetchingStoresOfflineOnlineTotalSales === false &&
      isFetchingStoresProductTotalSales === false &&
      isFetchingStoresOfflineTotalSalesPotential === false &&
      isFetchingStoresKDTargetDay === false
    ) {
      setData((prev: any) => {
        prev.forEach((item: any, index: number) => {
          calculateDayTarget(item);
          if (index === 0) {
            selectedStaffs.forEach((staffData) => {
              const staffCode = JSON.parse(staffData).code.toLocaleLowerCase();
              const staffKey = nonAccentVietnameseKD(staffCode);
              calculateKDAverageCustomerSpent(item, staffKey);
              calculateKDConvertionRate(item, staffKey);
              calculateKDAverageOrderValue(item, staffKey, selectedDate);
            });
          }
          calculateMonthRate(item);
          calculateDayRate(item);
        });
        return [...prev];
      });
      setSyncDataTime(moment().format(DATE_FORMAT.DD_MM_YY_HHmmss));
      setLoadingPage(false);
    }
  }, [
    calculateDayRate,
    calculateDayTarget,
    calculateMonthRate,
    isFetchingStoresCustomerVisitors,
    isFetchingStoresKDOfflineTotalSales,
    isFetchingStoresKeyDriverTarget,
    isFetchingStoresOfflineTotalSalesLoyalty,
    isFetchingStoresOfflineOnlineTotalSales,
    setData,
    selectedStores,
    isFetchingStoresProductTotalSales,
    isFetchingStoresOfflineTotalSalesPotential,
    selectedStaffs,
    isFetchingStoresKDTargetDay,
    selectedDate,
  ]);

  useEffect(() => {
    const asmNameUrl = asmName.toLocaleLowerCase();
    const storeNameUrl = storeName.toLowerCase();
    if (date) {
      setSelectedDate(date);
    } else {
      const today = moment().format(DATE_FORMAT.YYYYMMDD);
      history.push(`${UrlConfig.KEY_DRIVER_OFFLINE}/${asmNameUrl}/${storeNameUrl}?date=${today}`);
    }
  }, [history, date, setSelectedDate, asmName, storeName]);

  const onFinish = useCallback(() => {
    setLoadingPage(true);
    let date = form.getFieldsValue(true)["date"];
    let newDate = "";
    const asmNameUrl = asmName.toLocaleLowerCase();
    const storeNameUrl = storeName.toLowerCase();
    if (date) {
      newDate = moment(date, DATE_FORMAT.DDMMYYY).format(DATE_FORMAT.YYYYMMDD);
    } else {
      newDate = moment().format(DATE_FORMAT.YYYYMMDD);
    }
    setData((prev: any) => JSON.parse(JSON.stringify(keyDriverOfflineTemplateData)));
    history.push(`${UrlConfig.KEY_DRIVER_OFFLINE}/${asmNameUrl}/${storeNameUrl}?date=${newDate}`);
  }, [asmName, form, history, setData, storeName]);

  return (
    <ContentContainer
      title={`Báo cáo kết quả kinh doanh Offline ${selectedStores}`}
      breadcrumb={[
        {
          name: `${selectedAsm}`,
          path: `${UrlConfig.KEY_DRIVER_OFFLINE}/${asmName}`,
        },
        { name: `${selectedStores}` },
      ]}
    >
      <Card>
        <Form
          onFinish={onFinish}
          onFinishFailed={() => {}}
          form={form}
          name="report-form-base"
          layout="inline"
          initialValues={{
            date: date
              ? moment(date).format(DATE_FORMAT.DDMMYYY)
              : moment().format(DATE_FORMAT.DDMMYYY),
          }}
        >
          <Col xs={24} md={8}>
            <Form.Item name="date">
              <CustomDatePicker
                format={DATE_FORMAT.DDMMYYY}
                placeholder="Chọn ngày"
                style={{ width: "100%" }}
                onChange={() => onFinish()}
                showToday={false}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8} className="stores-kd-offline-filter">
            <StaffsSelect asmName={asmName} storeName={storeName} className="select-filter" />
          </Col>
        </Form>
      </Card>
      <KeyDriverOfflineStyle>
        <Card
          title={
            <div>
              <div>BÁO CÁO NGÀY: {day}</div>
              <div>
                <em className="report-time-desc">
                  Số liệu được cập nhật mới nhất đến: {syncDataTime}
                </em>
              </div>
            </div>
          }
        >
          <Table
            loading={{
              indicator: (
                <div>
                  <Spin />
                </div>
              ),
              tip: loadingMessage,
              spinning: loadingPage,
            }}
            scroll={{ x: "max-content" }}
            sticky={{
              offsetHeader: OFFSET_HEADER_UNDER_NAVBAR,
              offsetScroll: 5,
            }}
            bordered
            pagination={false}
            onRow={(record: any) => {
              return {
                onClick: () => {
                  console.log(record);
                },
              };
            }}
            expandable={{
              defaultExpandAllRows: true,
            }}
            columns={finalColumns}
            dataSource={data}
          />
        </Card>
      </KeyDriverOfflineStyle>
    </ContentContainer>
  );
}

const KDOfflineStoresWithProvider = (props: any) => {
  return (
    <KDOfflineStoresProvider>
      <KeyDriverOfflineStaff {...props} />
    </KDOfflineStoresProvider>
  );
};

export default KDOfflineStoresWithProvider;
