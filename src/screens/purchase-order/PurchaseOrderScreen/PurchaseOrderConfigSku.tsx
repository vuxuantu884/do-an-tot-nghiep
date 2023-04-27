import { EditOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Row, Space, Typography } from "antd";
import excelIcon from "assets/icon/icon-excel.svg";
import importIcon from "assets/icon/import.svg";
import search from "assets/img/search.svg";
import ContentContainer from "component/container/content.container";
import NumberInput from "component/custom/number-input.custom";
import CustomPagination from "component/table/CustomPagination";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import {
  EnumStoreHieu,
  EnumStoreMienBac,
  EnumStoreMienTrung,
  EnumStoreTung,
} from "config/enum.config";
import UrlConfig from "config/url.config";
import { HUNDRED_PERCENT } from "html2canvas/dist/types/css/types/length-percentage";
import { cloneDeep } from "lodash";
import { PageResponse } from "model/base/base-metadata.response";
import {
  PurchaseOrderPercentSaleStores,
  PurchaseOrderPercentSales,
  PurchaseOrderQuery,
} from "model/purchase-order/purchase-order.model";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  getListPercentSales,
  updatePercentSales,
} from "service/purchase-order/purchase-order.service";
import styled from "styled-components";
import { callApiNative } from "utils/ApiUtils";
import { formatCurrency, generateQuery, replaceFormatString } from "utils/AppUtils";
import { OFFSET_HEADER_TABLE } from "utils/Constants";
import { showError, showSuccess } from "utils/ToastUtils";
import { getQueryParams, useQuery } from "utils/useQuery";

const { Item } = Form;

