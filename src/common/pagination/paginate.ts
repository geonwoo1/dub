import {IPaginationData, IPaginationOptions} from "../../interface/pagination.interface";
import {SelectQueryBuilder} from "typeorm";

export class Pagination<Entity>{
    /**
     * main query builder
     */
    private queryBuilder: SelectQueryBuilder<Entity>;
    /**
     * a list of items to be returned
     */
    readonly items: Entity[];
    /**
     * associated page options
     */
    private options: IPaginationOptions;

    constructor(
        /**
         * a list of items to be returned
         */
        queryBuilder: SelectQueryBuilder<Entity>,
        /**
         * associated page options
         */
        options: IPaginationOptions,
    ){
        this.queryBuilder = queryBuilder;
        //
        options.page = options.page > 0? options.page-1: 0;
        options.limit = options.limit >= 1? options.limit: 10;
        this.options = options;
    }

    /**
     * create pagination
     */
    async paginateNested(): Promise<IPaginationData>{
        const totalCountQuery = this.queryBuilder.clone();
        const mainQuery = this.queryBuilder.clone();
        const [rows, totalCount] = [await mainQuery.skip(this.options.page * this.options.limit).take(this.options.limit)
            .getManyAndCount(), await totalCountQuery.getCount()]
        return this.createPaginationMeta({rows, totalCount});
    }

    /**
     * create pagination with nested data order by
     */
    async paginateNestedOrderBy({mainEntity, orderBy}: {mainEntity: string, orderBy: {[columnName: string]: ("ASC" | "DESC") }}): Promise<IPaginationData>{
        const orderByEntries = Object.entries(orderBy);
        const mainOrderBy = {};
        // main entity(가장 상위 데이터)만 정렬하기 위해 따로 추출하여 활용
        for (const [key, value] of orderByEntries) {
            if(key.includes(mainEntity+'.'))
            {
                mainOrderBy[key] = value;
            }
        }
        const totalCountQuery = this.queryBuilder.clone();
        const mainQuery = this.queryBuilder.clone();
        const subQuery = this.queryBuilder.clone();
        const [rows, totalCount] = [await mainQuery
            .innerJoinAndSelect(`(${subQuery.select('og.id as id').offset(this.options.page * this.options.limit).limit(this.options.limit).orderBy(mainOrderBy).groupBy('og.id').getQuery()})`, 'sub', 'og.id = sub.id')
            .orderBy(orderBy)
            .getMany(), await totalCountQuery.getCount()];
        return this.createPaginationMeta({rows, totalCount});
    }

    private createPaginationMeta({rows, totalCount}): IPaginationData{
        return {
            items: rows,
            meta: {
                currentPage: this.options.page+1,
                itemCount: rows.length,
                itemPerPage: this.options.limit,
                totalItems: totalCount,
                totalPages: Math.ceil(totalCount / this.options.limit),
            }
        }
    }
}
