import { CheckSquareOutlined, SettingOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Spin, Table, Tooltip } from "antd";
import { ColumnGroupType, ColumnsType, ColumnType } from "antd/lib/table";
import classnames from "classnames";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import CustomDatePicker from "component/custom/new-date-picker.custom";
import NumberInput from "component/custom/number-input.custom";
import ModalSettingColumnData from "component/table/ModalSettingColumnData";
import { AppConfig } from "config/app.config";
import UrlConfig from "config/url.config";
import { debounce } from "lodash";
import { KeyDriverDimension, KeyDriverField, KeyDriverTarget, LocalStorageKey } from "model/report";
import moment from "moment";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useHistory, useLocation, useRouteMatch } from "react-router-dom";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";
import { DATE_FORMAT } from "utils/DateUtils";
import {
  calculateDayRateUtil,
  calculateDayTargetUtil,
  calculateKDAverageCustomerSpent,
  calculateKDAverageOrderValue,
  calculateKDConvertionRate,
  calculateKDNewCustomerRateTargetDay,
  calculateMonthRateUtil,
  nonAccentVietnameseKD,
  updateTargetDayUtil,
  updateTargetMonthUtil,
} from "utils/KeyDriverOfflineUtils";
import {
  ASM_LIST,
  keyDriverOfflineTemplateData,
  loadingMessage,
} from "./constant/key-driver-offline-template-data";
import useFetchProfit from "./hooks/profit/useFetchProfit";
import useFetchCallLoyalty from "./hooks/useFetchCallLoyalty";
import useFetchCustomerVisitors from "./hooks/useFetchCustomerVisitors";
import useFetchFollowFanpage from "./hooks/useFetchFollowFanpage";
import useFetchKDOfflineTotalSales from "./hooks/useFetchKDOfflineTotalSales";
import useFetchKDTargetDay from "./hooks/useFetchKDTargetDay";
import useFetchKeyDriverTarget from "./hooks/useFetchKeyDriverTarget";
import useFetchOfflineOnlineTotalSales from "./hooks/useFetchOfflineOnlineTotalSales";
import useFetchOfflineTotalSalesLoyalty from "./hooks/useFetchOfflineTotalSalesLoyalty";
import useFetchOfflineTotalSalesPotential from "./hooks/useFetchOfflineTotalSalesPotential";
import useFetchProductTotalSales from "./hooks/useFetchProductTotalSales";
import useFetchSmsLoyalty from "./hooks/useFetchSmsLoyalty";
import { KeyDriverOfflineStyle } from "./index.style";
import KDOfflineProvider, { KDOfflineContext } from "./provider/kd-offline-provider";

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
  suffix?: string;
  onChange?: (value: number, row: RowRender) => void;
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
          {text}
        </Tooltip>
      );
    },
  },
];

