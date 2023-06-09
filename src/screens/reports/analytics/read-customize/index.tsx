import { QuestionCircleOutlined } from "@ant-design/icons";
import { Button, Collapse, Form } from "antd";
import exportIcon from "assets/icon/export.svg";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import { AnnotationDataList, TIME_GROUP_BY } from "config/report";
import UrlConfig from "config/url.config";
import { RootReducerType } from "model/reducers/RootReducerType";
import {
  AnalyticChartInfo,
  AnalyticCube,
  AnalyticCustomize,
  AnalyticGroup,
  AnalyticQuery,
  AnnotationData,
  ChartTypeValue,
  FIELD_FORMAT,
  ReportProperty,
  SUBMIT_MODE,
} from "model/report/analytics.model";
import moment from "moment";
import React, { useCallback, useContext, useEffect, useMemo } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import NoPermission from "screens/no-permission.screen";
import {
  deleteAnalyticsCustomService,
  executeAnalyticsQueryService,
  getAnalyticsCustomByIdService,
  saveAnalyticsCustomService,
  updateAnalyticsCustomService,
} from "service/report/analytics.service";
import { callApiNative } from "utils/ApiUtils";
import {
  checkArrayHasAnyValue,
  exportReportToExcel,
  formatReportTime,
  formatSubStatusReportDataUtils,
  getChartQuery,
  getConditionsFormServerToForm,
  getNoPermissionStores,
  getPermissionViewCustomizeReport,
  getPropertiesValue,
  getTranslatePropertyKey,
  setReportsCustomizeUrl,
} from "utils/ReportUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import { ReportBottomBarStyle } from "../index.style";
import AnalyticsForm, { ReportifyFormFields } from "../shared/analytics-form";
import AnalyticsProvider, { AnalyticsContext } from "../shared/analytics-provider";
import AnnotationTableModal from "../shared/annotation-table-modal";
import ModalFormAnalyticsInfo from "../shared/form-analytics-info-modal";

const { Panel } = Collapse;

