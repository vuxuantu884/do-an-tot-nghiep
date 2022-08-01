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
import { Link } from "react-router-dom";
import { useEffectOnce } from "react-use";
import { updateKeyDriversTarget } from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import { formatCurrency } from "utils/AppUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import {
  calculateKDAverageCustomerSpent,
  calculateKDAverageOrderValue,
  calculateKDConvertionRate,
  nonAccentVietnameseKD,
} from "utils/KeyDriverOfflineUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import { ASM_LIST } from "./constant/key-driver-offline-template-data";
import useFetchCustomerVisitors from "./hooks/useFetchCustomerVisitors";
import useFetchKDOfflineTotalSales from "./hooks/useFetchKDOfflineTotalSales";
import useFetchKeyDriverTarget from "./hooks/useFetchKeyDriverTarget";
import useFetchOfflineOnlineTotalSales from "./hooks/useFetchOfflineOnlineTotalSales";
import useFetchOfflineTotalSalesLoyalty from "./hooks/useFetchOfflineTotalSalesLoyalty";
import useFetchOfflineTotalSalesPotential from "./hooks/useFetchOfflineTotalSalesPotential";
import useFetchProductTotalSales from "./hooks/useFetchProductTotalSales";
import { KeyDriverOfflineStyle } from "./index.style";
import KeyDriverOfflineProvider, {
  KeyDriverOfflineContext,
} from "./provider/key-driver-offline-provider";

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
  const { setTargetMonth } = useContext(KeyDriverOfflineContext);
  const { onChange, record, value, type } = props;
  const { key } = record;

  return (
    <InputNumber
      className="input-number"
      formatter={(value?: number) => (value ? formatCurrency(value || 0) : "")}
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

function KeyDriverOffline() {
  const [finalColumns, setFinalColumns] = useState<ColumnsType<any>>([]);
  const [loadingPage, setLoadingPage] = useState<boolean | undefined>();
  const { isFetchingKeyDriverTarget, refetch } = useFetchKeyDriverTarget();
  const { isFetchingKDOfflineTotalSales } = useFetchKDOfflineTotalSales();
  const { isFetchingOfflineTotalSalesLoyalty } = useFetchOfflineTotalSalesLoyalty();
  const { isFetchingCustomerVisitors } = useFetchCustomerVisitors();
  const { isFetchingOfflineOnlineTotalSales } = useFetchOfflineOnlineTotalSales();
  const { isFetchingProductTotalSales } = useFetchProductTotalSales();
  const { isFetchingOfflineTotalSalesPotential } = useFetchOfflineTotalSalesPotential();
  const { data, targetMonth, setData } = useContext(KeyDriverOfflineContext);
  const dispatch = useDispatch();

  const calculateDepartmentMonthRate = (keyDriver: any, department: string) => {
    if (keyDriver[`${department}_accumulatedMonth`] && keyDriver[`${department}_month`]) {
      keyDriver[`${department}_rateMonth`] = keyDriver[`${department}_month`]
        ? Math.floor(
            +(keyDriver[`${department}_accumulatedMonth`] / keyDriver[`${department}_month`]) * 100,
          )
        : "";
    }
  };

  const calculateDepartmentDayTarget = (keyDriver: any, department: string) => {
    if (keyDriver[`${department}_month`]) {
      const dayNumber = moment().date() - 1;
      const dayInMonth = moment().daysInMonth();
      if (
        ![KeyDriverField.AverageOrderValue, KeyDriverField.AverageCustomerSpent].includes(
          keyDriver["key"],
        )
      ) {
        keyDriver[`${department}_day`] =
          keyDriver[`${department}_month`] - (keyDriver[`${department}_accumulatedMonth`] || 0) > 0
            ? Math.round(
                (keyDriver[`${department}_month`] -
                  (keyDriver[`${department}_accumulatedMonth`] || 0)) /
                  (dayInMonth - dayNumber) +
                  (KeyDriverField.CustomersCount === keyDriver["key"] ? 0.5 : 0),
              )
            : Math.round(keyDriver[`${department}_month`] / dayInMonth);
      }
    }
  };

  const calculateDepartmentDayRate = (keyDriver: any, department: string) => {
    if (keyDriver[`${department}_actualDay`] && keyDriver[`${department}_day`]) {
      keyDriver[`${department}_rateDay`] = keyDriver[`${department}_day`]
        ? Math.floor(+(keyDriver[`${department}_actualDay`] / keyDriver[`${department}_day`]) * 100)
        : "";
    }
  };

  const calculateMonthRate = useCallback((keyDriver: any) => {
    ["COMPANY", ...ASM_LIST].forEach((asm) => {
      const asmKey = nonAccentVietnameseKD(asm);
      calculateDepartmentMonthRate(keyDriver, asmKey);
    });
    if (keyDriver.children?.length) {
      keyDriver.children.forEach((item: any) => {
        calculateMonthRate(item);
      });
    }
  }, []);

  const calculateDayRate = useCallback((keyDriver: any) => {
    ["COMPANY", ...ASM_LIST].forEach((asm) => {
      const asmKey = nonAccentVietnameseKD(asm);
      calculateDepartmentDayRate(keyDriver, asmKey);
    });
    if (keyDriver.children?.length) {
      keyDriver.children.forEach((item: any) => {
        calculateDayRate(item);
      });
    }
  }, []);

  const calculateDayTarget = useCallback((keyDriver: any) => {
    ["COMPANY", ...ASM_LIST].forEach((asm) => {
      const asmKey = nonAccentVietnameseKD(asm);
      calculateDepartmentDayTarget(keyDriver, asmKey);
    });
    if (keyDriver.children?.length) {
      keyDriver.children.forEach((item: any) => {
        calculateDayTarget(item);
      });
    }
  }, []);

  useEffect(() => {
    setLoadingPage(true);
    if (
      isFetchingKDOfflineTotalSales === false &&
      isFetchingKeyDriverTarget === false &&
      isFetchingOfflineTotalSalesLoyalty === false &&
      isFetchingCustomerVisitors === false &&
      isFetchingOfflineOnlineTotalSales === false &&
      isFetchingProductTotalSales === false &&
      isFetchingOfflineTotalSalesPotential === false
    ) {
      setData((prev: any[]) => {
        prev.forEach((item: any, index) => {
          calculateDayTarget(item);
          if (index === 0) {
            ["COMPANY", ...ASM_LIST].forEach((asm) => {
              const asmKey = nonAccentVietnameseKD(asm);
              calculateKDAverageCustomerSpent(item, asmKey);
              calculateKDConvertionRate(item, asmKey);
              calculateKDAverageOrderValue(item, asmKey);
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
    isFetchingCustomerVisitors,
    isFetchingKDOfflineTotalSales,
    isFetchingKeyDriverTarget,
    isFetchingOfflineOnlineTotalSales,
    isFetchingOfflineTotalSalesLoyalty,
    isFetchingOfflineTotalSalesPotential,
    isFetchingProductTotalSales,
    setData,
  ]);

  const updateTargetMonth = async (departmentKey: string) => {
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
  };

  const setObjectiveColumns = (
    departmentKey: string,
    department: string,
    className: string = "department-name--secondary",
  ): ColumnGroupType<any> | ColumnType<any> => {
    return {
      title: department.toLowerCase().includes("tổng công ty") ? (
        department
      ) : (
        <Link
          className={classnames("department-name", className)}
          to={`${UrlConfig.KEY_DRIVER_OFFLINE}/${nonAccentVietnameseKD(department).toLowerCase()}`}
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
            return record.key !== KeyDriverField.ProductTotalSales ? (
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
          width: 130,
          align: "center",
          dataIndex: `${departmentKey}_targetMonth`,
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
          title: "MỤC TIÊU NGÀY",
          width: 120,
          align: "center",
          dataIndex: `${departmentKey}_day`,
          className: "input-cell",
          render: (text: any, record: RowData, index: number) => {
            return text || text === 0
              ? record.key === KeyDriverField.ConvertionRate && formatCurrency(text)
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
  };

  useEffectOnce(() => {
    const temp = [...baseColumns];
    temp.push(setObjectiveColumns("COMPANY", "TỔNG CÔNG TY (OFFLINE)", "department-name--primary"));
    ASM_LIST.forEach((asm) => {
      temp.push(setObjectiveColumns(nonAccentVietnameseKD(asm), asm.toUpperCase()));
    });
    setFinalColumns(temp);
  });

  const day = moment().format(DATE_FORMAT.DDMMYY_HHmm);

  return (
    <ContentContainer
      title={"Báo cáo kết quả kinh doanh Offline"}
      breadcrumb={[{ name: "Báo cáo" }, { name: "Báo cáo kết quả kinh doanh Offline" }]}
    >
      <KeyDriverOfflineStyle>
        <Card title={`BÁO CÁO NGÀY: ${day}`}>
          {loadingPage === false ? (
            <Table
              loading={loadingPage}
              scroll={{ x: "max-content", y: 500 }}
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

const KeyDriverOfflineWithProvider = (props: any) => {
  return (
    <KeyDriverOfflineProvider>
      <KeyDriverOffline {...props} />
    </KeyDriverOfflineProvider>
  );
};

export default KeyDriverOfflineWithProvider;
