/* eslint-disable eqeqeq */
import {
  QuestionCircleOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Form, Popover, Row, Select, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import ContentContainer from "component/container/content.container";
import CustomDatePicker from "component/custom/new-date-picker.custom";
import ModalSettingColumnData from "component/table/ModalSettingColumnData";
import { HttpStatus } from "config/http-status.config";
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
import { strForSearch } from "utils/StringUtils";
import { initialAnnotationOnline } from "../analytics/shared/kd-online-annotation";
import KeyDriverAnnotationModal from "../analytics/shared/key-driver-annotation-modal";
import {
  COLUMN_ORDER_LIST,
  DEFAULT_ON_KD_GROUP_LV1,
} from "../common/constant/kd-report-response-key";
import { KDReportDirection } from "../common/enums/kd-report-direction";
import { KDReportName } from "../common/enums/kd-report-name";
import {
  convertDataToFlatTableKeyDriver,
  getAllDepartmentByAnalyticResult,
} from "../common/helpers/convert-data-to-flat-table";
import { convertDataToFlatTableRotation } from "../common/helpers/convert-data-to-flat-table-rotation";
import { filterValueColumns } from "../common/helpers/filter-value-columns";
import { getBreadcrumbByLevel } from "../common/helpers/get-breadcrumb-by-level";
import { KDTableHeader, setObjectiveColumns } from "../common/helpers/set-objective-columns";
import {
  getAllKeyDriverByGroupLevel,
  setTableHorizontalColumns,
} from "../common/helpers/set-table-horizontal-columns";
import { KeyDriverStyle } from "../common/styles/key-driver.style";
import KeyDriverOnlineProvider, {
  KeyDriverOfflineContext,
} from "./provider/key-driver-online-provider";

const { Option } = Select;

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

function KeyDriverOnline() {
  const history = useHistory();
  // get query from url
  const query = new URLSearchParams(useLocation().search);
  const date = query.get("date");
  const keyDriverGroupLv1 = query.get("keyDriverGroupLv1") || DEFAULT_ON_KD_GROUP_LV1;
  const departmentLv2 = query.get("departmentLv2");
  const departmentLv3 = query.get("departmentLv3");
  const groupLevel = query.get("groupLv");
  const reportDirection = query.get("direction");

  const [finalColumns, setFinalColumns] = useState<ColumnsType<any>>([]);
  const [loadingPage, setLoadingPage] = useState<boolean | undefined>();
  const { data, setData } = useContext(KeyDriverOfflineContext);
  const dispatch = useDispatch();
  const [timeForm] = Form.useForm();
  const [filterForm] = Form.useForm();

  const day = date
    ? moment(date).format(DATE_FORMAT.DDMMYYY)
    : moment().format(DATE_FORMAT.DDMMYYY);

  const expandedDefault = localStorage.getItem(LocalStorageKey.KDOnlineRowkeysExpanded);
  const getColumns = localStorage.getItem(LocalStorageKey.KDOnlineColumns);
  const [expandRowKeys, setExpandRowKeys] = useState<any[]>(
    expandedDefault ? JSON.parse(expandedDefault) : [],
  );

  const [isVisibleAnnotation, setIsVisibleAnnotation] = useState(false);
  const keyDriverOnlineAnnotation: any = initialAnnotationOnline;
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
  const [allObjectInDim, setAllObjectInDim] = useState<any[]>([]);
  const [allKDInDim, setAllKDInDim] = useState<any[]>([]);
  const [havePermission, setHavePermission] = useState<boolean>(true);

  const newFinalColumns = useMemo(() => {
    return filterValueColumns(finalColumns, columns);
  }, [columns, finalColumns]);

  const initTable = useCallback(
    async (
      date: string,
      keyDriverGroupLv1: string,
      departmentLv2: string | null,
      departmentLv3: string | null,
    ) => {
      const selectedObjectInDim = filterForm.getFieldsValue(true)["objectInDim"];
      const selectedKDInDim = filterForm.getFieldsValue(true)["kdInDim"];
      setLoadingPage(true);
      let allDepartment: { groupedBy: string; drillingLevel: number }[] = [];
      let currentDrillingLevel: number = 1;
      if (departmentLv3) {
        currentDrillingLevel = 3;
      } else if (departmentLv2) {
        currentDrillingLevel = 2;
      } else if (keyDriverGroupLv1) {
        currentDrillingLevel = 1;
      }
      try {
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
        const { FORBIDDEN, FORBIDDEN_REPORT, SUCCESS } = HttpStatus;
        if (response.data?.code === FORBIDDEN) {
          setHavePermission(false);
          return;
        }
        const queryParams = queryString.parse(history.location.search);
        const {
          direction,
          groupLv,
          groupLvName,
          departmentLv2: departmentLv2Param,
          departmentLv3: departmentLv3Param,
        } = queryParams;
        const { Horizontal } = KDReportDirection;
        if (response.code && response.code !== SUCCESS) {
          const { department_lv2, department_lv3 } = response;
          switch (response.code) {
            case FORBIDDEN_REPORT:
              let newQueries: any = {
                ...queryParams,
                keyDriverGroupLv1: DEFAULT_ON_KD_GROUP_LV1,
              };
              if (department_lv2) {
                newQueries = { ...newQueries, departmentLv2: department_lv2.toUpperCase() };
              }
              if (department_lv3) {
                newQueries = { ...newQueries, departmentLv3: department_lv3.toUpperCase() };
              }
              history.push({ search: queryString.stringify(newQueries) });
              break;
            default:
              setLoadingPage(false);
              break;
          }
          return;
        }
        let temp = [...baseColumns];
        if (direction === Horizontal) {
          setData(() => {
            return convertDataToFlatTableRotation(
              response,
              currentDrillingLevel,
              KDReportName.Online,
              {
                groupLevel: groupLv as string,
                groupLevelName: groupLvName as string,
                selectedObject: selectedObjectInDim || [],
              },
            );
          });
          const allKeyDriverByGroupLevel = getAllKeyDriverByGroupLevel(
            response.result.data,
            currentDrillingLevel,
            {
              groupLv: groupLv as string,
              groupLvName: groupLvName as string,
              queryParams,
              queryString,
              history,
              dispatch,
            },
          );
          setAllKDInDim(allKeyDriverByGroupLevel);
          const horizontalColumns = setTableHorizontalColumns(
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
                if (record.blockAction) {
                  return <span className="deparment-name-horizontal">{text}</span>;
                } else {
                  if (!departmentLv2Param) {
                    return (
                      <Link
                        to={`?${queryString.stringify({
                          ...queryParams,
                          departmentLv2: text,
                        })}`}
                      >
                        <span className="deparment-name-horizontal">{text}</span>
                      </Link>
                    );
                  } else if (!departmentLv3Param) {
                    return (
                      <Link
                        to={`?${queryString.stringify({
                          ...queryParams,
                          departmentLv3: text,
                        })}`}
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
          setData(convertDataToFlatTableKeyDriver(response, COLUMN_ORDER_LIST));
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
                  keyDriverGroupLv1: DEFAULT_ON_KD_GROUP_LV1,
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
        setAllObjectInDim(
          allDepartment.filter((item) => {
            if (departmentLv3) {
              return item.drillingLevel === 4;
            } else if (departmentLv2) {
              return item.drillingLevel === 3;
            } else if (keyDriverGroupLv1) {
              return item.drillingLevel === 2;
            }
            return [];
          }),
        );
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
      initTable(
        moment(date).format(DATE_FORMAT.YYYYMMDD),
        keyDriverGroupLv1,
        departmentLv2,
        departmentLv3,
      );
    } else {
      const today = moment().format(DATE_FORMAT.YYYYMMDD);
      setTimeout(() => {
        timeForm.setFieldsValue({ date: moment() });
      }, 1000);
      const queryParams = queryString.parse(history.location.search);
      const newQueries = {
        "default-screen": "key-driver-online",
        ...queryParams,
        date: today,
        keyDriverGroupLv1: DEFAULT_ON_KD_GROUP_LV1,
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
      "default-screen": "key-driver-online",
      ...queryParams,
      date: newDate,
      keyDriverGroupLv1: DEFAULT_ON_KD_GROUP_LV1,
    };
    history.push({ search: queryString.stringify(newQueries) });
  }, [history, timeForm]);

  const onChangeFilter = () => {
    initTable(
      moment(date).format(DATE_FORMAT.YYYYMMDD),
      keyDriverGroupLv1,
      departmentLv2,
      departmentLv3,
    );
  };

  const onChangeDirection = (direction: KDReportDirection) => {
    const { Vertical, Horizontal } = KDReportDirection;
    const queryParams = queryString.parse(history.location.search);
    setData([]);
    if (direction === Vertical) {
      const { date, keyDriverGroupLv1, departmentLv2, departmentLv3 } = queryParams;
      const newQueries = {
        "default-screen": "key-driver-online",
        date,
        keyDriverGroupLv1,
        departmentLv2,
        departmentLv3,
      };
      history.push({ search: queryString.stringify(newQueries) });
    } else if (direction === Horizontal) {
      const newQueries = {
        ...queryParams,
        direction: Horizontal,
      };
      history.push({ search: queryString.stringify(newQueries) });
    }
  };
  return havePermission ? (
    <ContentContainer
      title={"Báo cáo kết quả kinh doanh Online"}
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
            <Card className="filter-block__direction">
              {reportDirection === KDReportDirection.Horizontal ? (
                <Button
                  icon={<RotateRightOutlined />}
                  className="filter-block-rotation-btn text-primary"
                  title="Đảo chiều báo cáo"
                  onClick={() => onChangeDirection(KDReportDirection.Vertical)}
                ></Button>
              ) : (
                <Button
                  icon={<RotateLeftOutlined />}
                  className="filter-block-rotation-btn"
                  title="Đảo chiều báo cáo"
                  onClick={() => onChangeDirection(KDReportDirection.Horizontal)}
                ></Button>
              )}
            </Card>
          </Col>
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
            <Card>
              <Form form={filterForm}>
                <Row gutter={8}>
                  <Col>
                    <Form.Item name="objectInDim">
                      <Select
                        disabled={loadingPage}
                        mode="multiple"
                        placeholder="Chọn đối tượng"
                        showArrow
                        showSearch
                        optionFilterProp="children"
                        style={{ width: 250 }}
                        maxTagCount={"responsive"}
                        filterOption={(input: String, option: any) => {
                          if (option.props.value) {
                            return strForSearch(option.props.children).includes(
                              strForSearch(input),
                            );
                          }
                          return false;
                        }}
                      >
                        {allObjectInDim.map((item, index) => (
                          <Option key={"objectFilter" + index} value={item.groupedBy}>
                            {item.groupedBy}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  {reportDirection === KDReportDirection.Horizontal ? (
                    <Col>
                      <Form.Item name="kdInDim">
                        <Select
                          disabled={loadingPage}
                          mode="multiple"
                          placeholder="Chọn chỉ số"
                          showArrow
                          showSearch
                          optionFilterProp="children"
                          style={{ width: 250 }}
                          maxTagCount={"responsive"}
                          filterOption={(input: String, option: any) => {
                            if (option.props.value) {
                              return strForSearch(option.props.children).includes(
                                strForSearch(input),
                              );
                            }
                            return false;
                          }}
                        >
                          {allKDInDim.map((item, index) => (
                            <Option key={"dimFilter" + index} value={item.keyDriver}>
                              {item.keyDriver}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  ) : (
                    ""
                  )}
                  <Button
                    htmlType="submit"
                    type="primary"
                    loading={loadingPage}
                    onClick={onChangeFilter}
                    className="ml-1 mr-1"
                  >
                    Áp dụng
                  </Button>
                </Row>
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
            className="disable-table-style" // để tạm background màu trắng vì chưa group data
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
                console.log("rowKeys", rowKeys);
                setExpandRowKeys(rowKeys);
                localStorage.setItem(
                  LocalStorageKey.KDOnlineRowkeysExpanded,
                  JSON.stringify(rowKeys),
                );
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
              localStorage.setItem(LocalStorageKey.KDOnlineColumns, JSON.stringify(data));
            }}
            data={columns}
          />
        </Card>
        <KeyDriverAnnotationModal
          isVisiable={isVisibleAnnotation}
          handleCancel={() => setIsVisibleAnnotation(false)}
          annotationData={keyDriverOnlineAnnotation}
        />
      </KeyDriverStyle>
    </ContentContainer>
  ) : (
    <NoPermission></NoPermission>
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
