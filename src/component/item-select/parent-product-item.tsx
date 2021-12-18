import { Checkbox } from "antd";
import imgDefIcon from "assets/img/img-def.svg";
import { ProductResponse } from "model/product/product.model";

export type ParentProductItemProps = {
    data: ProductResponse;
    showCheckBox?: boolean
    checked?: boolean
    onChange?: (checked: boolean) => void
}

const ParentProductItem: React.FC<ParentProductItemProps> = (props: ParentProductItemProps) => {
    const { data, showCheckBox, checked } = props;
    return (
        <div className="product-item">
            {
                showCheckBox && (
                    <Checkbox checked={checked} onChange={(e) => props.onChange && props.onChange(e.target.checked)} />
                )
            }
            <div className="product-item-image">
                <img src={imgDefIcon} alt={data.name} />
            </div>
            <div className="product-item-info">
                <div className="product-item-info-left">
                    <span className="product-item-name">{data.name}</span>
                    <span className="product-item-sku">{data.code}</span>
                </div>
                <div className="product-item-info-right">

                    <span className="product-item-price">-<span className="currency"></span></span>

                    <span className="product-item-inventory">Số lượng tồn: <span className="value">
                        {/* {data.on_hand ? data.on_hand : 0} */}
                        -
                    </span></span>
                </div>
            </div>
        </div>
    )
}

export default ParentProductItem;
