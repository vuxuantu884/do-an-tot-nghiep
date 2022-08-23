import { CheckSquareOutlined } from "@ant-design/icons";
import { Button, Card, InputNumber, Spin, Table, Tooltip } from "antd";
import { ColumnGroupType, ColumnsType, ColumnType } from "antd/lib/table";
import classnames from "classnames";
import ContentContainer from "component/container/content.container";
import { AppConfig } from "config/app.config";
import UrlConfig from "config/url.config";
import { debounce } from "lodash";
import { KeyDriverField, KeyDriverTarget } from "model/report";
import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { updateKeyDriversTarget } from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import { formatCurrency, replaceFormat } from "utils/AppUtils";
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
} from "utils/KeyDriverOfflineUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import StoresSelect from "../components/stores-select";
import useFetchStoresCustomerVisitors from "../hooks/useFetchStoresCustomerVisitors";
import useFetchStoresKDOfflineTotalSales from "../hooks/useFetchStoresKDOfflineTotalSales";
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
  const { setTargetMonth } = useContext(KDOfflineStoresContext);
  const { onChange, record, value, type } = props;
  const { key } = record;

  return (
    <InputNumber
      className="input-number"
      formatter={(value?: number) => (value ? formatCurrency(value || 0) : "")}
      parser={(value: string | undefined) => replaceFormat(value || "")}
      defaultValue={value}
      onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
      onChange={debounce((inputValue: number) => {
        onChange?.(inputValue, props);

        setTargetMonth((prev: KeyDriverTarget[]) => {
          const departmentIdx = prev.findIndex((item) => item.department === type);
          if (departmentIdx !== -1) {
            const keyDriverIdx = prev[departmentIdx].key_drivers.findIndex(
              (item) => item.key_driver === key,
            );
            if (keyDriverIdx !== -1) {
              prev[departmentIdx].key_drivers[keyDriverIdx].value = inputValue;
            } else {
              prev[departmentIdx].key_drivers.push({
                key_driver: key,
                value: inputValue,
              });
            }
          } else {
            prev.push({
              department: type,
              key_drivers: [
                {
                  key_driver: key,
                  value: inputValue,
                },
              ],
            });
          }
          return prev;
        });
      }, AppConfig.TYPING_TIME_REQUEST)}
    />
  );
}

