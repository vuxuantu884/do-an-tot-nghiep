import { FilterOutlined } from "@ant-design/icons";
import { Button, Form, FormInstance, Input, Row, Tag } from "antd";
import CustomFilterDatePicker from "component/custom/filter-date-picker.custom";
import CustomSelect from "component/custom/select.custom";
import BaseFilter from "component/filter/base.filter";
import { MenuAction } from "component/table/ActionButton";
import CustomFilter from "component/table/custom.filter";
import { StoreResponse } from "model/core/store.model";
import { HandoverSearchRequest } from "model/handover/handover.search";
import { ChannelsResponse, DeliveryServiceResponse } from "model/response/order/order.response";
import React, { createRef, useCallback, useEffect, useMemo, useState } from "react";
import { HandoverType } from "../../handover.config";
import { HandoverFilterComponent } from "./styles";

interface RenderKeyHandoverProps {
  value: string;
  params: HandoverSearchRequest;
  onCloseTag: (key: string) => void;
  deliveryServices: Array<DeliveryServiceResponse>;
  channels: Array<ChannelsResponse>;
}

const RenderKey: React.FC<RenderKeyHandoverProps> = (props: RenderKeyHandoverProps) => {
  let { value, params, onCloseTag, deliveryServices, channels } = props;
  const title = useMemo(() => {
    switch (value) {
      case 'delivery_service_provider_ids':
        return 'HVC';
      case 'channel_ids':
        return 'Kênh';
      case 'types':
        return 'Loại biên bản';
      default:
        return '';
    }
  }, [value]);

  const valueKey = useMemo(() => {
    switch (value) {
      case 'delivery_service_provider_ids':
        return params.delivery_service_provider_ids;
      case 'channel_ids':
        return params.channel_ids;
      case 'types':
        return params.types;
      default:
        return ''
    }
  }, [params.channel_ids, params.delivery_service_provider_ids, params.types, value]);

  const fillTag = useMemo(() => {
    switch (value) {
      case 'delivery_service_provider_ids':
        return params.delivery_service_provider_ids?.map((item) => {
          if (item.toString() === '-1') {
            return "Tự vận chuyển";
          }
          let index = deliveryServices.findIndex((value) => value.id.toString() === item.toString())
          if (index === -1) return ''
          return deliveryServices[index].name
        })
          .filter(item => item !== '')
          .join(", ");
      case 'types':
        return params.types?.map((item) => {
          if (item.toString() === '-1') {
            return "Tự vận chuyển";
          }
          let index = HandoverType.findIndex((value) => value.value === item);
          if (index === -1) return ''
          return HandoverType[index].display;
        })
          .filter(item => item !== '')
          .join(", ");
      case 'channel_ids':
        return params.channel_ids?.map((item) => {
          if (item.toString() === '-1') {
            return "Tự vận chuyển";
          }
          let index = channels.findIndex((value) => value.id.toString() === item.toString());
          if (index === -1) return ''
          return channels[index].name;
        })
          .filter(item => item !== '')
          .join(", ");
    }
  }, [channels, deliveryServices, params.channel_ids, params.delivery_service_provider_ids, params.types, value]);

  if (valueKey === undefined || valueKey === null || valueKey === '' || fillTag === '') {
    return null;
  }

  return (
    <Tag className="tag" closable onClose={() => onCloseTag(value)}>
      <span className="">{title}: </span>
      {fillTag}
    </Tag>
  )
}

type ReturnFilterProps = {
  params: HandoverSearchRequest;
  actions: Array<MenuAction>;
  isLoading?: boolean;
  stores: Array<StoreResponse>;
  loadingMaster: boolean;
  loadingFilter: boolean;
  deliveryServices: Array<DeliveryServiceResponse>;
  channels: Array<ChannelsResponse>;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: HandoverSearchRequest) => void;
};

