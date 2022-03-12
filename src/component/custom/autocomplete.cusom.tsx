import { LoadingOutlined, SearchOutlined } from "@ant-design/icons";
import { AutoComplete, Button, Input } from "antd";
import { RefSelectProps } from "antd/lib/select";
import { CSSProperties } from "react";
import { Component } from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";

interface CustomAutoCompleteType {
  id?: string;
  placeholder?: string;
  dropdownMatchSelectWidth?: number;
  disabled?: boolean;
  style?: CSSProperties;
  dropdownClassName?: string;
  onSearch?: (value: string) => void;
  options?: any[];
  loading?: boolean;
  defaultActiveFirstOption?: boolean;
  onSelect?: (value: string) => void;
  showAdd?: boolean;
  textAdd?: string;
  textEmpty?: string;
  onClickAddNew?: () => void;
	isFillInputWithTextSelected?: boolean; // có điền vào input giá trị đã select ko
	defaultValue?: string; // giá trị mặc định
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
  autoCompleteRef: RefSelectProps | null = null;
  constructor(
    props: CustomAutoCompleteType | Readonly<CustomAutoCompleteType>
  ) {
    super(props);
    this.state = {
      open: false,
      value: this.props.defaultValue ? this.props.defaultValue : "",
    };
  }

  focus() {
    this.autoCompleteRef?.focus();
  }

  onSelect = (value: string) => {
    this.setState({
      open: false,
      value: this.props.isFillInputWithTextSelected ? value : "",
    });
    this.props.onSelect && this.props.onSelect(value);
    this.autoCompleteRef?.blur();
  };

  onSearch = (value: string) => {
    this.setState({ value: value });
    this.props.onSearch && this.props.onSearch(value);
  };

  onDropdownVisibleChange = (open: boolean) => {
    this.setState({ open: open });
  };

  add = () => {
    this.setState({ open: false }, () => {
      setTimeout(
        () => this.props.onClickAddNew && this.props.onClickAddNew(),
        100
      );
    });
  };

  render() {
    return (
      <AutoComplete
        id={this.props.id}
        value={this.state.value}
        ref={(ref) => (this.autoCompleteRef = ref)}
        notFoundContent={
          this.state.value ? (this.props.textEmpty ? this.props.textEmpty : "Không có dữ liệu") : "Vui lòng điền kí tự!"
        }
        dropdownMatchSelectWidth={this.props.dropdownMatchSelectWidth}
        style={this.props.style}
        onDropdownVisibleChange={this.onDropdownVisibleChange}
        open={this.state.open}
        dropdownClassName={this.props.dropdownClassName}
        onSearch={this.onSearch}
        options={this.props.options}
				defaultActiveFirstOption = {this.props.defaultActiveFirstOption ? this.props.defaultActiveFirstOption : true}
        dropdownRender={(menu) => (
          <div className="dropdown-custom">
            {this.props.showAdd && (
              <Button
                icon={<AiOutlinePlusCircle size={24} />}
                className="dropdown-custom-add-new"
                type="link"
                onClick={this.add}
              >
                {this.props.textAdd ? this.props.textAdd : "Thêm mới"}
              </Button>
            )}
            {menu}
          </div>
        )}
        onSelect={this.onSelect}
        disabled={this.props.disabled}
      >
        <Input
          ref={(ref) => (this.inputRef = ref)}
          placeholder={this.props.placeholder}
          prefix={
            this.props.loading ?
              <LoadingOutlined style={{ color: "#2a2a86" }} />
              :
              <SearchOutlined style={{ color: "#ABB4BD" }} />
          }
        />
      </AutoComplete>
    );
  }
}