function KeyDriverOfflineStore() {
  const [finalColumns, setFinalColumns] = useState<ColumnsType<any>>([]);
  const [loadingPage, setLoadingPage] = useState<boolean | undefined>();
  const { isFetchingStoresKeyDriverTarget, refetch } = useFetchStoresKeyDriverTarget();
  const { isFetchingStoresKDOfflineTotalSales } = useFetchStoresKDOfflineTotalSales();
  const { isFetchingStoresOfflineTotalSalesLoyalty } = useFetchStoresOfflineTotalSalesLoyalty();
  const { isFetchingStoresCustomerVisitors } = useFetchStoresCustomerVisitors();
  const { isFetchingStoresOfflineOnlineTotalSales } = useFetchStoresOfflineOnlineTotalSales();
  const { isFetchingStoresProductTotalSales } = useFetchStoresProductTotalSales();
  const { isFetchingStoresOfflineTotalSalesPotential } = useFetchStoresOfflineTotalSalesPotential();
  const { data, targetMonth, setData, selectedAsm, selectedStores } =
    useContext(KDOfflineStoresContext);
  const dispatch = useDispatch();
  const asmName = useParams<{ asmName: string }>().asmName.toUpperCase();

  const updateTargetMonth = useCallback(
    async (departmentKey: string) => {
      if (targetMonth.length) {
        const departmentKeyDrivers = targetMonth.find((item) => item.department === departmentKey);
        if (!departmentKeyDrivers) {
          return;
        }
        const params = {
          ...departmentKeyDrivers,
          year: moment().year(),
          month: moment().month() + 1,
        };
        const res = await callApiNative(
          { notifyAction: "SHOW_ALL" },
          dispatch,
          updateKeyDriversTarget,
          params,
        );
        if (!res) {
          showError("Cập nhật mục tiêu tháng thất bại");
        } else {
          showSuccess("Cập nhật mục tiêu tháng thành công");
          refetch();
        }
      }
    },
    [dispatch, refetch, targetMonth],
  );

  const setObjectiveColumns = useCallback(
    (
      departmentKey: string,
      department: string,
      className: string = "department-name--secondary",
    ): ColumnGroupType<any> | ColumnType<any> => {
      const { ConvertionRate, ProductTotalSales, NewCustomersConversionRate } = KeyDriverField;
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
                      updateTargetMonth(departmentKey);
                    }}
                  >
                    <CheckSquareOutlined />
                  </Button>
                </div>
              );
            },
            width: 130,
            align: "center",
            dataIndex: `${departmentKey}_month`,
            className: "input-cell",
            render: (text: any, record: RowData, index: number) => {
              return ![ProductTotalSales].includes(record.key as KeyDriverField) ? (
                <CellInput value={text} record={record} type={departmentKey} time="month" />
              ) : (
                "-"
              );
            },
          },
          {
            title: "TT LUỸ KẾ",
            width: 130,
            align: "center",
            dataIndex: `${departmentKey}_accumulatedMonth`,
            className: "input-cell",
            render: (text: any, record: RowData, index: number) => {
              return text || text === 0
                ? [ConvertionRate, NewCustomersConversionRate].includes(
                    record.key as KeyDriverField,
                  )
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
            width: 130,
            align: "center",
            dataIndex: `${departmentKey}_targetMonth`,
            className: "input-cell",
            render: (text: any, record: RowData, index: number) => {
              return text
                ? [ConvertionRate, NewCustomersConversionRate].includes(
                    record.key as KeyDriverField,
                  )
                  ? `${text}%`
                  : formatCurrency(text)
                : "-";
            },
          },
          {
            title: "MỤC TIÊU NGÀY",
            width: 120,
            align: "center",
            dataIndex: `${departmentKey}_day`,
            className: "input-cell",
            render: (text: any, record: RowData, index: number) => {
              return text || text === 0
                ? [ConvertionRate, NewCustomersConversionRate].includes(
                    record.key as KeyDriverField,
                  ) && formatCurrency(text)
                  ? `${text}%`
                  : formatCurrency(text)
                : "-";
              // return <CellInput value={text} record={record} type={departmentKey} time="day" />;
            },
          },
          {
            title: "THỰC ĐẠT",
            width: 120,
            align: "center",
            dataIndex: `${departmentKey}_actualDay`,
            className: "input-cell",
            render: (text: any, record: RowData, index: number) => {
              return text || text === 0
                ? [ConvertionRate, NewCustomersConversionRate].includes(
                    record.key as KeyDriverField,
                  )
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
    [updateTargetMonth],
  );

  const calculateMonthRate = useCallback(
    (keyDriver: any) => {
      calculateMonthRateUtil(keyDriver, selectedStores);
    },
    [selectedStores],
  );

  const calculateDayRate = useCallback(
    (keyDriver: any) => {
      calculateDayRateUtil(keyDriver, selectedStores);
    },
    [selectedStores],
  );

  const calculateDayTarget = useCallback(
    (keyDriver: any) => {
      calculateDayTargetUtil(keyDriver, selectedStores);
    },
    [selectedStores],
  );

  useEffect(() => {
    const temp = [...baseColumns];
    selectedStores.forEach((asm) => {
      temp.push(setObjectiveColumns(nonAccentVietnameseKD(asm), asm.toUpperCase()));
    });
    setFinalColumns(temp);
  }, [selectedStores, setObjectiveColumns]);

  useEffect(() => {
    if (
      isFetchingStoresKDOfflineTotalSales === false &&
      isFetchingStoresKeyDriverTarget === false &&
      isFetchingStoresOfflineTotalSalesLoyalty === false &&
      isFetchingStoresCustomerVisitors === false &&
      isFetchingStoresOfflineOnlineTotalSales === false &&
      isFetchingStoresProductTotalSales === false &&
      isFetchingStoresOfflineTotalSalesPotential === false
    ) {
      setLoadingPage(true);
      setData((prev: any) => {
        prev.forEach((item: any, index: number) => {
          calculateDayTarget(item);
          if (index === 0) {
            selectedStores.forEach((asm) => {
              const asmKey = nonAccentVietnameseKD(asm);
              calculateKDAverageCustomerSpent(item, asmKey);
              calculateKDConvertionRate(item, asmKey);
              calculateKDAverageOrderValue(item, asmKey);
              calculateKDNewCustomerRateTargetDay(item, asmKey);
            });
          }
          calculateMonthRate(item);
          calculateDayRate(item);
        });
        return [...prev];
      });
      setTimeout(() => {
        setLoadingPage(false);
      }, 1000);
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
  ]);

  const day = moment().format(DATE_FORMAT.DDMMYY_HHmm);

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
      <KeyDriverOfflineStyle>
        <Card>
          <div className="stores-kd-offline-filter">
            <h1 className="title">BỘ LỌC</h1>
            <StoresSelect asmName={asmName} className="select-filter" />
          </div>
        </Card>
        <Card title={`BÁO CÁO NGÀY: ${day}`}>
          {selectedStores.length > 0 && loadingPage === false ? (
            <Table
              loading={loadingPage}
              scroll={{ x: "max-content", y: 450 }}
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
          ) : (
            <Spin />
          )}
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
