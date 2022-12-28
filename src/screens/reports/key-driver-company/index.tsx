/* eslint-disable eqeqeq */
import { QuestionCircleOutlined, SettingOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Popover, Row, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import ContentContainer from "component/container/content.container";
import CustomDatePicker from "component/custom/new-date-picker.custom";
import ModalSettingColumnData from "component/table/ModalSettingColumnData";
import { HttpStatus } from "config/http-status.config";
// import { KeyboardKey } from "model/other/keyboard/keyboard.model";
import { LocalStorageKey } from "model/report";
import moment from "moment";
import queryString from "query-string";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useHistory, useLocation } from "react-router-dom";
import NoPermission from "screens/no-permission.screen";
import { getKeyDriverOnlineApi } from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";
import { DATE_FORMAT } from "utils/DateUtils";
import { nonAccentVietnameseKD } from "utils/KeyDriverOfflineUtils";
import { initialAnnotationOffline } from "../analytics/shared/kd-offline-annotation";
import KeyDriverAnnotationModal from "../analytics/shared/key-driver-annotation-modal";
import {
  COLUMN_ORDER_LIST,
  DEFAULT_COMPANY_KD_GROUP,
  DEFAULT_OFF_KD_GROUP_LV1,
  DEFAULT_ON_KD_GROUP_LV1,
} from "../common/constant/kd-report-response-key";
import { KDReportDirection } from "../common/enums/kd-report-direction";
import { KDReportName } from "../common/enums/kd-report-name";
import {
  convertDataToFlatTableKeyDriver,
  getAllDepartmentByAnalyticResult,
} from "../common/helpers/convert-data-to-flat-table";
import { convertDataCompanyToFlatTableRotation } from "../common/helpers/convert-data-to-flat-table-rotation";
import { filterValueColumns } from "../common/helpers/filter-value-columns";
import { getBreadcrumbByLevel } from "../common/helpers/get-breadcrumb-by-level";
import {
  getAllKDByGroupLevel,
  setCompanyTableColumns,
} from "../common/helpers/set-company-table-columns";
import { KDTableHeader, setObjectiveColumns } from "../common/helpers/set-objective-columns";
import { KeyDriverStyle } from "../common/kd-report/index.style";
import KDCompanyProvider, { KDCompanyContext } from "./provider/kd-company-provider";

const baseColumns: any = [
  {
    title: "Chỉ số key",
    key: "name",
    dataIndex: "title",
    width: 220,
    fixed: "left",
    render: (text: string, record: any) => {
      return (
        <Popover
          content={<div style={{ width: 200 }}>{record.method}</div>}
          title={<div style={{ width: 200 }}>{text}</div>}
          placement="rightBottom"
          className="text-truncate-2 key-cell"
        >
          {text}
        </Popover>
      );
    },
  },
];

const SHOP_LEVEL = 3;
// const PREFIX_CELL_TABLE = "KEY_DRIVER_ONLINE";

