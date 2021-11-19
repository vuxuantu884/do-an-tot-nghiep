import { MenuAction } from 'component/table/ActionButton';

export const STATUS_PROMO = [
{
    code: 'ACTIVE',
    value: 'Đang áp dụng',
    style: {
    background: "rgba(42, 42, 134, 0.1)",
    borderRadius: "100px",
    color: "rgb(42, 42, 134)",
    padding: "5px 10px"
    }
},
{
    code: 'DISABLED',
    value: 'Tạm ngưng',
    style: {
    background: "rgba(252, 175, 23, 0.1)",
    borderRadius: "100px",
    color: "#FCAF17",
    padding: "5px 10px"
    }},
{
    code: 'DRAFT',
    value: 'Chờ áp dụng' ,
    style: {
    background: "rgb(245, 245, 245)",
    borderRadius: "100px",
    color: "rgb(102, 102, 102)",
    padding: "5px 10px"
    }},
{
    code: 'CANCELLED',
    value: 'Đã huỷ',
    style: {
    background: "rgba(226, 67, 67, 0.1)",
    borderRadius: "100px",
    color: "rgb(226, 67, 67)",
    padding: "5px 10px"
    }},
]

export const STATUS_PROMO_CODE = [
    // {
    //     // disabled: false,
    //     published: true,
    //     value: 'Đã tặng' ,
    //     style: {
    //         background: "rgba(252, 175, 23, 0.1)",
    //         borderRadius: "100px",
    //         color: "#FCAF17",
    //         padding: "5px 10px"
    //     }
    // },
    {
        disabled: false,
        // published: false,
        value: 'Đang áp dụng',
        style: {
        background: "rgba(42, 42, 134, 0.1)",
        borderRadius: "100px",
        color: "rgb(42, 42, 134)",
        padding: "5px 10px"
        }
    },
    {
        disabled: true,
        // published: false,
        value: 'Ngừng áp dụng',
        style: {
        background: "rgb(245, 245, 245)",
        borderRadius: "100px",
        color: "rgb(102, 102, 102)",
        padding: "5px 10px"
        }
    }
]

export  const ACTIONS_PROMO: Array<MenuAction> = [
    { id: 1, name: "Kích hoạt" },
    { id: 2, name: "Tạm ngừng" },
    { id: 3, name: "Xuất Excel", disabled: true },
    { id: 4, name: "Xoá" , disabled: true},
];

export  const ACTIONS_DISCOUNT: Array<MenuAction> = [
    { id: 1, name: "Kích hoạt" },
    { id: 2, name: "Tạm ngừng" },
    { id: 3, name: "Xuất Excel", disabled: true },
];

export const ACTIONS_PROMO_CODE: Array<MenuAction> = [
    // {
    //     id: 1,
    //     name: "Đã tặng",
    // },
    {
        id: 2,
        name: "Áp dụng",
    },
    {
        id: 3,
        name: "Ngừng áp dụng",
    },
];
