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
import { KeyDriverField, KeyDriverFilter, KeyDriverTarget } from "model/report";
import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useHistory, useLocation, useParams } from "react-router-dom";
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
import StoresSelect from "../components/stores-select";
import {
  keyDriverOfflineTemplateData,
  loadingMessage,
} from "../constant/key-driver-offline-template-data";
import useFetchStoresCallLoyalty from "../hooks/useFetchStoresCallLoyalty";
import useFetchStoresCustomerVisitors from "../hooks/useFetchStoresCustomerVisitors";
import useFetchStoresKDOfflineTotalSales from "../hooks/useFetchStoresKDOfflineTotalSales";
import useFetchStoresKDTargetDay from "../hooks/useFetchStoresKDTargetDay";
import useFetchStoresKeyDriverTarget from "../hooks/useFetchStoresKeyDriverTarget";
import useFetchStoresOfflineOnlineTotalSales from "../hooks/useFetchStoresOfflineOnlineTotalSales";
import useFetchStoresOfflineTotalSalesLoyalty from "../hooks/useFetchStoresOfflineTotalSalesLoyalty";
import useFetchStoresOfflineTotalSalesPotential from "../hooks/useFetchStoresOfflineTotalSalesPotential";
import useFetchStoresProductTotalSales from "../hooks/useFetchStoresProductTotalSales";
import useFetchStoresSmsLoyalty from "../hooks/useFetchStoresSmsLoyalty";
import { KeyDriverOfflineStyle } from "../index.style";
import KDOfflineStoresProvider, {
  KDOfflineStoresContext,
} from "../provider/kd-offline-stores-provider";

// const { Option } = Select;

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
          {text}
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

