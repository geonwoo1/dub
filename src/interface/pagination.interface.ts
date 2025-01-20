export interface IPaginationData
{
    items: Array<any>;
    meta: {
        currentPage: number;
        itemCount: number;
        itemPerPage: number;
        totalItems: number;
        totalPages: number;
    }
}

export interface IPaginationOptions
{
    page: number;
    limit: number;
}