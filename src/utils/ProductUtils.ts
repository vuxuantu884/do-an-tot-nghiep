import { FormInstance } from "antd";
import { MaterialResponse } from "model/product/material.model";
import { VariantResponse } from "model/product/product.model";
import { SizePriority } from "model/product/size.model";

export const handleChangeMaterial = (material: MaterialResponse | false, form: FormInstance) => {
  if (material) {
    let description = form.getFieldValue("description");

    const formatDescription = `<p>
      <strong style="color: rgb(34, 34, 34)">Thông tin bảo quản: </strong>
      <span style="background-color: transparent"
        >${material.preserve}</span
      >
    </p>
    <p><br /></p>
    <p>
      <strong style="color: rgb(34, 34, 34)">Ưu điểm: </strong
      ><span style="background-color: transparent">${material.advantages}</span>
    </p>
    <p><br /></p>
    <p>
      <strong style="color: rgb(34, 34, 34)">Ghi chú: </strong>${material.description}
    </p>
    `;
    description += formatDescription;
    form.setFieldsValue({ description: description, material: material.name });
  }
};

export const getFirstProductAvatarByVariantResponse = (variants: Array<VariantResponse>) => {
  let isFind = false;
  let variantAvatarIndex = 0;
  const FIRST_VARIANT_IMAGE_INDEX = 0;

  const revertVariants = variants.reverse();
  //check existed product avatar, if not => set first variant image for product avatar
  revertVariants.forEach((item, i) => {
    if (item.saleable && !isFind) {
      item.variant_images.forEach((item) => {
        if (!isFind) {
          if (item.product_avatar) {
            isFind = true;
          } else {
            variantAvatarIndex = i;
          }
        }
      });
    }
  });

  if (!isFind && revertVariants[variantAvatarIndex].variant_images[FIRST_VARIANT_IMAGE_INDEX]) {
    //reset product avatar
    revertVariants.forEach((item) => {
      item.variant_images.forEach((item) => {
        item.product_avatar = false;
      });
    });

    //set product avatar
    if (revertVariants[variantAvatarIndex].saleable)
      revertVariants[variantAvatarIndex].variant_images[
        FIRST_VARIANT_IMAGE_INDEX
      ].product_avatar = true;
  }

  return revertVariants.reverse();
};

export const sizePriority: Array<SizePriority> = [
  {
    size: "XS",
    priority: 1
  },
  {
    size: "S",
    priority: 2
  },
  {
    size: "M",
    priority: 3
  },
  {
    size: "L",
    priority: 4
  },
  {
    size: "XL",
    priority: 5
  },
  {
    size: "2XL",
    priority: 6
  },
  {
    size: "3XL",
    priority: 7
  },
  {
    size: "4XL",
    priority: 8
  }
]

const compareSizeNumber = (a: number, b: number, sortTypeValue: number): number => {
  return (a - b) * sortTypeValue;
}

const compareSizeStringAndNumber = (sortTypeValue: number): number => {
  /**
   * hiển thị size chữ rồi đến size số
   */
  return sortTypeValue * -1;
}

const compareSizeNumberAndString = (sortTypeValue: number): number => {
  return sortTypeValue
}

export const sortSizeProduct = (firstSize: string | number, secondSize: string | number, sortType: "desc" | "asc", unknowSizePriority?: number): number => {
  const sortTypeValue = sortType === "asc" ? 1 : -1;
  const unknowSizePriorityValue = typeof unknowSizePriority !== "number" ? 999 : unknowSizePriority; // size nào lạ thì ưu tiên cao hơn => đẩy về sau
  if (Number(firstSize) && Number(secondSize)) {
    return compareSizeNumber(Number(firstSize), Number(secondSize), sortTypeValue);
  }

  /**
   * case size : "m/l" "m-l" "10-11" "10/11"
   */
  const regexMultisize = /\s*(?:-|\/)\s*/
  const firstSizesSplit = firstSize.toString().split(regexMultisize)[0];
  const secondSizeSplit = secondSize.toString().split(regexMultisize)[0];

  if (Number(firstSizesSplit) && Number(secondSizeSplit)) {
    return compareSizeNumber(Number(firstSizesSplit), Number(secondSizeSplit), sortTypeValue);
  }

  if (typeof firstSizesSplit === "string" && Number(secondSizeSplit)) {
    return compareSizeStringAndNumber(sortTypeValue);
  }

  if (Number(firstSizesSplit) && typeof secondSizeSplit === "string") {
    return compareSizeNumberAndString(sortTypeValue);
  }

  if (typeof firstSizesSplit === "string" && typeof secondSizeSplit === "string") {
    const firstSizePriority = sizePriority.find(
      (item: SizePriority) => item.size.toString().toLowerCase() === firstSizesSplit.toLowerCase()
    )?.priority || unknowSizePriorityValue;

    const secondSizePriority = sizePriority.find(
      (item: SizePriority) => item.size.toString().toLowerCase() === secondSizeSplit.toLowerCase()
    )?.priority || unknowSizePriorityValue;

    return (firstSizePriority - secondSizePriority) * sortTypeValue;
  }

  return 0;
}