function KeyDriverOfflineStore() {
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
  const { isFetchingStoresKeyDriverTarget, refetch } = useFetchStoresKeyDriverTarget();
  const { isFetchingStoresKDOfflineTotalSales } = useFetchStoresKDOfflineTotalSales();
  const { isFetchingStoresOfflineTotalSalesLoyalty } = useFetchStoresOfflineTotalSalesLoyalty();
  const { isFetchingStoresCustomerVisitors } = useFetchStoresCustomerVisitors();
  const { isFetchingStoresOfflineOnlineTotalSales } = useFetchStoresOfflineOnlineTotalSales();
  const { isFetchingStoresProductTotalSales } = useFetchStoresProductTotalSales();
  const { isFetchingStoresOfflineTotalSalesPotential } = useFetchStoresOfflineTotalSalesPotential();
  const { isFetchingStoresCallLoyalty } = useFetchStoresCallLoyalty();
  const { isFetchingStoresSmsLoyalty } = useFetchStoresSmsLoyalty();
  const { isFetchingStoresKDTargetDay, refetch: refetchTargetDay } = useFetchStoresKDTargetDay();
  const {
    data,
    kdTarget,
    setData,
    selectedAsm,
    selectedStores,
    setSelectedDate,
    selectedDate,
    // setSelectedStoreRank,
  } = useContext(KDOfflineStoresContext);
  const dispatch = useDispatch();
  const asmName = useParams<{ asmName: string }>().asmName.toUpperCase();
  // const isFirstLoad = useRef(true);
  // const [storeRanks, setStoreRanks] = useState<Array<StoreRankResponse>>([]);
  const [syncDataTime, setSyncDataTime] = useState<string>(
    moment().format(DATE_FORMAT.DD_MM_YY_HHmmss),
  );
  const [stateExpand, setStateExpand] = useState<Array<any>>([]);

  const setObjectiveColumns = useCallback(
    (
      departmentKey: string,
      department: string,
      className: string = "department-name--secondary",
    ): ColumnGroupType<any> | ColumnType<any> => {
      const { ProductTotalSales } = KeyDriverField;
      const asmNameUrl = asmName.toLocaleLowerCase();
      const storeNameUrl = nonAccentVietnameseKD(department).toLowerCase();
      return {
        title: (
          <Link
            className={"dimension-link"}
            to={`${UrlConfig.KEY_DRIVER_OFFLINE}/${asmNameUrl}/${storeNameUrl}`}
          >
            {department}
          </Link>
        ),
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
              return ![ProductTotalSales].includes(record.key as KeyDriverField) ? (
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
    [asmName, dispatch, kdTarget, refetch, refetchTargetDay, selectedDate],
  );

  const calculateMonthRate = useCallback(
    (keyDriver: any) => {
      calculateMonthRateUtil(keyDriver, [...selectedStores, selectedAsm[0]]);
    },
    [selectedAsm, selectedStores],
  );

  const calculateDayRate = useCallback(
    (keyDriver: any) => {
      calculateDayRateUtil(keyDriver, [...selectedStores, selectedAsm[0]]);
    },
    [selectedAsm, selectedStores],
  );

  const calculateDayTarget = useCallback(
    (keyDriver: any) => {
      calculateDayTargetUtil(keyDriver, [...selectedStores, selectedAsm[0]], selectedDate);
    },
    [selectedAsm, selectedDate, selectedStores],
  );

  useEffect(() => {
    if (selectedStores.length && selectedAsm.length) {
      const temp = [...baseColumns];
      temp.push(
        setObjectiveColumns(
          nonAccentVietnameseKD(selectedAsm[0]),
          selectedAsm[0],
          "department-name--primary",
        ),
      );
      selectedStores.forEach((asm) => {
        temp.push(setObjectiveColumns(nonAccentVietnameseKD(asm), asm.toUpperCase()));
      });
      setFinalColumns(temp);
    }
  }, [selectedAsm, selectedStores, setObjectiveColumns]);

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
      isFetchingStoresCallLoyalty === false &&
      isFetchingStoresKDTargetDay === false &&
      isFetchingStoresSmsLoyalty === false
    ) {
      setData((prev: any) => {
        prev.forEach((item: any, index: number) => {
          calculateDayTarget(item);
          if (index === 0) {
            [...selectedStores, selectedAsm[0]].forEach((asm) => {
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
    isFetchingStoresCustomerVisitors,
    isFetchingStoresKDOfflineTotalSales,
    isFetchingStoresKeyDriverTarget,
    isFetchingStoresOfflineTotalSalesLoyalty,
    isFetchingStoresOfflineOnlineTotalSales,
    setData,
    selectedStores,
    isFetchingStoresProductTotalSales,
    isFetchingStoresOfflineTotalSalesPotential,
    isFetchingStoresKDTargetDay,
    selectedDate,
    isFetchingStoresCallLoyalty,
    isFetchingStoresSmsLoyalty,
    selectedAsm,
  ]);

  useEffect(() => {
    const asmNameUrl = asmName.toLocaleLowerCase();
    if (date) {
      setSelectedDate(date);
    } else {
      const today = moment().format(DATE_FORMAT.YYYYMMDD);
      history.push(`${UrlConfig.KEY_DRIVER_OFFLINE}/${asmNameUrl}?date=${today}`);
    }
  }, [history, date, setSelectedDate, asmName]);

  // useEffect(() => {
  //   if (isFirstLoad.current) {
  //     dispatch(StoreRankAction(setStoreRanks));
  //   }
  //   isFirstLoad.current = false;
  // }, [dispatch]);

  const onFinish = useCallback(() => {
    setLoadingPage(true);
    let date = form.getFieldsValue(true)["date"];
    let newDate = "";
    const asmNameUrl = asmName.toLocaleLowerCase();
    if (date) {
      newDate = moment(date, DATE_FORMAT.DDMMYYY).format(DATE_FORMAT.YYYYMMDD);
    } else {
      newDate = moment().format(DATE_FORMAT.YYYYMMDD);
    }
    setData(() => JSON.parse(JSON.stringify(keyDriverOfflineTemplateData)));
    history.push(`${UrlConfig.KEY_DRIVER_OFFLINE}/${asmNameUrl}?date=${newDate}`);
  }, [asmName, form, history, setData]);

  const onExpand = (expanded: any, { key }: { key: any }) => {
    setStateExpand((prev) => {
      return !expanded ? [...prev, key] : prev.filter((k) => k !== key);
    });
  };

  return (
    <ContentContainer
      title={`Báo cáo kết quả kinh doanh Offline ${selectedAsm}`}
      breadcrumb={[
        {
          name: "Báo cáo kết quả kinh doanh Offline",
          path: `${UrlConfig.KEY_DRIVER_OFFLINE}`,
        },
        { name: `${selectedAsm}` },
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
            <Form.Item name={KeyDriverFilter.Date}>
              <CustomDatePicker
                format={DATE_FORMAT.DDMMYYY}
                placeholder="Chọn ngày"
                style={{ width: "100%" }}
                onChange={() => onFinish()}
                showToday={false}
              />
            </Form.Item>
          </Col>
          {/* <Col xs={24} md={8}>
            <Form.Item name={KeyDriverFilter.Rank}>
              <Select
                placeholder="Chọn phân cấp cửa hàng"
                allowClear
                onChange={(value: number) => setSelectedStoreRank(value)}
              >
                {storeRanks?.map((item) => (
                  <Option key={item.id} value={item.id}>
                    {item.code}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col> */}
          <Col xs={24} md={8}>
            <StoresSelect asmName={asmName} className="select-filter" />
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
            rowClassName={(record: any, rowIndex: any) => {
              if (stateExpand.includes(record.key) || !record.children) {
                return "expand-parent";
              }
              return "";
            }}
            onExpand={onExpand}
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
      <KeyDriverOfflineStore {...props} />
    </KDOfflineStoresProvider>
  );
};

export default KDOfflineStoresWithProvider;