const HandoverFilter: React.FC<ReturnFilterProps> = (props: ReturnFilterProps) => {
  const { onMenuClick, actions, params, stores, deliveryServices, loadingFilter, loadingMaster, onFilter, channels } = props;
  const formRef = createRef<FormInstance>();
  const formSearchRef = createRef<FormInstance>();
  const [form] = Form.useForm();
  const [visible, setVisible] = useState<boolean>(true);

  const [createdClick, setCreatedClick] = useState("");

  const onActionClick = useCallback(
    (index: number) => {
      onMenuClick && onMenuClick(index);
    },
    [onMenuClick]
  );

  const initialValues = useMemo(() => {
    return {
      ...params,
    }
  }, [params]);

  const onFinish = useCallback((value) => {
    let request: HandoverSearchRequest = {
      ...params,
      ...value
    }
    onFilter && onFilter(request);
  }, [onFilter, params]);

  const onFinishOtherForm = useCallback((value) => {
    let request: HandoverSearchRequest = {
      ...params,
      from_created_date: value.from_created_date ? value.from_created_date : null,
      to_created_date: value.to_created_date ? value.to_created_date : null,
      channel_ids: value.channel_ids,
      delivery_service_provider_ids: value.delivery_service_provider_ids,
      types: value.types
    }
    onFilter && onFilter(request);
  }, [onFilter, params]);

  const openFilter = useCallback(() => {
    setVisible(true);
  }, []);

  const onCancelFilter = useCallback(() => {
    setVisible(false);
  }, []);

  const onClearFilterClick = useCallback(() => {
    let newParams = {
      ...params,
      from_created_date: null,
      to_created_date: null,
      channel_ids: undefined,
      delivery_service_provider_ids: undefined,
      types: undefined
    };
    setVisible(false);
    onFilter && onFilter(newParams);

  }, [onFilter, params])

  const onCloseTag = useCallback((key) => {
    let newParams = {
      ...params,
      [key]: undefined,
    }
    form.setFieldsValue(newParams);
    form.submit();
  }, [form, params]);

  const onFilterClick = useCallback(() => {
    setVisible(false);
    formRef.current?.submit();
  }, [formRef])
  useEffect(() => {
    setVisible(false);
  }, []); 
  return (
    <HandoverFilterComponent>
      <div className="handover-filter">
        <CustomFilter onMenuClick={onActionClick} menu={actions}>
          <Form onFinish={onFinish} ref={formSearchRef} initialValues={initialValues} layout="inline">
            <div style={{ width: '100%' }}>
              <Row>
                <Form.Item name="store_ids" style={{ width: '20%' }}>
                  <CustomSelect
                    disabled={loadingMaster || loadingFilter}
                    placeholder="Chọn cửa hàng"
                    allowClear
                    showArrow
                    mode="multiple"
                    maxTagCount="responsive"
                    showSearch
                  >
                    {
                      stores.map((item) => (
                        <CustomSelect.Option key={item.id} value={item.id.toString()}>
                          {item.name}
                        </CustomSelect.Option>
                      ))
                    }
                  </CustomSelect>
                </Form.Item>
                <Form.Item name="query" style={{ flex: 1 }}>
                  <Input
                    disabled={loadingMaster || loadingFilter}
                    placeholder="ID biên bản bàn giao/ Mã đơn hàng/ Mã đơn giao"
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    disabled={loadingMaster || loadingFilter}
                    type="primary"
                    loading={loadingFilter}
                    htmlType="submit"
                  >
                    Lọc
                  </Button>
                </Form.Item>
                <Form.Item>
                  <Button disabled={loadingMaster || loadingFilter} icon={<FilterOutlined />} onClick={openFilter}>Thêm bộ lọc</Button>
                </Form.Item>
              </Row>
            </div>
          </Form>
        </CustomFilter>
        <BaseFilter
          onClearFilter={onClearFilterClick}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          width={400}
          visible={visible}>
          <Form form={form} onFinish={onFinishOtherForm} ref={formRef} initialValues={initialValues} layout="vertical">
            <Form.Item label="Hãng vận chuyển" name="delivery_service_provider_ids">
              <CustomSelect
                placeholder="Chọn hãng vận chuyển"
                allowClear
                showArrow
                mode="multiple"
                maxTagCount="responsive"
                showSearch
              >
                <CustomSelect.Option key={-1} value="-1">
                  Tự vận chuyển
                </CustomSelect.Option>
                {
                  deliveryServices.map((item) => (
                    <CustomSelect.Option key={item.id} value={item.id.toString()}>
                      {item.name}
                    </CustomSelect.Option>
                  ))
                }
              </CustomSelect>
            </Form.Item>
            <Form.Item label="Loại" name="types">
              <CustomSelect
                placeholder="Chọn loại biên bản"
                allowClear
                showArrow
                mode="multiple"
                maxTagCount="responsive"
                showSearch
              >
                {
                  HandoverType.map((item) => (
                    <CustomSelect.Option key={item.value} value={item.value}>
                      {item.display}
                    </CustomSelect.Option>
                  ))
                }
              </CustomSelect>
            </Form.Item>
            <Form.Item label="Thời gian tạo">
              <CustomFilterDatePicker
                fieldNameFrom="from_created_date"
                fieldNameTo="to_created_date"
                activeButton={createdClick}
                setActiveButton={setCreatedClick}
                format="DD-MM-YYYY"
                formRef={formRef}
              />
            </Form.Item>
            <Form.Item label="Kênh" name="channel_ids">
              <CustomSelect
                placeholder="Chọn kênh"
                allowClear
                showArrow
                mode="multiple"
                maxTagCount="responsive"
                showSearch
              >
                <CustomSelect.Option key={-1} value="-1">
                  Biên bản tự tạo
                </CustomSelect.Option>
                {
                  channels.map((item) => (
                    <CustomSelect.Option key={item.id} value={item.id.toString()}>
                      {item.name}
                    </CustomSelect.Option>
                  ))
                }
              </CustomSelect>
            </Form.Item>
          </Form>

        </BaseFilter>
      </div>
      <div className="result-tags">
        {
          Object.keys(params)
            .map((value, index) => <React.Fragment key={index}>
              <RenderKey channels={channels} deliveryServices={deliveryServices} params={params} value={value} onCloseTag={onCloseTag} />
            </React.Fragment>)
        }
      </div>
    </HandoverFilterComponent>
  )
};

export default HandoverFilter;


