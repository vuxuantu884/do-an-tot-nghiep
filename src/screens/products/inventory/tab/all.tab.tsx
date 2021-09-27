import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { inventoryGetListAction } from "domain/actions/inventory/inventory.action";
import { getQueryParams, useQuery } from "utils/useQuery";
import {
  AllInventoryResponse,
  InventoryQuery,
  InventoryResponse,
} from "model/inventory";
import { PageResponse } from "model/base/base-metadata.response";
import { Link, useHistory } from "react-router-dom";
import { formatCurrency, generateQuery } from "utils/AppUtils";
import UrlConfig from "config/url.config";
import { TabProps } from "./tab.props";
import {
  HiChevronDoubleRight,
  HiOutlineChevronDoubleDown,
} from "react-icons/hi";
import AllInventoryFilter from "../filter/all.filter";
import ModalSettingColumn from "component/table/ModalSettingColumn";

const AllTab: React.FC<TabProps> = (props: TabProps) => {
  const history = useHistory();
  const query = useQuery();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState<boolean>(false);
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  let initQuery: InventoryQuery = {};

  let dataQuery: InventoryQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  let [params, setPrams] = useState<InventoryQuery>(dataQuery);
  const [data, setData] = useState<PageResponse<AllInventoryResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const onResult = useCallback(
    (result: PageResponse<AllInventoryResponse> | false) => {
      setLoading(false);
      if (result) {
        console.log(result);
        setData(result);
      }
    },
    []
  );
  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setPrams({ ...params });
      history.replace(
        `${UrlConfig.INVENTORY}${history.location.hash}?${queryParam}`
      );
    },
    [history, params]
  );

  const onFilter = useCallback(
    (values) => {
      let newPrams = { ...params, ...values, page: 1 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.replace(`${UrlConfig.INVENTORY}#1?${queryParam}`);
    },
    [history, params]
  );

  let [columns, setColumns] = useState<Array<ICustomTableColumType<InventoryResponse>>>([
    {
      width: 100,
      title: "Ảnh",
      visible: true,
      align: "center",
      dataIndex: "",
    },
    {
      title: "Barcode",
      visible: true,
      dataIndex: "barcode",
    },
    {
      title: "Mã sản phẩm",
      visible: true,
      dataIndex: "sku",
      align: "center",
      render: (value, record, index) => (
        <div>
          <Link to={`${UrlConfig.PRODUCT}/${record.product_id}/variants/${record.id}`}>{value}</Link>
        </div>
      ),
    },
    {
      width: 300,
      title: "Tên sản phẩm",
      visible: true,
      dataIndex: "name",
      align: "center",
    },
    {
      title: "Giá nhập",
      visible: true,
      align: "right",
      dataIndex: "import_price",
      render: (value, record, index) => formatCurrency(value),
    },
    {
      title: "Giá bán",
      visible: true,
      dataIndex: "retail_price",
      align: "right",
      render: (value, record, index) => formatCurrency(value),
    },
    {
      title: "Tồn theo trạng thái",
      visible: true,
      dataIndex: "total_on_hand",
      align: "right",
    },
  ]);

  const openColumn = useCallback(() => {
    setShowSettingColumn(true);
  }, []);

  const columnsFinal = useMemo(() => columns.filter((item) => item.visible), [columns])

  useEffect(() => {
    setLoading(true);
    dispatch(inventoryGetListAction(params, onResult));
  }, [dispatch, onResult, params]);
  return (
    <div className="padding-20">
      <AllInventoryFilter
        openColumn={openColumn}
        onFilter={onFilter}
        params={params}
        actions={[]}
        onClearFilter={() => {}}
        listStore={props.stores}
      />
      <CustomTable
        isRowSelection
        isLoading={loading}
        dataSource={data.items}
        scroll={{ x: 900 }}
        sticky={{ offsetScroll: 5 }}
        pagination={{
          pageSize: data.metadata.limit,
          total: data.metadata.total,
          current: data.metadata.page,
          showSizeChanger: true,
          onChange: onPageChange,
          onShowSizeChange: onPageChange,
        }}
        expandable={{
          expandIcon: (props) => {
            let icon = <HiChevronDoubleRight size={12} />;
            if (props.expanded) {
              icon = <HiOutlineChevronDoubleDown size={12} color="#2A2A86" />;
            }
            return (
              <div
                style={{ cursor: "pointer" }}
                onClick={(event) => props.onExpand(props.record, event)}
              >
                {icon}
              </div>
            );
          },
          expandedRowRender: (record: AllInventoryResponse) => (
            <CustomTable
              dataSource={record.inventories}
              rowKey={(item) => item.id}
              scroll={{ y: 250 }}
              pagination={false}
              columns={[
                {
                  title: "Kho hàng",
                  dataIndex: "store",
                },
                {
                  align: "right",
                  title: "Tồn trong kho",
                  dataIndex: "on_hand",
                },
                {
                  align: "right",
                  title: "Có thể bán",
                  dataIndex: "available",
                },
                {
                  align: "right",
                  title: "Hàng tạm giữ",
                  dataIndex: "on_hold",
                },
                {
                  align: "right",
                  title: "Hàng lỗi",
                  dataIndex: "defect",
                },
                {
                  align: "right",
                  title: "Chờ nhập",
                  dataIndex: "in_coming",
                },
                {
                  align: "right",
                  title: "Hàng đang chuyển đến",
                  dataIndex: "transferring",
                },
                {
                  align: "right",
                  title: "Hàng đang chuyển đi",
                  dataIndex: "on_way",
                },
              ]}
            />
          ),
        }}
        columns={columnsFinal}
        rowKey={(data) => data.id}
      />
      <ModalSettingColumn
        visible={showSettingColumn}
        onCancel={() => setShowSettingColumn(false)}
        onOk={(data) => {
          setShowSettingColumn(false);
          setColumns(data);
        }}
        data={columns}
      />
    </div>
  );
};

export default AllTab;