function CreateAnalytics() {
  const [form] = Form.useForm();
  const [formEditInfo] = Form.useForm();
  const [formCloneReport] = Form.useForm();
  const history = useHistory();
  const dispatch = useDispatch();
  let { id } = useParams<{ id: string }>();

  const [reportInfo, setReportInfo] = React.useState<AnalyticCustomize>({} as AnalyticCustomize);
  const {
    setMetadata,
    setDataQuery,
    dataQuery,
    chartColumnSelected,
    setChartDataQuery,
    setRowsInQuery,
    setActiveFilters,
    setChartColumnSelected,
    isMyReport,
    setIsMyReport,
    setLoadingChart,
    permissionViewReport,
    setPermissionViewReport,
    setPermissionStores,
  } = useContext(AnalyticsContext);
  const [mode, setMode] = React.useState<SUBMIT_MODE>(SUBMIT_MODE.GET_DATA);
  const [isLoadingExport, setIsLoadingExport] = React.useState<boolean>(false);
  const [isModalEditNameVisible, setIsModalEditNameVisible] = React.useState<boolean>(false);
  const [isConfirmDeleteVisible, setIsConfirmDeleteVisible] = React.useState<boolean>(false);
  const [chartInfo, setChartInfo] = React.useState<AnalyticChartInfo>({
    showChart: true,
    message: "",
  });
  const [visiableCloneReportModal, setVisiableCloneReportModal] = React.useState(false);
  const [isVisibleAnnotation, setIsVisibleAnnotation] = React.useState(false);

  const username = useSelector((state: RootReducerType) => state.userReducer.account?.user_name);
  const allPermissions = useSelector(
    (state: RootReducerType) => state.permissionReducer?.permissions,
  );
  const myStores = useSelector(
    (state: RootReducerType) => state.userReducer.account?.account_stores,
  );

  const currentAnnotation: AnnotationData | undefined = useMemo(() => {
    return AnnotationDataList.find(
      (item) => dataQuery && item.cubes.includes(dataQuery.query.cube as AnalyticCube),
    );
  }, [dataQuery]);

  const handleRQuery = useCallback(
    async (rQuery: string, params: AnalyticQuery) => {
      console.log(rQuery);
      let name = "";
      const timeOptionAt = form.getFieldValue(ReportifyFormFields.timeAtOption);
      switch (mode) {
        case SUBMIT_MODE.EXPORT_EXCEL:
          setIsLoadingExport(true);
          await exportReportToExcel(
            dispatch,
            timeOptionAt ? { q: rQuery, options: timeOptionAt } : { q: rQuery },
            reportInfo?.name,
          );
          setIsLoadingExport(false);
          break;
        case SUBMIT_MODE.SAVE_QUERY:
          name = formEditInfo.getFieldValue("name");
          const chartQuery = getChartQuery(params, chartColumnSelected || []);
          if (Number(id) && name) {
            const response = await callApiNative(
              { notifyAction: "SHOW_ALL" },
              dispatch,
              updateAnalyticsCustomService,
              Number(id),
              {
                query: rQuery,
                chart_query: chartQuery,
                options: timeOptionAt,
              },
            );
            if (response) {
              showSuccess("Cập nhật báo cáo thành công");
            } else {
              showError("Cập nhật báo cáo không thành công");
            }
          }
          break;
        case SUBMIT_MODE.SAVE_NAME:
          name = formEditInfo.getFieldValue("name");
          if (name) {
            const response = await callApiNative(
              { notifyAction: "SHOW_ALL" },
              dispatch,
              updateAnalyticsCustomService,
              Number(id),
              { name: name },
            );
            if (response && response.name) {
              setReportInfo((prev) => ({ ...prev, name: response.name }));

              showSuccess("Cập nhật báo cáo thành công");
            } else {
              showError("Cập nhật báo cáo không thành công");
            }
          }
          break;
        case SUBMIT_MODE.CLONE_REPORT:
          name = formCloneReport.getFieldValue("name");
          if (name) {
            const chartQuery = getChartQuery(params, chartColumnSelected || []);

            const response = await callApiNative(
              { notifyAction: "SHOW_ALL" },
              dispatch,
              saveAnalyticsCustomService,
              {
                query: rQuery,
                group: reportInfo?.group || "",
                name,
                chart_query: chartQuery,
                options: timeOptionAt,
              },
            );
            if (response) {
              showSuccess("Nhân bản thành công");
              history.push(`${UrlConfig.ANALYTICS}/${response.id}`);
            } else {
              showError("Nhân bản báo cáo không thành công ");
            }
          }
          break;
      }

      setMode(SUBMIT_MODE.GET_DATA);
    },
    [
      mode,
      dispatch,
      reportInfo,
      chartColumnSelected,
      history,
      id,
      form,
      formEditInfo,
      formCloneReport,
    ],
  );

  const handleSaveReport = () => {
    setMode(SUBMIT_MODE.SAVE_QUERY);
    form.submit();
  };

  const handleExportReport = () => {
    setIsLoadingExport(true);
    setMode(SUBMIT_MODE.EXPORT_EXCEL);
    form.submit();
  };

  const handleOk = async () => {
    try {
      await formEditInfo.validateFields();
      setMode(SUBMIT_MODE.SAVE_NAME);
      form.submit();
      setIsModalEditNameVisible(false);
    } catch {}
  };
  const handleCancel = () => {
    setIsModalEditNameVisible(false);
  };

  const handleCloneReport = async () => {
    try {
      await formCloneReport.validateFields();
      setMode(SUBMIT_MODE.CLONE_REPORT);
      form.submit();
      setVisiableCloneReportModal(false);
    } catch {}
  };

  const handleCancelCloneReport = () => {
    setVisiableCloneReportModal(false);
  };

  const confirmDelete = async () => {
    if (Number(id)) {
      const response = await callApiNative(
        { notifyAction: "SHOW_ALL" },
        dispatch,
        deleteAnalyticsCustomService,
        Number(id),
      );
      if (response !== null) {
        showSuccess("Xóa báo cáo thành công");
        history.push(UrlConfig.ANALYTIC_SALES_OFFLINE);
      } else {
        showError("Xóa báo cáo không thành công");
      }
    }
    setIsConfirmDeleteVisible(false);
  };

  const fetchQueryData = useCallback(async () => {
    const report: AnalyticCustomize = await callApiNative(
      { isShowLoading: true },
      dispatch,
      getAnalyticsCustomByIdService,
      Number(id),
    );
    setReportInfo(report);
    // let havePermissionStore = true;
    if (report && report.query) {
      const isPermission = getPermissionViewCustomizeReport(
        allPermissions,
        report.group as AnalyticGroup,
      );
      setPermissionViewReport(() => {
        return { isPermission };
      });
      if (isPermission !== "1") {
        return;
      }
      if (username && username.toLocaleLowerCase() === report.created_by?.toLocaleLowerCase()) {
        setIsMyReport(true);
      } else {
        setIsMyReport(false);
      }

      formEditInfo.setFieldsValue({
        name: report.name,
      });

      formCloneReport.setFieldsValue({ name: `${report.name} nhân bản` });
      const { OfflineSales, Sales, Costs, SalesBySubStatus } = AnalyticGroup;
      const fullParams = [OfflineSales, Sales, Costs, SalesBySubStatus].includes(
        report.group as AnalyticGroup,
      )
        ? { q: report.query, options: report.options }
        : { q: report.query };
      const response = await callApiNative(
        { notifyAction: "SHOW_ALL" },
        dispatch,
        executeAnalyticsQueryService,
        fullParams,
      );
      if (response) {
        const { columns, rows, conditions, from, to, order_by: orderBy, cube } = response.query;
        const timeGroup = checkArrayHasAnyValue(
          rows || [],
          TIME_GROUP_BY.map((item) => item.value),
        );

        const propertiesValue = getPropertiesValue(rows || [], response);
        const whereValue = getConditionsFormServerToForm(conditions || []);
        if (
          Object.keys(whereValue).length &&
          Object.keys(whereValue).includes(ReportProperty.PosLocationName) &&
          whereValue[ReportProperty.PosLocationName]
        ) {
          const filterStores = whereValue[ReportProperty.PosLocationName];
          const noPermissionStore = getNoPermissionStores(filterStores, myStores);
          setPermissionStores(() => [...noPermissionStore]);
          // if (noPermissionStore.length && noPermissionStore.length === filterStores.length) {
          //     havePermissionStore = false;
          // }
        }

        // case: view and update report : load data vào form
        form.setFieldsValue({
          [ReportifyFormFields.column]: columns.map((item: any) => item.field),
          [ReportifyFormFields.properties]: propertiesValue,
          [ReportifyFormFields.timeRange]: [moment(from), moment(to)],
          [ReportifyFormFields.reportType]: cube,
          [ReportifyFormFields.timeGroupBy]: timeGroup,
          [ReportifyFormFields.where]: whereValue,
          [ReportifyFormFields.orderBy]: orderBy,
          [ReportifyFormFields.timeAtOption]: report.options,
          [ReportifyFormFields.chartType]: ChartTypeValue.VerticalColumn,
        });

        if (rows && rows.length) {
          setRowsInQuery((prev: string[]) => [
            ...prev.filter((item) => !rows.includes(item)),
            ...rows,
          ]);
        }

        const fieldWhereValue = form.getFieldValue(ReportifyFormFields.where);
        if (Object.keys(fieldWhereValue).length) {
          Object.keys(fieldWhereValue).forEach((key: string) => {
            const value = fieldWhereValue[key];
            if (value && Array.isArray(value)) {
              if (value.length === 1 && value[0] === "") {
                setActiveFilters(
                  (prev: any) =>
                    new Map(
                      prev.set(key, {
                        value: ["Tất cả"],
                        title: response ? getTranslatePropertyKey(response, key) : key,
                      }),
                    ),
                );
              } else {
                setActiveFilters(
                  (prev: any) =>
                    new Map(
                      prev.set(key, {
                        value: fieldWhereValue[key],
                        title: response ? getTranslatePropertyKey(response, key) : key,
                      }),
                    ),
                );
              }
            } else {
              setActiveFilters((prev: any) => new Map(prev.delete(key)));
            }
          });
        }
        // Temporary logic
        const { net_payments, ...others } = response.aggregates;
        response.aggregates = others;
        setMetadata(response);
        if (cube === AnalyticCube.SalesBySubStatus) {
          response.result = formatSubStatusReportDataUtils(response.result);
        }
        setDataQuery(response);
      } else {
        setDataQuery(response);
      }
    }
    // if (!havePermissionStore) {
    //     return;
    // }
    if (report?.chart_query) {
      const { OfflineSales, Sales, Costs, SalesBySubStatus } = AnalyticGroup;
      const fullChartParams = [OfflineSales, Sales, Costs, SalesBySubStatus].includes(
        report.group as AnalyticGroup,
      )
        ? { q: report.chart_query, options: report.options }
        : { q: report.chart_query };
      const chartResponse = await callApiNative(
        { notifyAction: "SHOW_ALL" },
        dispatch,
        executeAnalyticsQueryService,
        fullChartParams,
      );
      if (chartResponse && chartResponse.query.columns && chartResponse.query.columns.length) {
        setChartColumnSelected(chartResponse.query.columns.map((item: any) => item.field));
        form.setFieldsValue({
          [ReportifyFormFields.chartFilter]: chartResponse.query.columns.map(
            (item: any) => item.field,
          ),
        });
      }
    }
  }, [
    dispatch,
    id,
    allPermissions,
    setPermissionViewReport,
    username,
    formEditInfo,
    formCloneReport,
    setDataQuery,
    setIsMyReport,
    myStores,
    form,
    setMetadata,
    setPermissionStores,
    setRowsInQuery,
    setActiveFilters,
    setChartColumnSelected,
  ]);

  useEffect(() => {
    if (Number(id)) {
      fetchQueryData();
    }
  }, [dispatch, id, fetchQueryData]);

  // Load chart data
  useEffect(() => {
    const fetchChartData = async () => {
      if (!chartColumnSelected?.length) {
        setChartInfo({
          showChart: false,
          message: "Vui lòng chọn Tên cột hiển thị trong Tuỳ chọn hiển thị để vẽ biểu đồ.",
        });
        return;
      }
      if (dataQuery && !dataQuery.query.rows?.length) {
        setChartInfo({
          showChart: false,
          message: "Vui lòng chọn Thuộc tính hiển thị trong Tuỳ chọn hiển thị để vẽ biểu đồ.",
        });
        return;
      }
      setChartInfo({
        showChart: true,
        message: "",
      });
      if (dataQuery && chartColumnSelected?.length) {
        setLoadingChart(() => true);
        const query = getChartQuery(dataQuery.query, chartColumnSelected);
        const { OfflineSales, Sales, Costs, SalesBySubStatus } = AnalyticCube;
        const fullParams = [OfflineSales, Sales, Costs, SalesBySubStatus].includes(
          dataQuery.query.cube as AnalyticCube,
        )
          ? {
              q: query,
              options: form.getFieldValue(ReportifyFormFields.timeAtOption),
            }
          : { q: query };
        const response: any = await callApiNative(
          { isShowError: true },
          dispatch,
          executeAnalyticsQueryService,
          fullParams,
        );
        if (response) {
          const { columns, data } = response.result;
          if (!data.length) {
            setChartInfo({
              showChart: false,
              message:
                "Dữ liệu báo cáo trống nên không thể vẽ biểu đồ. Vui lòng chọn điều kiện lọc khác.",
            });
            return;
          }
          const timestampIdx = columns.findIndex(
            (item: any) => item.format === FIELD_FORMAT.Timestamp,
          );
          if (timestampIdx !== -1) {
            response.result.data.forEach(
              (item: any) =>
                (item[timestampIdx] = formatReportTime(
                  item[timestampIdx],
                  columns[timestampIdx].field,
                )),
            );
          }
          setChartDataQuery(response);
          form.setFieldsValue({ chartFilter: chartColumnSelected });
        }
        setLoadingChart(() => false);
      }
    };
    fetchChartData();
  }, [chartColumnSelected, dataQuery, dispatch, form, setChartDataQuery, setLoadingChart]);

  return permissionViewReport.isPermission === "1" ? (
    <ContentContainer
      title={reportInfo?.name || "Báo cáo tuỳ chỉnh"}
      breadcrumb={[
        {
          name: "Danh sách báo cáo tuỳ chỉnh",
          path: setReportsCustomizeUrl(dataQuery?.query.cube as AnalyticCube),
        },
        {
          name: reportInfo?.name || "Báo cáo tuỳ chỉnh",
        },
      ]}
    >
      <AnalyticsForm form={form} handleRQuery={handleRQuery} mode={mode} chartInfo={chartInfo} />
      <ReportBottomBarStyle>
        <BottomBarContainer
          classNameContainer="report-bottom-bar-container"
          back="Quay lại trang danh sách"
          rightComponent={
            <>
              <Collapse accordion bordered={false} className="report-actions-collapse">
                <Panel header="Thao tác với báo cáo" key="1">
                  <div className="function-buttons" style={{ display: "inline-flex", gap: "10px" }}>
                    {currentAnnotation && (
                      <Button type="primary" ghost onClick={() => setIsVisibleAnnotation(true)}>
                        <QuestionCircleOutlined />
                        <span className="margin-left-10">Giải thích thuật ngữ</span>
                      </Button>
                    )}
                    {isMyReport && (
                      <>
                        <Button
                          danger
                          onClick={() => {
                            setIsConfirmDeleteVisible(true);
                          }}
                        >
                          Xoá
                        </Button>
                        <Button
                          onClick={() => setIsModalEditNameVisible(true)}
                          icon={<AiOutlineEdit />}
                        >
                          &nbsp; Đổi tên
                        </Button>
                      </>
                    )}

                    {
                      <Button type="primary" onClick={() => setVisiableCloneReportModal(true)}>
                        Nhân bản báo cáo
                      </Button>
                    }

                    <Button
                      icon={<img src={exportIcon} style={{ marginRight: 8 }} alt="" />}
                      loading={isLoadingExport}
                      onClick={handleExportReport}
                    >
                      Xuất báo cáo
                    </Button>

                    {isMyReport && (
                      <Button type="primary" onClick={handleSaveReport}>
                        Lưu báo cáo
                      </Button>
                    )}
                  </div>
                </Panel>
              </Collapse>
              <div className="report-actions" style={{ display: "inline-flex", gap: "10px" }}>
                {currentAnnotation && (
                  <Button type="primary" ghost onClick={() => setIsVisibleAnnotation(true)}>
                    <QuestionCircleOutlined />
                    <span className="margin-left-10">Giải thích thuật ngữ</span>
                  </Button>
                )}
                {isMyReport && (
                  <>
                    <Button
                      danger
                      onClick={() => {
                        setIsConfirmDeleteVisible(true);
                      }}
                    >
                      Xoá
                    </Button>
                    <Button
                      onClick={() => setIsModalEditNameVisible(true)}
                      icon={<AiOutlineEdit />}
                    >
                      &nbsp; Đổi tên
                    </Button>
                  </>
                )}

                {
                  <Button type="primary" onClick={() => setVisiableCloneReportModal(true)}>
                    Nhân bản báo cáo
                  </Button>
                }

                <Button
                  icon={<img src={exportIcon} style={{ marginRight: 8 }} alt="" />}
                  loading={isLoadingExport}
                  onClick={handleExportReport}
                >
                  Xuất báo cáo
                </Button>

                {isMyReport && (
                  <Button type="primary" onClick={handleSaveReport}>
                    Lưu báo cáo
                  </Button>
                )}
              </div>
            </>
          }
        />
      </ReportBottomBarStyle>
      <ModalFormAnalyticsInfo
        form={formEditInfo}
        title="Đổi tên báo cáo"
        isVisiable={isModalEditNameVisible}
        handleOk={handleOk}
        handleCancel={handleCancel}
      />
      <ModalDeleteConfirm
        onOk={confirmDelete}
        onCancel={() => setIsConfirmDeleteVisible(false)}
        visible={isConfirmDeleteVisible}
        title="Xóa báo cáo"
        subTitle="Bạn có chắc chắn muốn xóa báo cáo này?"
      />
      <ModalFormAnalyticsInfo
        form={formCloneReport}
        title="Nhân bản báo cáo"
        isVisiable={visiableCloneReportModal}
        handleOk={handleCloneReport}
        handleCancel={handleCancelCloneReport}
      />
      <AnnotationTableModal
        isVisiable={isVisibleAnnotation}
        handleCancel={() => setIsVisibleAnnotation(false)}
        annotationData={currentAnnotation?.data || []}
        documentLink={currentAnnotation?.documentLink || ""}
      />
    </ContentContainer>
  ) : permissionViewReport.isPermission === "0" ? (
    <NoPermission />
  ) : (
    <></>
  );
}

const CreateAnalyticsWithProvider = () => {
  return (
    <AnalyticsProvider>
      <CreateAnalytics />
    </AnalyticsProvider>
  );
};
export default CreateAnalyticsWithProvider;
