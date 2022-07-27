import { Card, InputNumber, InputNumberProps, Table, Tooltip } from "antd";
import { ColumnGroupType, ColumnsType, ColumnType } from "antd/lib/table";
import classnames from "classnames";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { KeyboardKey } from "model/other/keyboard/keyboard.model";
import { KeyDriverOnlineDataSourceType } from "model/report";
import moment from "moment";
import queryString from "query-string";
import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useHistory, useLocation, useParams } from "react-router-dom";
import { formatCurrency, parseLocaleNumber } from "utils/AppUtils";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";
import { DATE_FORMAT } from "utils/DateUtils";
import { nonAccentVietnamese } from "utils/PromotionUtils";
import {
  ATTRIBUTE_ORDER_LV_1,
  ATTRIBUTE_ORDER_LV_2,
  ATTRIBUTE_ORDER_LV_3,
  convertDataToFlatTableKeyDriver,
  DRILLING_LEVEL,
  fetchQuery,
  getAllDepartmentByAnalyticResult,
  getInputTargetId,
  getTemplateQueryLevel2and3,
  getTemplateQueryLevel3and4,
  handleFocusInput,
  handleMoveFocusInput,
  LEVEL_1_2_TEMPLATE_QUERY,
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
  const { templateCode } = useParams<{ templateCode: string }>();
  const history = useHistory();
  // get query from url
  const query = new URLSearchParams(useLocation().search);
  const department = query.get("department");
  const shop = query.get("shop");
  const targetDay = query.get("day");

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
                </div>
              );
            },
            width: 130,
            align: "center",
            dataIndex: `${departmentKey}_monthly_target`,
            className: "input-cell",
            render: (
              text: any,
              record: KeyDriverOnlineDataSourceType,
              index: number,
            ) => {
              return (
                <InputNumber
                  id={getInputTargetId(
                    index,
                    columnIndex * 2,
                    PREFIX_CELL_TABLE,
                  )}
                  defaultValue={text}
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
                      handleMoveFocusInput(
                        index,
                        columnIndex * 2,
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
            render: (
              text: any,
              record: KeyDriverOnlineDataSourceType,
              index: number,
            ) => {
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
            render: (
              text: any,
              record: KeyDriverOnlineDataSourceType,
              index: number,
            ) => {
              return (
                <InputNumber
                  id={getInputTargetId(
                    index,
                    columnIndex * 2 + 1,
                    PREFIX_CELL_TABLE,
                  )}
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
            render: (
              text: any,
              record: KeyDriverOnlineDataSourceType,
              index: number,
            ) => {
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
      templateCode: string,
      department: string | null,
      shop: string | null,
    ) => {
      setLoadingPage(true);
      let allDepartment: { name: string; drillingLevel: number }[] = [];
      switch (templateCode) {
        case "level-1":
          const data = await fetchQuery(LEVEL_1_2_TEMPLATE_QUERY, dispatch);
          setData(
            convertDataToFlatTableKeyDriver(
              data.result,
              ["department_lv2"],
              ATTRIBUTE_ORDER_LV_1,
            ),
          );
          allDepartment = getAllDepartmentByAnalyticResult(
            data.result.data,
            ["department_lv2"],
            ATTRIBUTE_ORDER_LV_1,
          );
          break;
        case "level-2":
          const templateQueryLv23 = department
            ? getTemplateQueryLevel2and3(department)
            : null;
          if (templateQueryLv23) {
            const dataLv23 = await fetchQuery(templateQueryLv23, dispatch);
            setData(
              convertDataToFlatTableKeyDriver(
                dataLv23.result,
                ["department_lv3"],
                ATTRIBUTE_ORDER_LV_2,
              ),
            );
            allDepartment = getAllDepartmentByAnalyticResult(
              dataLv23.result.data,
              ["department_lv3"],
              ATTRIBUTE_ORDER_LV_2,
            );
          }
          break;
        case "level-3":
          const templateQueryLv34 = shop
            ? getTemplateQueryLevel3and4(shop)
            : null;
          if (templateQueryLv34) {
            const dataLv34 = await fetchQuery(templateQueryLv34, dispatch);
            setData(
              convertDataToFlatTableKeyDriver(
                dataLv34.result,
                ["department_lv4"],
                ATTRIBUTE_ORDER_LV_3,
              ),
            );
            allDepartment = getAllDepartmentByAnalyticResult(
              dataLv34.result.data,
              ["department_lv4"],
              ATTRIBUTE_ORDER_LV_3,
            );
          }
          break;
      }

      const temp = [...baseColumns];
      allDepartment.forEach(({ name, drillingLevel }, index: number) => {
        let link = "";
        if (index !== 0 && drillingLevel <= SHOP_LEVEL) {
          let params = {};
          if (drillingLevel === DRILLING_LEVEL.DEPARTMENT) {
            params = { department: name };
          } else if (drillingLevel === DRILLING_LEVEL.SHOP) {
            params = { shop: name };
          }
          link = `${
            UrlConfig.KEY_DRIVER_ONLINE
          }/level-${drillingLevel}?${queryString.stringify(params)}`;
        }

        temp.push(
          setObjectiveColumns(
            nonAccentVietnamese(name),
            name.toUpperCase(),
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
    if (templateCode) {
      initTable(templateCode, department, shop);
    } else {
      history.push(`${UrlConfig.KEY_DRIVER_ONLINE}/level-1`);
    }
  }, [shop, department, templateCode, initTable, history]);

  const day = moment().format(DATE_FORMAT.DDMMYY_HHmm);

  return (
    <ContentContainer
      title={"Báo cáo kết quả kinh doanh Online"}
      breadcrumb={[
        { name: "Báo cáo" },
        { name: "Báo cáo kết quả kinh doanh Online" },
      ]}
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
