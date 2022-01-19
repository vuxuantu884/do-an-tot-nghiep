import { css } from "styled-components";
import { primaryColor } from "./variables";

export const globalCssLayoutOutsideComponent = css`
  .searchDropdown__productTitle {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    max-height: 42px;
    line-height: 21px;
  }
  .ant-select-selection-item {
    .hideInSelect {
      display: none;
    }
    
  }
  .ant-select-item-option  {
    .hideInDropdown {
      display: none;
    }
    .itemParent {
      font-weight: 500;
    }
  }
	.ant-picker-dropdown {
		.datePickerFooter {
			white-space: nowrap;
		}
		.datePickerSelectRange {
			text-align: center;
			cursor: pointer;
			color: ${primaryColor};
			&.active,
			&:hover {
				font-weight: 500;
			}
		}
	}

  .yody-modal-price-product .ant-modal-header{
    padding: 16px 20px 0px 20px;
  }

  .yody-modal-price-product .ant-modal-body{
    padding: 5px 20px;
  }
  .yody-table-product-search .ant-image-mask-info{
    font-size: 10px;
  }
  .yody-text-ellipsis{
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
