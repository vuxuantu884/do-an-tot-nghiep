import CustomTable, {ICustomTableColumType} from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import UrlConfig, {InventoryTabUrl} from "config/url.config";
import {inventoryGetDetailAction} from "domain/actions/inventory/inventory.action";
import useChangeHeaderToAction from "hook/filter/useChangeHeaderToAction";
import {PageResponse} from "model/base/base-metadata.response";
import {InventoryQuery, InventoryResponse} from "model/inventory";
import {useCallback, useEffect, useMemo, useState} from "react";
import {useDispatch} from "react-redux";
import {Link, useHistory} from "react-router-dom";
import {generateQuery} from "utils/AppUtils";
import {OFFSET_HEADER_TABLE} from "utils/Constants";
import {ConvertUtcToLocalDate} from "utils/DateUtils";
import {getQueryParams, useQuery} from "utils/useQuery";
import InventoryFilter from "../filter/inventory.filter";
import {TabProps} from "./tab.props";

const DetailTab: React.FC<TabProps> = (props: TabProps) => {
  const history = useHistory();
  const query = useQuery();
  const dispatch = useDispatch();

  const [showSettingColumn, setShowSettingColumn] = useState(false);
  let initQuery: InventoryQuery = {};
  const [loading, setLoading] = useState<boolean>(true);
  let dataQuery: InventoryQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  let [params, setPrams] = useState<InventoryQuery>(dataQuery);
  const [data, setData] = useState<PageResponse<InventoryResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const onResult = useCallback((result: PageResponse<InventoryResponse> | false) => {
    if (result) {
      setLoading(false);
      setData(result);
    }
  }, []);
  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setPrams({...params});

      history.replace(`${InventoryTabUrl.DETAIL}?${queryParam}`);
    },
    [history, params]
  );
  const onFilter = useCallback(
    (values: InventoryQuery) => {
      const newQuery: InventoryQuery = {...values, condition: values.condition?.trim()};
      const newPrams = {...params, ...newQuery, page: 1};
      setPrams(newPrams);
      const queryParam = generateQuery(newPrams);
      history.replace(`${InventoryTabUrl.DETAIL}?${queryParam}`);
    },
    [history, params]
  );

  const [columns, setColumn] = useState<Array<ICustomTableColumType<InventoryResponse>>>(
    []
  );
  const [selected, setSelected] = useState<Array<InventoryResponse>>([]);
  const onSelect = useCallback((selectedRow: Array<InventoryResponse>) => {
    setSelected(
      selectedRow.filter(function (el) {
        return el !== undefined;
      })
    );
  }, []);
  const ActionComponent = useChangeHeaderToAction(
    "Sản phẩm",
    selected.length > 0,
    () => {},
    []
  );

  const defaultColumns: Array<ICustomTableColumType<InventoryResponse>> = [
    {
      width: 300,
      title: <ActionComponent />,
      visible: true,
      dataIndex: "sku",
      fixed: "left",
      render: (value, record, index) => (
        <div>
          <Link
            to={`${UrlConfig.PRODUCT}/${record.product_id}/variants/${record.variant_id}`}
          >
            {value}
          </Link>
          <div>{record.name}</div>
        </div>
      ),
    },
    {
      align: "right",
      title: "Tổng tồn",
      visible: true,
      dataIndex: "total_stock",
    },
    {
      align: "right",
      title: "Tồn trong kho",
      visible: true,
      dataIndex: "on_hand",
    },
    {
      align: "right",
      title: "Đang giao dịch",
      visible: true,
      dataIndex: "committed",
    },
    {
      align: "right",
      title: "Có thể bán",
      visible: true,
      dataIndex: "available",
    },
    {
      align: "right",
      title: "Tạm giữ",
      visible: true,
      dataIndex: "on_hold",
    },
    {
      align: "right",
      title: "Hàng lỗi",
      visible: true,
      dataIndex: "defect",
    },
    {
      align: "right",
      title: "Chờ nhập",
      visible: true,
      dataIndex: "in_coming",
    },
    {
      align: "right",
      title: "Đang chuyển đến",
      visible: true,
      dataIndex: "transferring",
    },
    {
      align: "right",
      title: "Đang chuyển đi",
      visible: true,
      dataIndex: "on_way",
    },
    {
      align: "right",
      title: "Đang giao",
      visible: true,
      dataIndex: "shipping",
    },
    {
      align: "center",
      title: "Kho hàng",
      visible: true,
      dataIndex: "store",
    }, 
    {
      align: "center",
      title: "Ngày cập nhật",
      visible: true,
      dataIndex: "transaction_date",
      render: (value) => ConvertUtcToLocalDate(value),
    },
  ];

  const columnFinal = useMemo(
    () => columns.filter((item) => item.visible === true),
    [columns]
  );
  useEffect(() => {
    setColumn(defaultColumns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  useEffect(() => {
    setLoading(true);
    dispatch(inventoryGetDetailAction(params, onResult));
  }, [dispatch, onResult, params]);
  return (
    <div>
      <InventoryFilter
        openColumn={() => setShowSettingColumn(true)}
        id="detail"
        isMulti={false}
        onFilter={onFilter}
        params={params}
        actions={[]}
        onClearFilter={() => {}}
        listStore={props.stores}
      />
      <CustomTable
        isLoading={loading}
        isRowSelection
        dataSource={data.items}
        columns={columnFinal}
        scroll={{x: 2500}}
        sticky={{offsetScroll: 5, offsetHeader: OFFSET_HEADER_TABLE}}
        pagination={{
          pageSize: data.metadata.limit,
          total: data.metadata.total,
          current: data.metadata.page,
          showSizeChanger: true,
          onChange: onPageChange,
          onShowSizeChange: onPageChange,
        }}
        rowKey={(data) => data.id}
        onSelectedChange={onSelect}
      />
      <ModalSettingColumn
        visible={showSettingColumn}
        onCancel={() => setShowSettingColumn(false)}
        onOk={(data) => {
          setShowSettingColumn(false);
          setColumn(data);
        }}
        data={columns}
      />
    </div>
  );
};

export default DetailTab;
