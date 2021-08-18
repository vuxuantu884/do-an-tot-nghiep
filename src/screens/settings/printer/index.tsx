import { PlusOutlined } from "@ant-design/icons";
import { Button, Card } from "antd";
import ContentContainer from "component/container/content.container";
import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import UrlConfig from "config/UrlConfig";
import { FormPrinterModel } from "model/editor/editor.model";
import { VariantResponse } from "model/product/product.model";
import { useCallback, useEffect, useState } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import IconEdit from "./images/iconEdit.svg";
import IconPrintHover from "./images/iconPrintHover.svg";
import { StyledComponent } from "./styles";

const SettingPrinter: React.FC = () => {
  const [tableLoading, setTableLoading] = useState(false);
  const [listPrinter, setListPrinter] = useState<FormPrinterModel[]>([]);
  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  };
  const query = useQuery();
  const [total, setTotal] = useState(0);

  const history = useHistory();

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

  const handlePrint = (e: any) => {
    e.preventDefault();
    console.log("handlePrint");
  };

  const columns: Array<ICustomTableColumType<VariantResponse>> = [
    {
      title: "STT",
      visible: true,
      render: (value, row, index) => {
        return <span>{(params.page - 1) * params.limit + index + 1}</span>;
      },
    },
    {
      title: "Tên mẫu in",
      dataIndex: "tenMauIn",
      visible: true,
      className: "columnTitle",
      width: "25%",
      render: (value, row, index) => {
        if (value) {
          return (
            <div
              className="link"
              onClick={() => {
                goToPageDetail(row.id);
              }}
            >
              <span
                title={value}
                style={{ wordWrap: "break-word", wordBreak: "break-word" }}
                className="title text"
              >
                {value}
              </span>
            </div>
          );
        }
      },
    },
    {
      title: "Chi nhánh áp dụng",
      dataIndex: "chiNhanhApDung",
      visible: true,
      width: "25%",
      render: (value, row, index) => {
        return (
          <div
            className="link"
            onClick={() => {
              goToPageDetail(row.id);
            }}
          >
            <span title={value}>{value}</span>
          </div>
        );
      },
    },
    {
      title: "Khổ in",
      dataIndex: "khoIn",
      visible: true,
      width: "25%",
      render: (value, row, index) => {
        return (
          <div
            className="link"
            onClick={() => {
              goToPageDetail(row.id);
            }}
          >
            <span className="text" title={value}>
              {value}
            </span>
          </div>
        );
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
            <Button
              className="columnAction__singleButton columnAction__singleButton--print"
              onClick={handlePrint}
            >
              <div className="icon">
                <img src={IconPrintHover} alt="" className="icon--hover" />
              </div>
              In thử
            </Button>
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
    const FAKE_LIST_PRINTERS = [
      {
        id: 1,
        tenMauIn: "Tên mẫu in 1",
        chiNhanhApDung: "Chi nhánh áp dụng 1",
        apDung: false,
        khoIn: "Khổ in 1",
      },
      {
        id: 2,
        tenMauIn: "Tên mẫu in 2",
        chiNhanhApDung: "Chi nhánh áp dụng 2",
        apDung: false,
        khoIn: "Khổ in 2",
      },
      {
        id: 3,
        tenMauIn: "Tên mẫu in 3",
        chiNhanhApDung: "Chi nhánh áp dụng 3",
        apDung: false,
        khoIn: "Khổ in 3",
      },
      {
        id: 4,
        tenMauIn: "Tên mẫu in 4",
        chiNhanhApDung: "Chi nhánh áp dụng 4",
        apDung: false,
        khoIn: "Khổ in 4",
      },
      {
        id: 5,
        tenMauIn: "Tên mẫu in 5",
        chiNhanhApDung: "Chi nhánh áp dụng 5",
        apDung: false,
        khoIn: "Khổ in 5",
      },
      {
        id: 6,
        tenMauIn: "Tên mẫu in 6",
        chiNhanhApDung: "Chi nhánh áp dụng 6",
        apDung: false,
        khoIn: "Khổ in 6",
      },
    ];
    setTableLoading(false);
    setTotal(30);
    setListPrinter(FAKE_LIST_PRINTERS);
  }, []);

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
          />
        </Card>
      </ContentContainer>
    </StyledComponent>
  );
};

export default SettingPrinter;
