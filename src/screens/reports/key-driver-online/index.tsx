import { Card, InputNumber, InputNumberProps, Table, Tooltip } from "antd";
import { ColumnGroupType, ColumnsType, ColumnType } from "antd/lib/table";
import classnames from "classnames";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { KeyboardKey } from "model/other/keyboard/keyboard.model";
import { AnalyticDataQuery, KeyDriverOnlineDataSourceType } from "model/report";
import moment from "moment";
import queryString from "query-string";
import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useHistory, useLocation } from "react-router-dom";
import { getKeyDriverOnlineApi } from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import { formatCurrency, parseLocaleNumber } from "utils/AppUtils";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";
import { DATE_FORMAT } from "utils/DateUtils";
import { nonAccentVietnamese } from "utils/PromotionUtils";
import {
  COLUMN_ORDER_LIST,
  convertDataToFlatTableKeyDriver,
  getAllDepartmentByAnalyticResult,
  getInputTargetId,
  handleFocusInput,
  handleMoveFocusInput,
  saveMonthTargetKeyDriver,
} from "./helper";
import { KeyDriverOnlineStyle } from "./index.style";
import KeyDriverOnlineProvider, {
  KeyDriverOfflineContext,
} from "./provider/key-driver-online-provider";

type VerifyCellProps = {
  row: KeyDriverOnlineDataSourceType;
  children: any;
  value: number;
};
const baseColumns: any = [
  {
    title: "CHỈ SỐ KEY",
    key: "name",
    dataIndex: "title",
    width: 220,
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

const SHOP_LEVEL = 3;
const PREFIX_CELL_TABLE = "KEY_DRIVER_ONLINE";
const DEFAULT_KEY_DRIVER_GROUP_LV_1 = "Kinh doanh Online";

const inputTargetDefaultProps: InputNumberProps<any> = {
  className: "input-number",
  formatter: (value?: number) => formatCurrency(value || 0),
  parser: (value?: string) => {
    let parseValue = 0;
    if (value) {
      parseValue = parseLocaleNumber(value);
    }
    return parseValue;
  },
  onFocus: handleFocusInput,
  keyboard: false,
};

function VerifyCell(props: VerifyCellProps) {
  const { row, children, value } = props;
  if (row.key.endsWith(".L")) {
    // Kết thúc bằng .L là những trường không có giá trị. TO bảo thế
    return <></>;
  } else if (!value && typeof value !== "number") {
    return <div>-</div>;
  } else {
    return <div>{children}</div>;
  }
}

function KeyDriverOnline() {
  const history = useHistory();
  // get query from url
  const query = new URLSearchParams(useLocation().search);
  const date = query.get("date") || moment().format(DATE_FORMAT.YYYYMMDD);
  const targetDay = query.get("day");
  const keyDriverGroupLv1 = query.get("keyDriverGroupLv1") || DEFAULT_KEY_DRIVER_GROUP_LV_1;
  const departmentLv2 = query.get("departmentLv2");
  const departmentLv3 = query.get("departmentLv3");

  const [finalColumns, setFinalColumns] = useState<ColumnsType<any>>([]);
  const [loadingPage, setLoadingPage] = useState<boolean | undefined>();
  const { data, setData } = useContext(KeyDriverOfflineContext);
  const dispatch = useDispatch();

  const setObjectiveColumns = useCallback(
    (
      departmentKey: string,
      department: string,
      columnIndex: number,
      columnDrillingLevel: number,
      className: string = "department-name--secondary",
      link: string,
    ): ColumnGroupType<any> | ColumnType<any> => {
      return {
        title: link ? (
          <Link className={classnames("department-name", className)} to={link}>
            {department}
          </Link>
        ) : (
          department
        ),
        className: classnames("", className),
        onHeaderCell: (data: any) => {
          return {
            onClick: () => {
              // console.log("header", data);
            },
          };
        },

        children: [
          {
            title: () => {
              return (
                <div>
                  <span>MỤC TIÊU THÁNG</span>
                </div>
              );
            },
            width: 130,
            align: "center",
            dataIndex: `${departmentKey}_monthly_target`,
            className: "input-cell",
            render: (text: any, record: KeyDriverOnlineDataSourceType, index: number) => {
              const drillLevel = Number(record[`${departmentKey}_drilling_level`]);
              const targetDrillingLevel = Number(record[`${departmentKey}_target_drilling_level`]);

              return (
                <InputNumber
                  id={getInputTargetId(index, columnIndex * 2, PREFIX_CELL_TABLE)}
                  defaultValue={text}
                  disabled={drillLevel > targetDrillingLevel || !drillLevel || !targetDrillingLevel}
                  onPressEnter={(e: any) => {
                    const value = parseLocaleNumber(e.target.value);
                    saveMonthTargetKeyDriver(
                      { total: value },
                      record,
                      columnDrillingLevel,
                      departmentKey,
                      dispatch,
                    );
                    handleMoveFocusInput(
                      index,
                      columnIndex * 2,
                      PREFIX_CELL_TABLE,
                      KeyboardKey.ArrowDown,
                    );
                  }}
                  onKeyDown={(e) => {
                    const event = e;
                    if (event.shiftKey) {
                      handleMoveFocusInput(index, columnIndex * 2, PREFIX_CELL_TABLE, event.key);
                    }
                  }}
                  {...inputTargetDefaultProps}
                />
              );
            },
          },
          {
            title: "LUỸ KẾ",
            width: 130,
            align: "center",
            dataIndex: `${departmentKey}_monthly_actual`,
            className: "input-cell",
            render: (text: any, record: KeyDriverOnlineDataSourceType) => {
              return (
                <VerifyCell row={record} value={text}>
                  {formatCurrency(text)}
                </VerifyCell>
              );
            },
          },
          {
            title: "TỶ LỆ",
            width: 80,
            align: "center",
            dataIndex: `${departmentKey}_monthly_progress`,
            className: "input-cell",
            render: (text: any, record: KeyDriverOnlineDataSourceType) => {
              return (
                <VerifyCell row={record} value={text}>
                  {`${text}%`}
                </VerifyCell>
              );
            },
          },
          {
            title: "DỰ KIẾN ĐẠT",
            width: 130,
            align: "center",
            dataIndex: `${departmentKey}_monthly_forecasted`,
            className: "input-cell",
            render: (text: any, record: KeyDriverOnlineDataSourceType, index: number) => {
              return (
                <VerifyCell row={record} value={text}>
                  {formatCurrency(text)}
                </VerifyCell>
              );
            },
          },
          {
            title: "MỤC TIÊU NGÀY",
            width: 120,
            align: "center",
            dataIndex: `${departmentKey}_daily_target`,
            className: "input-cell",
            render: (text: any, record: KeyDriverOnlineDataSourceType, index: number) => {
              const drillLevel = +record[`${departmentKey}_drilling_level`];
              const targetDrillingLevel = +record[`${departmentKey}_target_drilling_level`];
              return (
                <InputNumber
                  id={getInputTargetId(index, columnIndex * 2 + 1, PREFIX_CELL_TABLE)}
                  disabled={drillLevel > targetDrillingLevel || !drillLevel || !targetDrillingLevel}
                  defaultValue={text}
                  onPressEnter={(e: any) => {
                    const value = parseLocaleNumber(e.target.value);
                    let newTargetDay = Number(targetDay);
                    const day =
                      newTargetDay && newTargetDay > 0 && newTargetDay <= 31
                        ? newTargetDay
                        : moment().date();
                    handleMoveFocusInput(
                      index,
                      columnIndex * 2 + 1,
                      PREFIX_CELL_TABLE,
                      KeyboardKey.ArrowDown,
                    );
                    saveMonthTargetKeyDriver(
                      { [`day_${day}`]: value },
                      record,
                      columnDrillingLevel,
                      departmentKey,
                      dispatch,
                    );
                  }}
                  onKeyDown={(e) => {
                    const event = e;
                    if (event.shiftKey) {
                      handleMoveFocusInput(
                        index,
                        columnIndex * 2 + 1,
                        PREFIX_CELL_TABLE,
                        event.key,
                      );
                    }
                  }}
                  {...inputTargetDefaultProps}
                />
              );
            },
          },
          {
            title: "THỰC ĐẠT",
            width: 120,
            align: "center",
            dataIndex: `${departmentKey}_daily_actual`,
            className: "input-cell",
            render: (text: any, record: KeyDriverOnlineDataSourceType, index: number) => {
              return (
                <VerifyCell row={record} value={text}>
                  {formatCurrency(text)}
                </VerifyCell>
              );
            },
          },
          {
            title: "TỶ LỆ",
            width: 80,
            align: "center",
            dataIndex: `${departmentKey}_daily_progress`,
            className: "input-cell",
            render: (text: any, record: KeyDriverOnlineDataSourceType) => {
              return (
                <VerifyCell row={record} value={text}>
                  {`${text}%`}
                </VerifyCell>
              );
            },
          },
        ],
      };
    },
    [dispatch, targetDay],
  );

  const initTable = useCallback(
    async (
      date: string,
      keyDriverGroupLv1: string,
      departmentLv2: string | null,
      departmentLv3: string | null,
    ) => {
      setLoadingPage(true);
      let allDepartment: { groupedBy: string; drillingLevel: number }[] = [];

      const response: Omit<AnalyticDataQuery, "query"> = await callApiNative(
        { notifyAction: "SHOW_ALL" },
        dispatch,
        getKeyDriverOnlineApi,
        {
          date,
          keyDriverGroupLv1,
          departmentLv2,
          departmentLv3,
        },
      );

      setData(convertDataToFlatTableKeyDriver(response.result, COLUMN_ORDER_LIST));
      allDepartment = getAllDepartmentByAnalyticResult(response.result.data, COLUMN_ORDER_LIST);

      const temp = [...baseColumns];

      allDepartment.forEach(({ groupedBy, drillingLevel }, index: number) => {
        let link = "";
        if (index !== 0 && drillingLevel <= SHOP_LEVEL) {
          const defaultDate = date ? date : moment().format(DATE_FORMAT.YYYYMMDD);
          const columnDepartmentLv2 = drillingLevel === 2 ? groupedBy : departmentLv2;
          const columnDepartmentLv3 = drillingLevel === 3 ? groupedBy : departmentLv3;

          const params = {
            date: defaultDate,
            keyDriverGroupLv1: DEFAULT_KEY_DRIVER_GROUP_LV_1,
            departmentLv2: columnDepartmentLv2,
            departmentLv3: columnDepartmentLv3,
          };

          link = `${UrlConfig.KEY_DRIVER_ONLINE}?${queryString.stringify(params)}`;
        }

        temp.push(
          setObjectiveColumns(
            nonAccentVietnamese(groupedBy),
            groupedBy.toUpperCase(),
            index,
            drillingLevel,
            index === 0 ? "department-name--primary" : undefined,
            link,
          ),
        );
      });
      setFinalColumns(temp);
      setLoadingPage(false);
    },
    [dispatch, setData, setObjectiveColumns],
  );

  useEffect(() => {
    if (keyDriverGroupLv1 && date) {
      initTable(date, keyDriverGroupLv1, departmentLv2, departmentLv3);
    } else {
      const today = moment().format(DATE_FORMAT.YYYYMMDD);
      history.push(
        `${UrlConfig.KEY_DRIVER_ONLINE}/?date=${today}&keyDriverGroupLv1=${DEFAULT_KEY_DRIVER_GROUP_LV_1}`,
      );
    }
  }, [initTable, history, date, keyDriverGroupLv1, departmentLv2, departmentLv3]);

  const day = moment().format(DATE_FORMAT.DDMMYY_HHmm);

  return (
    <ContentContainer
      title={"Báo cáo kết quả kinh doanh Online"}
      breadcrumb={[{ name: "Báo cáo" }, { name: "Báo cáo kết quả kinh doanh Online" }]}
    >
      <KeyDriverOnlineStyle>
        <Card title={`BÁO CÁO NGÀY: ${day}`}>
          {loadingPage === false && (
            <Table
              className="disable-table-style" // để tạm background màu trắng vì chưa group data
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
                    // console.log(record);
                  },
                };
              }}
              expandable={{
                defaultExpandAllRows: true,
              }}
              columns={finalColumns}
              dataSource={data}
            />
          )}
        </Card>
      </KeyDriverOnlineStyle>
    </ContentContainer>
  );
}

const KeyDriverOnlineWithProvider = (props: any) => {
  return (
    <KeyDriverOnlineProvider>
      <KeyDriverOnline {...props} />
    </KeyDriverOnlineProvider>
  );
};

export default KeyDriverOnlineWithProvider;