function CellInput(props: RowRender) {
  const { setKDTarget } = useContext(KDOfflineContext);
  const { onChange, record, value, type, time, suffix } = props;
  const { key } = record;

  return (
    <NumberInput
      className="input-number"
      isFloat={true}
      isChangeAfterBlur={false}
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

function KeyDriverOffline() {
  const [form] = Form.useForm();
  const history = useHistory();
  // get query from url
  const query = new URLSearchParams(useLocation().search);
  const date = query.get("date");
  const day = date
    ? moment(date).format(DATE_FORMAT.DDMMYYY)
    : moment().format(DATE_FORMAT.DDMMYYY);
  const { Asm } = KeyDriverDimension;
  const { path: matchPath } = useRouteMatch();
  const [finalColumns, setFinalColumns] = useState<ColumnsType<any>>([]);
  const [loadingPage, setLoadingPage] = useState<boolean | undefined>();
  const { isFetchingKeyDriverTarget, refetch } = useFetchKeyDriverTarget(Asm);
  const { isFetchingKDOfflineTotalSales } = useFetchKDOfflineTotalSales(Asm);
  const { isFetchingOfflineTotalSalesLoyalty } = useFetchOfflineTotalSalesLoyalty(Asm);
  const { isFetchingCustomerVisitors } = useFetchCustomerVisitors(Asm);
  const { isFetchingOfflineOnlineTotalSales } = useFetchOfflineOnlineTotalSales(Asm);
  const { isFetchingProductTotalSales } = useFetchProductTotalSales();
  const { isFetchingOfflineTotalSalesPotential } = useFetchOfflineTotalSalesPotential(Asm);
  const { isFetchingCallLoyalty } = useFetchCallLoyalty(Asm);
  const { isFetchingSmsLoyalty } = useFetchSmsLoyalty(Asm);
  const { isFetchingProfit } = useFetchProfit(Asm);
  const { isFetchingKDTargetDay, refetch: refetchTargetDay } = useFetchKDTargetDay(Asm);
  const { isFetchingFollowFanpage } = useFetchFollowFanpage(Asm);
  const {
    data,
    kdTarget,
    setData,
    setSelectedDate,
    selectedDate,
    displayColumns,
    setDisplayColumns,
  } = useContext(KDOfflineContext);
  const dispatch = useDispatch();
  const [syncDataTime, setSyncDataTime] = useState<string>(
    moment().format(DATE_FORMAT.DD_MM_YY_HHmmss),
  );

  const expandedDefault = localStorage.getItem(LocalStorageKey.KeyDriverOfflineRowkeysExpanded);
  const [expandRowKeys, setExpandRowKeys] = useState<string[]>(
    expandedDefault ? JSON.parse(expandedDefault) : [],
  );
  const [showSettingColumn, setShowSettingColumn] = useState(false);

  const departmentsList = useMemo(() => {
    return ["COMPANY", ...ASM_LIST];
  }, []);

  const calculateMonthRate = useCallback(
    (keyDriver: any) => {
      calculateMonthRateUtil(keyDriver, departmentsList);
    },
    [departmentsList],
  );

  const calculateDayRate = useCallback(
    (keyDriver: any) => {
      calculateDayRateUtil(keyDriver, departmentsList);
    },
    [departmentsList],
  );

  const calculateDayTarget = useCallback(
    (keyDriver: any) => {
      calculateDayTargetUtil(keyDriver, departmentsList, selectedDate);
    },
    [departmentsList, selectedDate],
  );

  useEffect(() => {
    setLoadingPage(true);
    if (
      isFetchingKDOfflineTotalSales === false &&
      isFetchingKeyDriverTarget === false &&
      isFetchingOfflineTotalSalesLoyalty === false &&
      isFetchingCustomerVisitors === false &&
      isFetchingOfflineOnlineTotalSales === false &&
      isFetchingProductTotalSales === false &&
      isFetchingOfflineTotalSalesPotential === false &&
      isFetchingCallLoyalty === false &&
      isFetchingKDTargetDay === false &&
      isFetchingSmsLoyalty === false &&
      isFetchingProfit === false &&
      isFetchingFollowFanpage === false
    ) {
      setData((prev: any[]) => {
        prev.forEach((item: any, index) => {
          calculateDayTarget(item);
          if (index === 0) {
            departmentsList.forEach((asm) => {
              const asmKey = nonAccentVietnameseKD(asm);
              calculateKDAverageCustomerSpent(item, asmKey);
              calculateKDConvertionRate(item, asmKey);
              calculateKDAverageOrderValue(item, asmKey, selectedDate);
              calculateKDNewCustomerRateTargetDay(item, asmKey, selectedDate);
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
    departmentsList,
    isFetchingCallLoyalty,
    isFetchingCustomerVisitors,
    isFetchingKDOfflineTotalSales,
    isFetchingKeyDriverTarget,
    isFetchingKDTargetDay,
    isFetchingOfflineOnlineTotalSales,
    isFetchingOfflineTotalSalesLoyalty,
    isFetchingOfflineTotalSalesPotential,
    isFetchingProductTotalSales,
    isFetchingProfit,
    isFetchingSmsLoyalty,
    selectedDate,
    setData,
    isFetchingFollowFanpage,
  ]);

  const setObjectiveColumns = useCallback(
    (
      departmentKey: string,
      department: string,
      className: string = "department-name--secondary",
    ): ColumnGroupType<any> | ColumnType<any> => {
      const { ProductTotalSales, Cost, Shipping, FollowFanpage } = KeyDriverField;
      return {
        title: department.toLowerCase().includes("tổng công ty") ? (
          department
        ) : (
          <Link
            className={"dimension-link"}
            to={`${UrlConfig.KEY_DRIVER_OFFLINE}/${nonAccentVietnameseKD(
              department,
            ).toLowerCase()}`}
          >
            {department}
          </Link>
        ),
        className: classnames("", className),
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
                    className="update-target-btn"
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
            align: "right",
            dataIndex: `${departmentKey}_month`,
            className: "input-cell",
            render: (text: any, record: RowData, index: number) => {
              return ![ProductTotalSales, Cost, Shipping].includes(record.key as KeyDriverField) ? (
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
            title: "LUỸ KẾ",
            width: 140,
            align: "right",
            dataIndex: `${departmentKey}_accumulatedMonth`,
            className: "input-cell",
            render: (text: any, record: RowData, index: number) => {
              return text || text === 0
                ? record.suffix === "%"
                  ? `${text}%`
                  : formatCurrency(text)
                : "-";
            },
          },
          {
            title: "TỶ LỆ",
            width: 80,
            align: "right",
            dataIndex: `${departmentKey}_rateMonth`,
            className: "input-cell",
            render: (text: any, record: RowData, index: number) => {
              return text || text === 0 ? `${text}%` : "-";
            },
          },
          {
            title: "DỰ KIẾN ĐẠT",
            width: 140,
            align: "right",
            dataIndex: `${departmentKey}_targetMonth`,
            className: "input-cell",
            render: (text: any, record: RowData, index: number) => {
              return (
                <div
                  className={
                    record[`${departmentKey}_month`] &&
                    (record.suffix === "%"
                      ? record[`${departmentKey}_targetMonth`] >= record[`${departmentKey}_month`]
                      : Math.round(record[`${departmentKey}_targetMonth`]) >=
                        Math.round(record[`${departmentKey}_month`]))
                      ? "text-success"
                      : record[`${departmentKey}_targetMonth`] <
                        (record[`${departmentKey}_month`] || 0) * 0.5
                      ? "text-danger"
                      : ""
                  }
                >
                  {text || text === 0
                    ? record.suffix === "%"
                      ? `${text}%`
                      : formatCurrency(text)
                    : "-"}
                </div>
              );
            },
          },
          {
            title: () => {
              return (
                <div>
                  <span>MỤC TIÊU NGÀY</span>
                  <Button
                    className="update-target-btn"
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
            align: "right",
            dataIndex: `${departmentKey}_day`,
            className: "input-cell",
            render: (text: any, record: RowData, index: number) => {
              return ![ProductTotalSales, Cost, Shipping, FollowFanpage].includes(
                record.key as KeyDriverField,
              ) ? (
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
            align: "right",
            dataIndex: `${departmentKey}_actualDay`,
            className: "input-cell",
            render: (text: any, record: RowData, index: number) => {
              return text || text === 0
                ? record.suffix === "%"
                  ? `${text}%`
                  : formatCurrency(text)
                : "-";
            },
          },
          {
            title: "TỶ LỆ",
            width: 80,
            align: "right",
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

  useEffect(() => {
    const temp = [...baseColumns];
    temp.push(setObjectiveColumns("COMPANY", "TỔNG CÔNG TY (OFFLINE)", "department-name--primary"));
    ASM_LIST.forEach((asm) => {
      temp.push(setObjectiveColumns(nonAccentVietnameseKD(asm), asm.toUpperCase()));
    });
    setFinalColumns(temp);
  }, [setObjectiveColumns]);

  useEffect(() => {
    if (date) {
      setSelectedDate(date);
    } else {
      const today = moment().format(DATE_FORMAT.YYYYMMDD);
      history.push(`${UrlConfig.KEY_DRIVER_OFFLINE}?date=${today}`);
    }
  }, [history, date, setSelectedDate]);

  const onFinish = useCallback(() => {
    setLoadingPage(true);
    let date = form.getFieldsValue(true)["date"];
    let newDate = "";
    if (date) {
      newDate = moment(date, DATE_FORMAT.DDMMYYY).format(DATE_FORMAT.YYYYMMDD);
    } else {
      newDate = moment().format(DATE_FORMAT.YYYYMMDD);
    }
    setData(() => JSON.parse(JSON.stringify(keyDriverOfflineTemplateData)));
    history.push(`${UrlConfig.KEY_DRIVER_OFFLINE}?date=${newDate}`);
  }, [form, history, setData]);

  const newFinalColumns = useMemo(() => {
    return finalColumns.map((columnDetails: any) => {
      return {
        ...columnDetails,
        children: columnDetails.children
          ? columnDetails.children.filter((children: any, index: number) =>
              displayColumns.some((i) => i.visible && i.index === index),
            )
          : undefined,
      };
    });
  }, [displayColumns, finalColumns]);

  return (
    <ContentContainer
      title={"Báo cáo kết quả kinh doanh Offline"}
      breadcrumb={[{ name: "Báo cáo" }, { name: "Báo cáo kết quả kinh doanh Offline" }]}
    >
      <KeyDriverOfflineStyle>
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
          </Form>
          <Button
            className="columns-setting"
            icon={<SettingOutlined />}
            onClick={() => setShowSettingColumn(true)}
          />
        </Card>
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
            rowClassName={(record: any, rowIndex: any) => {
              if (!expandRowKeys.includes(record.key) || !record.children) {
                return "expand-parent";
              }
              return "";
            }}
            expandedRowKeys={expandRowKeys}
            expandable={{
              defaultExpandAllRows: true,
              onExpandedRowsChange: (rowKeys: any) => {
                setExpandRowKeys(rowKeys);
                localStorage.setItem(
                  LocalStorageKey.KeyDriverOfflineRowkeysExpanded,
                  JSON.stringify(rowKeys),
                );
              },
            }}
            columns={newFinalColumns}
            dataSource={data}
          />
        </Card>
      </KeyDriverOfflineStyle>
      <BottomBarContainer
        rightComponent={
          <>
            <Button type="primary">
              <Link to={`${matchPath}/potential-importing`}>Nhập file khách hàng tiềm năng</Link>
            </Button>
          </>
        }
      />
      <ModalSettingColumnData
        visible={showSettingColumn}
        onCancel={() => setShowSettingColumn(false)}
        onOk={(data) => {
          setShowSettingColumn(false);
          setDisplayColumns(data);
          localStorage.setItem(LocalStorageKey.KeyDriverOfflineColumns, JSON.stringify(data));
        }}
        data={displayColumns}
      />
    </ContentContainer>
  );
}

const KeyDriverOfflineWithProvider = (props: any) => {
  return (
    <KDOfflineProvider>
      <KeyDriverOffline {...props} />
    </KDOfflineProvider>
  );
};

export default KeyDriverOfflineWithProvider;
