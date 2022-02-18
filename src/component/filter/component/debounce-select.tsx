import React, { CSSProperties, FC, ReactNode } from 'react';
// import ReactDOM from 'react-dom';
// import 'antd/dist/antd.css';
// import './index.css';
import { Select, SelectProps, Spin } from 'antd';
import debounce from 'lodash/debounce';

interface Props extends SelectProps<any> {
  mode: "multiple" | "tags" | undefined;
  // value: any;
  placeholder: string;
  style?: CSSProperties;
  containerStyle?: CSSProperties;
  className?: string;
  containerClassName?: string;
  suffix?: ReactNode;
  fetchOptions: any;
  debounceTimeout?: number;
  optionsVariant?: { label: string, value: string}[];
  // any props that come into the component
}
const DebounceSelect: FC<Props> =({ fetchOptions, debounceTimeout = 800, optionsVariant, ...props }) => {
  
  const [fetching, setFetching] = React.useState(false);
  const [options, setOptions] = React.useState(optionsVariant);
  const fetchRef = React.useRef(0);
  const debounceFetcher = React.useMemo(() => {
    const loadOptions = (value: any) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);
      fetchOptions(value).then((newOptions: any) => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }
        setOptions(newOptions);
        setFetching(false);
      });
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);
  return (
    <Select
      // labelInValue
      filterOption={false}
      // optionFilterProp="children"
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      getPopupContainer={trigger => trigger.parentNode}
      {...props}
      options={options}
    />
  );
} // Usage of DebounceSelect


export default DebounceSelect;