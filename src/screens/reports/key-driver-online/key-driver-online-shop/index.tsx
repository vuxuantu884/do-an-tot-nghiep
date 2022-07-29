import { CheckSquareOutlined } from "@ant-design/icons";
import { Button, Card, InputNumber, Table, Tooltip } from "antd";
import { ColumnGroupType, ColumnsType, ColumnType } from "antd/lib/table";
import classnames from "classnames";
import ContentContainer from "component/container/content.container";
import { AppConfig } from "config/app.config";
import UrlConfig from "config/url.config";
import { debounce } from "lodash";
import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { formatCurrency } from "utils/AppUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import { nonAccentVietnamese } from "utils/PromotionUtils";
import ShopsSelect from "../components/shops-select";
import { KeyDriverOnlineStyle } from "../index.style";
import KDOnlineShopProvider, { KDOnlineShopContext } from "../provider/kd-online-shop-provider";

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

function CellInput(props: RowRender) {
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
      }, AppConfig.TYPING_TIME_REQUEST)}
    />
  );
}

function KeyDriverOnlineShop() {
  const [finalColumns, setFinalColumns] = useState<ColumnsType<any>>([]);
  const [loadingPage, setLoadingPage] = useState<boolean | undefined>();
  const { data, selectedCN, selectedShops } = useContext(KDOnlineShopContext);
  const cnName = useParams<{ cnName: string }>().cnName.toUpperCase();

  const updateTargetMonth = useCallback(async (departmentKey: string) => {}, []);

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
              return <CellInput value={text} record={record} type={departmentKey} time="month" />;
            },
          },
          {
            title: "TT LUỸ KẾ",
            width: 130,
            align: "center",
            dataIndex: `${departmentKey}_accumulatedMonth`,
            className: "input-cell",
            render: (text: any, record: RowData, index: number) => {
              return text ? formatCurrency(text) : "-";
            },
          },
          {
            title: "TỶ LỆ",
            width: 80,
            align: "center",
            dataIndex: `${departmentKey}_rateMonth`,
            className: "input-cell",
            render: (text: any, record: RowData, index: number) => {
              return text ? `${text}%` : "-";
            },
          },
          {
            title: "DỰ KIẾN ĐẠT",
            width: 130,
            align: "center",
            dataIndex: `${departmentKey}_targetMonth`,
            className: "input-cell",
            render: (text: any, record: RowData, index: number) => {
              return text ? formatCurrency(text) : "-";
            },
          },
          {
            title: "MỤC TIÊU NGÀY",
            width: 120,
            align: "center",
            dataIndex: `${departmentKey}_day`,
            className: "input-cell",
            render: (text: any, record: RowData, index: number) => {
              return text ? formatCurrency(text) : "-";
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
              return text ? formatCurrency(text) : "-";
            },
          },
          {
            title: "TỶ LỆ",
            width: 80,
            align: "center",
            dataIndex: `${departmentKey}_rateDay`,
            className: "input-cell",
            render: (text: any, record: RowData, index: number) => {
              return text ? `${text}%` : "-";
            },
          },
        ],
      };
    },
    [updateTargetMonth],
  );

  useEffect(() => {
    const temp = [...baseColumns];
    selectedShops.forEach((shop) => {
      temp.push(setObjectiveColumns(nonAccentVietnamese(shop), shop.toUpperCase()));
    });
    setFinalColumns(temp);
    setLoadingPage(false);
  }, [selectedShops, setObjectiveColumns]);

  const day = moment().format(DATE_FORMAT.DDMMYY_HHmm);

  return (
    <ContentContainer
      title={`Báo cáo kết quả kinh doanh Online ${selectedCN}`}
      breadcrumb={[
        {
          name: "Báo cáo kết quả kinh doanh Online",
          path: `${UrlConfig.KEY_DRIVER_ONLINE}`,
        },
        { name: `Báo cáo kết quả kinh doanh Online ${selectedCN}` },
      ]}
    >
      <KeyDriverOnlineStyle>
        <Card>
          <div className="stores-kd-online-filter">
            <h1 className="title">BỘ LỌC</h1>
            <ShopsSelect cnName={cnName} className="select-filter" />
          </div>
        </Card>
        <Card title={`BÁO CÁO NGÀY: ${day}`}>
          {selectedShops.length > 0 && loadingPage === false && (
            <Table
              loading={loadingPage}
              scroll={{ x: "max-content" }}
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
          )}
        </Card>
      </KeyDriverOnlineStyle>
    </ContentContainer>
  );
}

const StoresKeyDriverOfflineWithProvider = (props: any) => {
  return (
    <KDOnlineShopProvider>
      <KeyDriverOnlineShop {...props} />
    </KDOnlineShopProvider>
  );
};

export default StoresKeyDriverOfflineWithProvider;