const PurchaseOrderConfigSku = () => {
  const [loadingTable, setLoadingTable] = useState<boolean>(false);
  const [data, setData] = useState<PageResponse<PurchaseOrderPercentSales>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const [formBaseFilter] = Form.useForm();
  const history = useHistory();
  const query = useQuery();
  const initQuery: PurchaseOrderQuery = {};
  const dataQuery: PurchaseOrderQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  const dispatch = useDispatch();
  const [params, setPrams] = useState<PurchaseOrderQuery>(dataQuery);

  const onBaseFinish = (value: any) => {
    const queryParam = generateQuery({ ...params, ...value });
    setPrams({ ...params, ...value });
    history.replace(`${UrlConfig.PURCHASE_ORDERS_CONFIG_SKU}?${queryParam}`);
  };

  const handleSave = async (value: PurchaseOrderPercentSales) => {
    const index = data.items.findIndex((item) => item.id === value.id);

    const totalPercent = value.percent_sale_stores.reduce(
      (total, element) => total + element.percent,
      0,
    );
    if (totalPercent != 100) {
      showError(` Tổng tỉ lệ chia hàng ${value.code} khác 100%`);
      return;
    }
    try {
      setLoadingTable(true);
      const res = await callApiNative(
        { isShowLoading: false },
        dispatch,
        updatePercentSales,
        value.id,
        value,
      );
      if (res) {
        showSuccess("Cập nhập thông tin thành công");
        data.items[index].isEdit = false;
        setData(cloneDeep(data));
        setLoadingTable(false);
      }
    } catch (e: any) {
      showError(e);
      data.items[index].isEdit = false;
      setData(cloneDeep(data));
      setLoadingTable(false);
    } finally {
    }
  };

  const handleEdit = (value: PurchaseOrderPercentSales) => {
    const index = data.items.findIndex((item) => item.id === value.id);
    if (index >= 0) {
      data.items[index].isEdit = true;
      setData(cloneDeep(data));
    }
  };

  const handlePercentStore = (record: PurchaseOrderPercentSales, store: number, value: number) => {
    const index = data.items.findIndex((item) => item.id === record.id);
    if (index >= 0) {
      const indexStore = data.items[index].percent_sale_stores.findIndex(
        (itemStore) => itemStore.store_id === store,
      );
      data.items[index].percent_sale_stores[indexStore].percent = value;
      setData(cloneDeep(data));
    }
  };

  const columns: Array<ICustomTableColumType<PurchaseOrderPercentSales>> = useMemo(() => {
    return [
      {
        title: "Mã 3",
        dataIndex: "code",
        visible: true,
        render: (value, record) => {
          return value;
        },
      },
      {
        title: "Tên mã 3",
        dataIndex: "name",
        visible: true,
        render: (value, record) => {
          return value;
        },
      },
      {
        title: "YODY Kho tổng Miền Bắc (%)",
        dataIndex: "percent_sale_stores",
        width: "20%",
        visible: true,
        render: (value: PurchaseOrderPercentSaleStores[], record) => {
          const stores = value || [];
          const stoteMienBac = stores.find((store) =>
            [...Object.values(EnumStoreMienBac), ...Object.values(EnumStoreTung)].includes(
              store.store_id,
            ),
          );
          return (
            <div>
              {record.isEdit ? (
                <NumberInput
                  className="numberInput"
                  format={(a: string) => formatCurrency(a)}
                  replace={(a: string) => replaceFormatString(a)}
                  value={stoteMienBac?.percent || 0}
                  onChange={(value) => {
                    stoteMienBac && handlePercentStore(record, stoteMienBac?.store_id, value || 0);
                  }}
                  min={0}
                  max={100}
                />
              ) : (
                stoteMienBac?.percent || 0
              )}
            </div>
          );
        },
      },
      {
        title: "YODY Kho tổng Miền Trung (%)",
        dataIndex: "percent_sale_stores",
        visible: true,
        width: "20%",
        render: (value: PurchaseOrderPercentSaleStores[], record) => {
          const stores = value || [];
          const stoteMienTrung = stores.find((store) =>
            [...Object.values(EnumStoreMienTrung), ...Object.values(EnumStoreHieu)].includes(
              store.store_id,
            ),
          );
          return (
            <div>
              {record.isEdit ? (
                <NumberInput
                  className="numberInput"
                  format={(a: string) => formatCurrency(a)}
                  replace={(a: string) => replaceFormatString(a)}
                  onChange={(value) => {
                    stoteMienTrung &&
                      handlePercentStore(record, stoteMienTrung?.store_id, value || 0);
                  }}
                  value={stoteMienTrung?.percent || 0}
                  min={0}
                  max={100}
                />
              ) : (
                stoteMienTrung?.percent || 0
              )}
            </div>
          );
        },
      },
      {
        title: "",
        dataIndex: "isEdit",
        align: "center",
        width: "10%",
        visible: true,
        render: (value, record) => {
          return (
            <div style={{ cursor: "pointer" }}>
              {!value ? (
                <EditOutlined
                  onClick={() => {
                    handleEdit(record);
                  }}
                />
              ) : (
                <Button
                  type="primary"
                  onClick={() => {
                    handleSave(record);
                  }}
                >
                  Lưu
                </Button>
              )}
            </div>
          );
        },
      },
    ];
  }, [handleEdit, handleSave]);

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      const queryParam = generateQuery(params);
      setPrams({ ...params });
      history.replace(`${UrlConfig.PURCHASE_ORDERS_CONFIG_SKU}?${queryParam}`);
    },
    [history, params],
  );

  const getDataListPercentSales = async (params: PurchaseOrderQuery) => {
    setLoadingTable(true);
    try {
      const res = await callApiNative(
        { isShowLoading: false },
        dispatch,
        getListPercentSales,
        params,
      );
      setData({
        ...data,
        items: [
          ...res.items.map((item: PurchaseOrderPercentSales) => {
            return { ...item, isEdit: false };
          }),
        ],
        metadata: res.metadata,
      });
      setLoadingTable(false);
    } catch {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    getDataListPercentSales(params);
  }, [params]);

  return (
    <ContentContainer
      title={`Quản lý tỉ lệ chia hàng`}
      breadcrumb={[
        {
          name: "Nhà cung cấp",
          path: UrlConfig.PURCHASE_ORDERS,
        },
        {
          name: "Tỉ lệ chia hàng",
          path: UrlConfig.PURCHASE_ORDERS_CONFIG_SKU,
        },
      ]}
      // extra={
      //   <Row>
      //     <Space>
      //       <Button
      //         className="light"
      //         size="large"
      //         icon={<img src={importIcon} style={{ marginRight: 8 }} alt="" />}
      //         onClick={() => {
      //           // setIsShowExportDetailProcurement(true);
      //         }}
      //       >
      //         Nhập file
      //       </Button>

      //       <StyledCard>
      //         <Typography.Text>
      //           <img src={excelIcon} alt="" /> <a href="">Link file excel mẫu (.xlsx)</a>
      //         </Typography.Text>
      //       </StyledCard>
      //     </Space>
      //   </Row>
      // }
    >
      <Card className="card-tab">
        <StyledForm
          form={formBaseFilter}
          onFinish={onBaseFinish}
          initialValues={params}
          layout="inline"
        >
          <Row>
            <Col span={12}>
              <Item name="info" className="search">
                <Input
                  prefix={<img src={search} alt="" />}
                  placeholder="Tìm kiếm theo mã/tên sản phẩm mã 3"
                />
              </Item>
            </Col>
            <Col span={12}>
              <Button type="primary" htmlType="submit">
                Lọc
              </Button>
            </Col>
          </Row>
        </StyledForm>
        <CustomPagination
          pagination={{
            pageSize: data.metadata.limit,
            total: data.metadata.total,
            current: data.metadata.page,
            showSizeChanger: true,
            onChange: onPageChange,
            onShowSizeChange: onPageChange,
          }}
        />
        <CustomTable
          className="small-padding"
          bordered
          showColumnSetting={true}
          scroll={{ x: "max-content" }}
          loading={loadingTable}
          // sticky={{ offsetScroll: 10, offsetHeader: 55 }}
          sticky={{ offsetScroll: 5, offsetHeader: OFFSET_HEADER_TABLE }}
          pagination={false}
          dataSource={data.items}
          columns={columns}
          rowKey={(item: PurchaseOrderPercentSales) => item.id}
        />
      </Card>
    </ContentContainer>
  );
};

const StyledCard = styled(Card)`
  margin-bottom: 0 !important;
  .ant-card-body {
    padding: 8px;
    width: 205px !important;
  }
`;

const StyledForm = styled(Form)`
  display: block;
  margin-top: 12px;
  padding: 12px 0;
`;

export default PurchaseOrderConfigSku;