function KDCompany() {
  const history = useHistory();
  // get query from url
  const query = new URLSearchParams(useLocation().search);
  const date = query.get("date");
  const keyDriverGroupLv1 = query.get("keyDriverGroupLv1") || DEFAULT_COMPANY_KD_GROUP;
  const departmentLv2 = query.get("departmentLv2");
  const departmentLv3 = query.get("departmentLv3");
  const groupLevel = query.get("groupLv");
  const reportDirection = query.get("direction");

  const [finalColumns, setFinalColumns] = useState<ColumnsType<any>>([]);
  const [loadingPage, setLoadingPage] = useState<boolean | undefined>();
  const { data, setData } = useContext(KDCompanyContext);
  const dispatch = useDispatch();
  const [timeForm] = Form.useForm();
  const [filterForm] = Form.useForm();

  const day = date
    ? moment(date).format(DATE_FORMAT.DDMMYYY)
    : moment().format(DATE_FORMAT.DDMMYYY);

  const getColumns = localStorage.getItem(LocalStorageKey.KDCompanyColumns);
  const [expandRowKeys, setExpandRowKeys] = useState<any[]>([
    "Tổng công ty",
    "Khối kinh doanh Online",
    "Khối kinh doanh Offline",
  ]);

  const [isVisibleAnnotation, setIsVisibleAnnotation] = useState(false);
  const keyDriverAnnotation: any = initialAnnotationOffline;
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  const [columns, setColumns] = useState<any[]>(
    getColumns
      ? JSON.parse(getColumns)
      : [
          {
            title: "Mục tiêu tháng",
            name: "monthly_target",
            index: 0,
            visible: true,
          },
          {
            title: "Luỹ kế",
            name: "monthly_actual",
            index: 1,
            visible: true,
            fixed: true,
          },
          {
            title: "Tỷ lệ (Luỹ kế/Mục tiêu tháng)",
            name: "monthly_progress",
            index: 2,
            visible: true,
          },
          {
            title: "Dự kiến đạt",
            name: "monthly_forecasted",
            index: 3,
            visible: true,
          },
          {
            title: "Tỷ lệ (Dự kiến đạt/Mục tiêu tháng)",
            name: "monthly_forecasted_progress",
            index: 4,
            visible: true,
          },
          {
            title: "Mục tiêu ngày",
            name: "daily_target",
            index: 5,
            visible: true,
          },
          {
            title: "Thực đạt",
            name: "daily_actual",
            index: 6,
            visible: true,
            fixed: true,
          },
          {
            title: "Tỷ lệ (Thực đạt/Mục tiêu ngày)",
            name: "daily_progress",
            index: 7,
            visible: true,
          },
        ],
  );
  const [havePermission, setHavePermission] = useState<boolean>(true);

  const newFinalColumns = useMemo(() => {
    return filterValueColumns(finalColumns, columns);
  }, [columns, finalColumns]);

  const initTable = useCallback(
    async (date: string, keyDriverGroupLv1: string) => {
      const selectedObjectInDim = filterForm.getFieldsValue(true)["objectInDim"];
      const selectedKDInDim = filterForm.getFieldsValue(true)["kdInDim"];
      setLoadingPage(true);
      let allDepartment: { groupedBy: string; drillingLevel: number }[] = [];
      try {
        let currentDrillingLevel: number = 1;
        const response = await callApiNative(
          { isShowError: true },
          dispatch,
          getKeyDriverOnlineApi,
          {
            date,
            keyDriverGroupLv1,
            departmentLv2,
            departmentLv3,
          },
        );
        const { FORBIDDEN, SUCCESS } = HttpStatus;
        if (response.data?.code === FORBIDDEN) {
          setHavePermission(false);
          return;
        }
        const queryParams = queryString.parse(history.location.search);
        const { direction, groupLv, groupLvName } = queryParams;
        const { Horizontal } = KDReportDirection;
        let temp = [...baseColumns];
        if (response.code && response.code !== SUCCESS) {
          setLoadingPage(false);
          return;
        }
        if (direction === Horizontal) {
          setData(() => {
            return convertDataCompanyToFlatTableRotation(response, currentDrillingLevel, {
              groupLevel: groupLv as string,
              groupLevelName: groupLvName as string,
              selectedObject: selectedObjectInDim || [],
            });
          });
          const allKeyDriverByGroupLevel = getAllKDByGroupLevel(
            response.result.data,
            currentDrillingLevel,
          );
          const horizontalColumns = setCompanyTableColumns(
            allKeyDriverByGroupLevel.filter(
              (item) =>
                !selectedKDInDim?.length ||
                selectedKDInDim.findIndex(
                  (selectedKDCode: string) => selectedKDCode === item.keyDriver,
                ) !== -1,
            ),
            setObjectiveColumns,
            {
              groupLv: groupLv as string,
              groupLvName: groupLvName as string,
              queryParams,
              queryString,
              history,
              dispatch,
            },
          );
          temp = [
            {
              title: "Khu vực",
              key: "name",
              dataIndex: "title",
              className: "font-size-12px",
              width: 220,
              fixed: "left",
              render: (text: string, record: any) => {
                const { blockAction, department_lv2, department_lv3 } = record;
                if (
                  blockAction ||
                  (department_lv3 && department_lv3.toLowerCase().includes("khác ("))
                ) {
                  return <span className="deparment-name-horizontal">{text}</span>;
                } else {
                  let defaultScreen = "";
                  let keyDriverGroupLv1 = "";
                  if (
                    department_lv2 &&
                    department_lv2.toLowerCase().includes(DEFAULT_OFF_KD_GROUP_LV1.toLowerCase())
                  ) {
                    defaultScreen = "key-driver-offline";
                    keyDriverGroupLv1 = DEFAULT_OFF_KD_GROUP_LV1;
                  } else if (
                    department_lv2 &&
                    department_lv2.toLowerCase().includes(DEFAULT_ON_KD_GROUP_LV1.toLowerCase())
                  ) {
                    defaultScreen = "key-driver-online";
                    keyDriverGroupLv1 = DEFAULT_ON_KD_GROUP_LV1;
                  }
                  if (department_lv3) {
                    return (
                      <Link
                        to={`?${queryString.stringify({
                          date,
                          direction,
                          "default-screen": defaultScreen,
                          keyDriverGroupLv1,
                          departmentLv2: department_lv3,
                        })}`}
                        target="_blank"
                      >
                        <span className="deparment-name-horizontal">{text}</span>
                      </Link>
                    );
                  } else if (department_lv2) {
                    return (
                      <Link
                        to={`?${queryString.stringify({
                          date,
                          direction,
                          "default-screen": defaultScreen,
                          keyDriverGroupLv1,
                        })}`}
                        target="_blank"
                      >
                        <span className="deparment-name-horizontal">{text}</span>
                      </Link>
                    );
                  } else {
                    return <span className="deparment-name-horizontal">{text}</span>;
                  }
                }
              },
            },
            ...horizontalColumns,
          ];
          allDepartment = getAllDepartmentByAnalyticResult(response.result.data, COLUMN_ORDER_LIST);
        } else {
          setData(() => {
            return convertDataToFlatTableKeyDriver(response, COLUMN_ORDER_LIST, {
              currentDrillingLevel,
              name: KDReportName.Offline,
            });
          });
          allDepartment = getAllDepartmentByAnalyticResult(response.result.data, COLUMN_ORDER_LIST);
          allDepartment
            .filter(
              (item) =>
                !selectedObjectInDim?.length ||
                selectedObjectInDim?.includes(item.groupedBy) ||
                item.drillingLevel === currentDrillingLevel,
            )
            .forEach(({ groupedBy, drillingLevel }, index: number) => {
              let link = "";
              if (index !== 0 && drillingLevel <= SHOP_LEVEL) {
                const defaultDate = date ? date : moment().format(DATE_FORMAT.YYYYMMDD);
                const columnDepartmentLv2 = drillingLevel === 2 ? groupedBy : departmentLv2;
                const columnDepartmentLv3 = drillingLevel === 3 ? groupedBy : departmentLv3;

                const params = {
                  ...queryParams,
                  date: defaultDate,
                  keyDriverGroupLv1: DEFAULT_COMPANY_KD_GROUP,
                  departmentLv2: columnDepartmentLv2,
                  departmentLv3: columnDepartmentLv3,
                };

                link = `?${queryString.stringify(params)}`;
              }

              const kdTableHeader: KDTableHeader = {
                departmentKey: nonAccentVietnameseKD(groupedBy),
                department: groupedBy.toUpperCase(),
                columnIndex: index,
                departmentDrillingLevel: drillingLevel,
                className: index === 0 ? "department-name--primary" : "department-name--secondary",
                link,
              };
              temp.push(setObjectiveColumns(kdTableHeader, queryString, history, dispatch));
            });
        }

        setFinalColumns(temp);
        setLoadingPage(false);
      } catch (error) {
        console.log("error", error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, setData, setObjectiveColumns],
  );

  useEffect(() => {
    filterForm.setFieldsValue({ objectInDim: [], kdInDim: [] });
    if (keyDriverGroupLv1 && date) {
      initTable(moment(date).format(DATE_FORMAT.YYYYMMDD), keyDriverGroupLv1);
    } else {
      const today = moment().format(DATE_FORMAT.YYYYMMDD);
      setTimeout(() => {
        timeForm.setFieldsValue({ date: moment() });
      }, 1000);
      const queryParams = queryString.parse(history.location.search);
      const newQueries = {
        ...queryParams,
        date: today,
        keyDriverGroupLv1: DEFAULT_COMPANY_KD_GROUP,
        direction: KDReportDirection.Horizontal,
      };
      history.push({ search: queryString.stringify(newQueries) });
    }
  }, [
    initTable,
    history,
    date,
    keyDriverGroupLv1,
    departmentLv2,
    departmentLv3,
    timeForm,
    filterForm,
    groupLevel,
    reportDirection,
  ]);

  const onFinish = useCallback(() => {
    let date = timeForm.getFieldsValue(true)["date"];
    let newDate = "";
    if (date) {
      newDate = moment(date, DATE_FORMAT.DDMMYYY).format(DATE_FORMAT.YYYYMMDD);
    } else {
      newDate = moment().format(DATE_FORMAT.YYYYMMDD);
      setTimeout(() => {
        timeForm.setFieldsValue({ date: moment() });
      }, 1000);
    }
    const queryParams = queryString.parse(history.location.search);
    const newQueries = {
      ...queryParams,
      date: newDate,
      keyDriverGroupLv1: DEFAULT_COMPANY_KD_GROUP,
    };
    history.push({ search: queryString.stringify(newQueries) });
  }, [timeForm, history]);

  return havePermission ? (
    <ContentContainer
      title={"Báo cáo kết quả kinh doanh Tổng công ty"}
      extra={
        <Button type="primary" ghost onClick={() => setIsVisibleAnnotation(true)}>
          <QuestionCircleOutlined />
          <span className="margin-left-10">Giải thích thuật ngữ</span>
        </Button>
      }
      breadcrumb={getBreadcrumbByLevel(
        queryString.parse(history.location.search),
        departmentLv2,
        departmentLv3,
      )}
    >
      <KeyDriverStyle>
        <Row gutter={8}>
          <Col>
            <Card>
              <Form
                onFinish={onFinish}
                onFinishFailed={() => {}}
                form={timeForm}
                name="report-form-base"
                layout="inline"
                initialValues={{
                  date: date
                    ? moment(date).format(DATE_FORMAT.DDMMYYY)
                    : moment().format(DATE_FORMAT.DDMMYYY),
                }}
              >
                <Form.Item name="date">
                  <CustomDatePicker
                    format={DATE_FORMAT.DDMMYYY}
                    placeholder="Chọn ngày"
                    style={{ width: "100%" }}
                    onChange={() => onFinish()}
                    showToday={false}
                  />
                </Form.Item>
              </Form>
            </Card>
          </Col>
          <Col>
            <Card className="filter-block__direction">
              <Button
                className="btn-setting"
                title="Ẩn/hiện cột"
                icon={<SettingOutlined />}
                onClick={() => setShowSettingColumn(true)}
              />
            </Card>
          </Col>
        </Row>
        <Card title={`BÁO CÁO NGÀY: ${day}`}>
          <Table
            scroll={{ x: "max-content" }}
            sticky={{
              offsetHeader: OFFSET_HEADER_UNDER_NAVBAR,
              offsetScroll: 5,
            }}
            indentSize={6}
            bordered
            pagination={false}
            onRow={(record: any) => {
              return {
                onClick: () => {
                  // console.log(record);
                },
              };
            }}
            expandedRowKeys={expandRowKeys}
            expandable={{
              defaultExpandAllRows: true,
              onExpandedRowsChange: (rowKeys: any) => {
                setExpandRowKeys(rowKeys);
                // localStorage.setItem(
                //   LocalStorageKey.KDCompanyRowkeysExpanded,
                //   JSON.stringify(rowKeys),
                // );
              },
            }}
            rowClassName={(record: any, rowIndex: any) => {
              if (!expandRowKeys.includes(record.key) || !record.children) {
                return "expand-parent";
              }
              return "";
            }}
            columns={newFinalColumns}
            dataSource={data}
            loading={loadingPage}
            onChange={(pagination, filters, sorter: any) => {
              if (sorter) {
                switch (sorter.order) {
                  case "ascend":
                    const newData1 = {
                      ...data[0],
                      children: data[0].children.sort(
                        (a: any, b: any) =>
                          (b[sorter.field] ? b[sorter.field] : 0) -
                          (a[sorter.field] ? a[sorter.field] : 0),
                      ),
                    };
                    setData([newData1]);
                    break;
                  case "descend":
                    const newData2 = {
                      ...data[0],
                      children: data[0].children.sort(
                        (a: any, b: any) =>
                          (a[sorter.field] ? a[sorter.field] : 0) -
                          (b[sorter.field] ? b[sorter.field] : 0),
                      ),
                    };
                    setData([newData2]);
                    break;
                  default:
                    break;
                }
              }
            }}
          />
          <ModalSettingColumnData
            visible={showSettingColumn}
            onCancel={() => setShowSettingColumn(false)}
            onOk={(data) => {
              setShowSettingColumn(false);
              setColumns(data);
              localStorage.setItem(LocalStorageKey.KDCompanyColumns, JSON.stringify(data));
            }}
            data={columns}
          />
        </Card>
        <KeyDriverAnnotationModal
          isVisiable={isVisibleAnnotation}
          handleCancel={() => setIsVisibleAnnotation(false)}
          annotationData={keyDriverAnnotation}
        />
      </KeyDriverStyle>
    </ContentContainer>
  ) : (
    <NoPermission></NoPermission>
  );
}

const KDCompanyWithProvider = (props: any) => {
  return (
    <KDCompanyProvider>
      <KDCompany {...props} />
    </KDCompanyProvider>
  );
};

export default KDCompanyWithProvider;
