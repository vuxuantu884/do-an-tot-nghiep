import { PlusOutlined } from "@ant-design/icons";
import { Button, Card } from "antd";
import ContentContainer from "component/container/content.container";
import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import UrlConfig from "config/UrlConfig";
import { actionFetchListPrinter } from "domain/actions/printer/printer.action";
import { FormPrinterModel } from "model/editor/editor.model";
import { VariantResponse } from "model/product/product.model";
import {
  PrinterModel,
  PrinterResponseModel,
} from "model/response/printer.response";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
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
  const [listPrinter, setListPrinter] = useState<PrinterModel[]>([]);
  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  };
  const query = useQuery();
  const [total, setTotal] = useState(0);

  const history = useHistory();
  const dispatch = useDispatch();

  let [params, setParams] = useState({
    page: +(query.get("page") || 1),
    limit: +(query.get("limit") || 30),
    sort_type: "desc",
    sort_column: "id",
  });
  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setParams({ ...params });
      history.replace(`${UrlConfig.ORDER_PROCESSING_STATUS}?${queryParam}`);
      window.scrollTo(0, 0);
    },
    [history, params]
  );

  const goToPageDetail = (id: string | number) => {
    history.push(`${UrlConfig.PRINTER}/${id}`);
  };

  const handlePrint = useReactToPrint({
    content: () => printElementRef.current,
  });

  const columns: Array<ICustomTableColumType<VariantResponse>> = [
    {
      title: "STT",
      visible: true,
      width: "5%",
      render: (value, row, index) => {
        return <span>{(params.page - 1) * params.limit + index + 1}</span>;
      },
    },
    {
      title: "Tên mẫu in",
      dataIndex: "tenMauIn",
      visible: true,
      className: "columnTitle",
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
    console.log("params", params);
    dispatch(
      actionFetchListPrinter(params, (data: PrinterResponseModel) => {
        setListPrinter(data.items);
        setTotal(data.metadata.total);
        setTableLoading(false);
      })
    );
  }, [dispatch, params]);

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
              pageSize: params.limit,
              total: total,
              current: params.page,
              showSizeChanger: true,
              onChange: onPageChange,
              onShowSizeChange: onPageChange,
            }}
            dataSource={listPrinter}
            columns={columnFinal()}
            rowKey={(item: VariantResponse) => item.id}
            onRow={(record: FormPrinterModel) => {
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
