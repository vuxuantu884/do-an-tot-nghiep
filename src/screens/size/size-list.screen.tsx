import { Button, Card, Form, Input, Select, Tooltip } from "antd";
import { MenuAction } from "component/table/ActionButton";
import search from "assets/img/search.svg";
import CustomTable from "component/table/CustomTable";
import {
  SizeCategory,
  SizeResponse,
  SizeQuery,
} from "model/product/size.model";
import { Link, useHistory } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PageResponse } from "model/base/base-metadata.response";
import { getQueryParams, useQuery } from "utils/useQuery";
import { convertCategory, generateQuery } from "utils/AppUtils";
import { useDispatch } from "react-redux";
import {
  sizeDeleteManyAction,
  sizeDeleteOneAction,
  sizeSearchAction,
} from "domain/actions/product/size.action";
import { getCategoryRequestAction } from "domain/actions/product/category.action";
import { CategoryResponse, CategoryView } from "model/product/category.model";
import UrlConfig from "config/UrlConfig";
import { showWarning } from "utils/ToastUtils";
import CustomFilter from "component/table/custom.filter";
import { StarOutlined } from "@ant-design/icons";

const actions: Array<MenuAction> = [
  {
    id: 1,
    name: "Chỉnh sửa",
  },
  {
    id: 2,
    name: "Xóa",
  },
  {
    id: 3,
    name: "Export",
  },
];

const initialQuery: SizeQuery = {
  category_id: "",
};

const { Option } = Select;
const SizeListScreen: React.FC = () => {
  const [categories, setCategories] = useState<Array<CategoryView>>([]);
  const query = useQuery();
  const history = useHistory();
  const [selected, setSelected] = useState<Array<SizeResponse>>([]);
  const dispatch = useDispatch();

  let [params, setPrams] = useState<SizeQuery>({
    ...initialQuery,
    ...getQueryParams(query),
  });
  const [data, setData] = useState<PageResponse<SizeResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const columns = [
    {
      title: "Kích cỡ",
      dataIndex: "code",
      render: (value: string, item: SizeResponse) => {
        return <Link to={`${UrlConfig.SIZES}/${item.id}`}>{value}</Link>;
      },
    },
    {
      title: "Danh mục",
      dataIndex: "categories",
      render: (value: Array<SizeCategory>) => {
        if(value.length === 1) {
          return <div>{value[0].category_name}</div>
        }
        return (
          <Tooltip placement="bottomLeft" title={value.map((item) => <div>{item.category_name}</div>)}>
            <div>{`${value.length} danh mục`}</div>
          </Tooltip>
        )
      }
    },
    {
      title: "Người tạo",
      dataIndex: "created_name",
    },
  ];
  const onPageChange = useCallback(
    (size, page) => {
      params.page = page - 1;
      params.limit = size;
      let queryParam = generateQuery(params);
      setPrams({ ...params });
      history.replace(`/colors?${queryParam}`);
    },
    [history, params]
  );
  const onSelectedChange = useCallback((selectedRow: Array<SizeResponse>) => {
    setSelected(selectedRow);
  }, []);
  const setCategory = useCallback((data: Array<CategoryResponse>) => {
    let newData = convertCategory(data);
    setCategories(newData);
  }, []);
  const onFinish = useCallback(
    (values: SizeQuery) => {
      let query = generateQuery(values);
      setPrams({ ...values });
      return history.replace(`${UrlConfig.SIZES}?${query}`);
    },
    [history]
  );
  const menuFilter = useMemo(() => {
    return actions.filter((item) => {
      if (selected.length === 0) {
        return item.id !== 1 && item.id !== 2;
      }
      if (selected.length > 1) {
        return item.id !== 1;
      }

      return true;
    });
  }, [selected]);
  const onDeleteSuccess = useCallback(() => {
    selected.splice(0, selected.length);
    setSelected([...selected]);
    dispatch(sizeSearchAction(params, setData));
  }, [dispatch, params, selected]);

  const onDelete = useCallback(() => {
    if (selected.length === 0) {
      showWarning("Vui lòng chọn phần từ cần xóa");
      return;
    }
    if (selected.length === 1) {
      let id = selected[0].id;
      dispatch(sizeDeleteOneAction(id, onDeleteSuccess));
      return;
    }
    let ids: Array<number> = [];
    selected.forEach((a) => ids.push(a.id));
    dispatch(sizeDeleteManyAction(ids, onDeleteSuccess));
  }, [dispatch, onDeleteSuccess, selected]);

  const onUpdate = useCallback(() => {
    if (selected.length === 0) {
      showWarning("Vui lòng chọn phần từ cần xóa");
      return;
    }
    if (selected.length === 1) {
      let id = selected[0].id;
      history.push(`${UrlConfig.SIZES}/${id}`);
      return;
    }
  }, [history, selected]);
  const onMenuClick = useCallback(
    (index: number) => {
      switch (index) {
        case 1:
          onUpdate();
          break;
        case 2:
          onDelete();
          break;
      }
    },
    [onDelete, onUpdate]
  );
  useEffect(() => {
    dispatch(getCategoryRequestAction({}, setCategory));
    dispatch(sizeSearchAction(params, setData));
  }, [dispatch, params, setCategory]);
  return (
    <div>
      <Card className="contain">
        <CustomFilter menu={menuFilter} onMenuClick={onMenuClick}>
          <Form layout="inline" initialValues={params} onFinish={onFinish}>
            <Form.Item name="code">
              <Input
                prefix={<img src={search} alt="" />}
                style={{ width: 200 }}
                placeholder="Tên/Mã kích cỡ"
              />
            </Form.Item>
            <Form.Item name="category_id">
              <Select style={{ width: 200 }}>
                <Option value="">Chọn danh mục</Option>
                {categories.map((item) => (
                  <Option key={item.id} value={item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Lọc
              </Button>
            </Form.Item>
            <Form.Item>
              <Tooltip overlay="Lưu bộ lọc" placement="top">
                <Button icon={<StarOutlined />} />
              </Tooltip>
            </Form.Item>
          </Form>
        </CustomFilter>
        <CustomTable
          pagination={{
            pageSize: data.metadata.limit,
            total: data.metadata.total,
            current: data.metadata.page,
            showSizeChanger: true,
            onChange: onPageChange,
            onShowSizeChange: onPageChange,
          }}
          dataSource={data.items}
          columns={columns}
          onSelectedChange={onSelectedChange}
          rowKey={(item: SizeResponse) => item.id}
        />
      </Card>
    </div>
  );
};

export default SizeListScreen;
