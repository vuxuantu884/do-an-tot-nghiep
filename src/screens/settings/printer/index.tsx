import { PlusOutlined } from "@ant-design/icons";
import { Button, Card } from "antd";
import ContentContainer from "component/container/content.container";
import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import UrlConfig from "config/UrlConfig";
import { actionFetchListPrinter } from "domain/actions/printer/printer.action";
import { RootReducerType } from "model/reducers/RootReducerType";
import {
  BasePrinterModel,
  PrinterResponseModel,
} from "model/response/printer.response";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory, useLocation } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { generateQuery } from "utils/AppUtils";
import IconEdit from "./images/iconEdit.svg";
import IconPrintHover from "./images/iconPrintHover.svg";
import { StyledComponent } from "./styles";

const SettingPrinter: React.FC = () => {
  const FAKE_PRINT_CONTENT = "<p>This is fake print content print screen</p>";
  const printElementRef = useRef(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [listPrinter, setListPrinter] = useState<BasePrinterModel[]>([]);
  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  };
  const query = useQuery();
  const [total, setTotal] = useState(0);

  const history = useHistory();
  const dispatch = useDispatch();

  const bootstrapReducer = useSelector(
    (state: RootReducerType) => state.bootstrapReducer
  );

  let [queryParams, setQueryParams] = useState({
    page: +(query.get("page") || 1),
    limit: +(query.get("limit") || 30),
    sort_type: "desc",
    sort_column: "id",
  });
  const onPageChange = useCallback(
    (page, size) => {
      queryParams.page = page;
      queryParams.limit = size;
      let queryParam = generateQuery(queryParams);
      setQueryParams({ ...queryParams });
      history.replace(`${UrlConfig.PRINTER}?${queryParam}`);
      window.scrollTo(0, 0);
    },
    [history, queryParams]
  );

  const goToPageDetail = (id: string | number) => {
    history.push(`${UrlConfig.PRINTER}/${id}`);
  };

  const handlePrint = useReactToPrint({
    content: () => printElementRef.current,
  });

  const columns: ICustomTableColumType<any>[] = [
    {
      title: "STT",
      visible: true,
      width: "5%",
      render: (value, row, index) => {
        return (
          <span>{(queryParams.page - 1) * queryParams.limit + index + 1}</span>
        );
      },
    },
    {
      title: "Tên mẫu in",
      dataIndex: "name",
      visible: true,
      width: "20%",
    },
    {
      title: "Chi nhánh áp dụng",
      dataIndex: "store",
      visible: true,
      width: "20%",
    },
    {
      title: "Khổ in",
      dataIndex: "print_size",
      visible: true,
      width: "30%",
      className: "printSize",
      render: (value, row, index) => {
        let result = value;
        if (bootstrapReducer) {
          const selectedPrintSize = bootstrapReducer.data?.print_size.find(
            (singlePrinterSize) => {
              return singlePrinterSize.value === value;
            }
          );
          if (selectedPrintSize) {
            result = selectedPrintSize.name;
          }
        }
        return result;
      },
    },
    {
      title: "Thao tác ",
      dataIndex: "id",
      visible: true,
      width: "25%",
      render: (value, row, index) => {
        return (
          <div className="columnAction">
            <Link
              to={`${history.location.pathname}/${value}`}
              className="columnAction__singleButton columnAction__singleButton--edit"
            >
              <Button>
                <div className="icon">
                  <img src={IconEdit} alt="" className="icon--normal" />
                </div>
                Sửa
              </Button>
            </Link>
            {handlePrint && (
              <Button
                className="columnAction__singleButton columnAction__singleButton--print"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrint();
                }}
              >
                <div className="icon">
                  <img src={IconPrintHover} alt="" className="icon--hover" />
                </div>
                In thử
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const columnFinal = () => columns.filter((item) => item.visible === true);

  const createPrinterHtml = () => {
    return (
      <Link to={`${UrlConfig.PRINTER}/create`}>
        <Button
          type="primary"
          className="ant-btn-primary"
          size="large"
          onClick={() => {}}
          icon={<PlusOutlined />}
        >
          Thêm mẫu in
        </Button>
      </Link>
    );
  };

  useEffect(() => {
    dispatch(
      actionFetchListPrinter(queryParams, (data: PrinterResponseModel) => {
        setListPrinter(data.items);
        setTotal(data.metadata.total);
        setTableLoading(false);
      })
    );
  }, [dispatch, queryParams]);

  return (
    <StyledComponent>
      <ContentContainer
        title="Danh sách mẫu in"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: UrlConfig.HOME,
          },
          {
            name: "Cài đặt",
            path: UrlConfig.ACCOUNTS,
          },
          {
            name: "Danh sách mẫu in",
          },
        ]}
        extra={createPrinterHtml()}
      >
        <Card style={{ padding: "35px 15px" }}>
          <CustomTable
            isLoading={tableLoading}
            showColumnSetting={false}
            scroll={{ x: 1080 }}
            pagination={{
              pageSize: queryParams.limit,
              total: total,
              current: queryParams.page,
              showSizeChanger: true,
              onChange: onPageChange,
              onShowSizeChange: onPageChange,
            }}
            dataSource={listPrinter}
            columns={columnFinal()}
            rowKey={(item: BasePrinterModel) => item.id}
            onRow={(record: BasePrinterModel) => {
              return {
                onClick: (event) => {
                  goToPageDetail(record.id);
                }, // click row
              };
            }}
          />
        </Card>
        <div style={{ display: "none" }}>
          <div className="printContent" ref={printElementRef}>
            <div
              dangerouslySetInnerHTML={{
                __html: FAKE_PRINT_CONTENT,
              }}
            ></div>
          </div>
        </div>
      </ContentContainer>
    </StyledComponent>
  );
};

export default SettingPrinter;
