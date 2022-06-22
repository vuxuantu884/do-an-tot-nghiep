import { PagingParam, ResultPaging } from "model/paging";

/**
 * phân tách trang cho dữ liệu trải phẳng
 * @param data 
 * @param pagingParam 
 * @returns 
 * currentPage :trang hiện tại
 * lastPage: trang cuối
 * perPage: số bản ghi trên 1 trang
 * total: tổng số bản ghi
 * result: dữ liệu hiển thị
 */
export const flatDataPaging = (data: any, pagingParam: PagingParam) => {
    if (!data || (data && data.length <= 0)) {
        return {
            currentPage: 1,
            lastPage: 1,
            perPage: 30,
            total: 0,
            result: []
        }
    } else {
        let total: number = data.length;
        let totalPage: number = Math.ceil(total / pagingParam.perPage);

        if (pagingParam.currentPage > totalPage) // trang hiện tại lớn hơn tổng số trang, trang hiện tại === tổng trang
            pagingParam.currentPage = totalPage;

        let start: number = (pagingParam.currentPage - 1) * pagingParam.perPage; // lấy bản ghi bắt đầu từ index === start
        let end: number = Number(start) + Number(pagingParam.perPage);// kết thúc từ bản ghi có index === end
     
        let dataCopy = data.slice(start, end);

        let result: ResultPaging = {
            currentPage: pagingParam.currentPage,
            lastPage: totalPage,
            perPage: pagingParam.perPage,
            total: total,
            result: dataCopy
        }

        return result;
    }
}