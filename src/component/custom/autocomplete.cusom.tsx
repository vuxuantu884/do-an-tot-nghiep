import { SearchOutlined } from "@ant-design/icons";
import { AutoComplete, Button, Input } from "antd";
import { RefSelectProps } from "antd/lib/select";
import { CSSProperties } from "react";
import { Component } from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";

interface CustomAutoCompleteType {
  placeholder?: string;
  dropdownMatchSelectWidth?: number;
  style?: CSSProperties;
  dropdownClassName?: string;
  onSearch?: (value: string) => void;
  options?: any[];
  loading?: boolean;
  onSelect?: (value: string) => void;
  showAdd?: boolean;
  textAdd?: string;
  textEmpty?: string
  onClickAddNew?: () => void;
}

interface CustomAutoCompleteState {
  open: boolean;
  value: string;
}

export default class CustomAutoComplete extends Component<
  CustomAutoCompleteType,
  CustomAutoCompleteState
> {
  inputRef: Input | null = null;
  auputRef: RefSelectProps | null = null;
  constructor(
    props: CustomAutoCompleteType | Readonly<CustomAutoCompleteType>
  ) {
    super(props);
    this.state = {
      open: false,
      value: '',
    };
  }

  focus() {}

  onSelect = (value: string) => {
    this.setState({
      open: false,
      value: '',
    });
    this.props.onSelect && this.props.onSelect(value);
    this.auputRef?.blur();
  };

  onSearch = (value: string) => {
    this.setState({value: value})
    this.props.onSearch && this.props.onSearch(value);
  };

  onDropdownVisibleChange = (open: boolean) => {
    this.setState({ open: open, });
  };

  add = () => {
    this.setState({open: false});
    this.props.onClickAddNew && this.props.onClickAddNew();
  }

  render() {
    return (
      <AutoComplete
        value={this.state.value}
        ref={(ref) => (this.auputRef = ref)}
        maxLength={255}
        notFoundContent={this.props.textEmpty ? this.props.textEmpty : "Không có dữ liệu"}
        dropdownMatchSelectWidth={this.props.dropdownMatchSelectWidth}
        style={this.props.style}
        onDropdownVisibleChange={this.onDropdownVisibleChange}
        open={this.state.open}
        dropdownClassName={this.props.dropdownClassName}
        onSearch={this.onSearch}
        options={this.props.options}
        dropdownRender={(menu) => (
          <div className="dropdown-custom">
            {this.props.showAdd && (
              <Button
                icon={<AiOutlinePlusCircle size={24} />}
                className="dropdown-custom-add-new"
                type="link"
                onClick={this.add}
              >
                {this.props.textAdd ? this.props.textAdd : 'Thêm mới'}
              </Button>
            )}
            {menu}
          </div>
        )}
        onSelect={this.onSelect}
      >
        <Input
          ref={(ref) => (this.inputRef = ref)}
          placeholder={this.props.placeholder}
          prefix={<SearchOutlined style={{ color: "#ABB4BD" }} />}
        />
      </AutoComplete>
    );
  }
}
