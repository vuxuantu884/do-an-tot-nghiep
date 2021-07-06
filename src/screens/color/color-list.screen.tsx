import {Button, Card, Form, Input, Image, Select} from 'antd';
import React, {useCallback, useEffect, useState} from 'react';
import {Link, useHistory} from 'react-router-dom';
import search from 'assets/img/search.svg';
import {getQueryParams, useQuery} from 'utils/useQuery';
import {generateQuery} from 'utils/AppUtils';
import {useDispatch} from 'react-redux';
import {PageResponse} from 'model/base/base-metadata.response';
import {MenuAction} from 'component/table/ActionButton';
import {showWarning} from 'utils/ToastUtils';
import CustomTable from 'component/table/CustomTable';
import {ColorResponse, ColorSearchQuery} from 'model/product/color.model';
import imgDefault from 'assets/icon/img-default.svg';
import {
  colorDeleteAction,
  colorDeleteManyAction,
  getColorAction,
} from 'domain/actions/product/color.action';
import {isUndefinedOrNull} from 'utils/AppUtils';
import CustomFilter from 'component/table/custom.filter';
import ContentContainer from 'component/container/content.container';
import UrlConfig from 'config/UrlConfig';
import ButtonCreate from 'component/header/ButtonCreate';

const action: Array<MenuAction> = [
  {
    id: 1,
    name: 'Xóa',
  },
  {
    id: 1,
    name: 'Export',
  },
];

const {Option} = Select;
const ColorListScreen: React.FC = () => {
  const [selected, setSelected] = useState<Array<ColorResponse>>([]);
  const [data, setData] = useState<PageResponse<ColorResponse>>({
    metadata: {
      limit: 0,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [selector, setSelector] = useState<PageResponse<ColorResponse>>({
    metadata: {
      limit: 0,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const history = useHistory();
  const dispatch = useDispatch();
  const query = useQuery();
  let [params, setPrams] = useState<ColorSearchQuery>(getQueryParams(query));
  const columns = [
    {
      title: 'Mã màu',
      dataIndex: 'code',
      render: (value: string, item: ColorResponse) => {
        return <Link to={`colors/${item.id}`}>{value}</Link>;
      },
    },
    {
      title: 'Tên màu',
      dataIndex: 'name',
    },
    {
      title: 'Màu chủ đạo',
      dataIndex: 'parent_id',
    },
    {
      title: 'Màu hex',
      dataIndex: 'hex_code',
      render: (value: string) => (value !== null ? `#${value}` : ''),
    },
    {
      title: 'Ảnh màu',
      dataIndex: 'image',
      render: (value: string) => {
        return !isUndefinedOrNull(value) && value !== '' ? (
          <Image
            width={40}
            src={value}
            placeholder={<img alt="" src={imgDefault} />}
          />
        ) : (
          ''
        );
      },
    },
    {
      title: 'Người tạo',
      dataIndex: 'created_name',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'description',
    },
  ];
  const onDeleteSuccess = useCallback(() => {
    selected.splice(0, selected.length);
    dispatch(getColorAction(params, setData));
  }, [dispatch, params, selected]);
  const onDelete = useCallback(() => {
    if (selected.length === 0) {
      showWarning('Vui lòng chọn phần từ cần xóa');
      return;
    }
    if (selected.length === 1) {
      let id = selected[0].id;
      dispatch(colorDeleteAction(id, onDeleteSuccess));
      return;
    }
    let ids: Array<number> = [];
    selected.forEach((a) => ids.push(a.id));
    dispatch(colorDeleteManyAction(ids, onDeleteSuccess));
  }, [dispatch, onDeleteSuccess, selected]);
  const onSelect = useCallback((selectedRow: Array<ColorResponse>) => {
    setSelected(selectedRow);
  }, []);
  const onFinish = useCallback(
    (values) => {
      let newPrams = {...params, ...values, page: 1};
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.push(`${UrlConfig.COLORS}?${queryParam}`);
    },
    [history, params]
  );
  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setPrams({...params});
      history.replace(`${UrlConfig.COLORS}?${queryParam}`);
    },
    [history, params]
  );
  const onMenuClick = useCallback(
    (index: number) => {
      switch (index) {
        case 0:
          onDelete();
          break;
      }
    },
    [onDelete]
  );
  useEffect(() => {
    dispatch(getColorAction({...params, is_main_color: 0,}, setData));
    dispatch(getColorAction({is_main_color: 1}, setSelector));
    return () => {};
  }, [dispatch, params]);
  return (
    <ContentContainer
      title="Quản lý màu sắc"
      breadcrumb={[
        {
          name: 'Tổng quản',
          path: UrlConfig.HOME,
        },
        {
          name: 'Sản phẩm',
          path: `${UrlConfig.PRODUCT}`,
        },
        {
          name: 'Màu sắc',
        },
      ]}
      extra={
        <ButtonCreate path={`${UrlConfig.COLORS}/create`} />
      }
    >
      <Card>
        <CustomFilter menu={action} onMenuClick={onMenuClick}>
          <Form
            className="form-search"
            size="middle"
            onFinish={onFinish}
            initialValues={params}
            layout="inline"
          >
            <Form.Item name="info">
              <Input
                prefix={<img src={search} alt="" />}
                style={{width: 200}}
                placeholder="Tên/Mã màu sắc"
              />
            </Form.Item>
            <Form.Item name="parent_id">
              <Select placeholder="Chọn màu chủ đạo" style={{width: 200}}>
                <Option value="">Chọn màu chủ đạo</Option>
                {selector.items.map((item) => (
                  <Option key={item.id} value={item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="hex_code">
              <Input
                prefix={<img src={search} alt="" />}
                style={{width: 200}}
                placeholder="Mã hex"
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Lọc
              </Button>
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
          onSelectedChange={onSelect}
          rowKey={(item: ColorResponse) => item.id}
        />
      </Card>
    </ContentContainer>
  );
};

export default ColorListScreen;
