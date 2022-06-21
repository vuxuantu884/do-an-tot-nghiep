export interface PagingParam {
    currentPage: number;
    perPage: number;
}
export interface ResultPaging {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
    result: any;
}