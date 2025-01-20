import {DataSource} from 'typeorm';
import {OrderGroup} from "./entities/order-group.entity";
import {Order} from "./entities/order.entity";
import {OrderConfig} from "./entities/order-config.entity";
import {OrderDetail} from "./entities/order-detail.entity";
import {OrderAttachedFile} from "./entities/order-attached-file.entity";
import {OrderLanguageInfo} from "./entities/order-language-info.entity";

export const orderGroupProviders = [
    {
        provide: 'ORDER_GROUP_REPOSITORY',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(OrderGroup),
        inject: ['DATA_SOURCE'],
    },
];

export const orderProviders = [
    {
        provide: 'ORDER_REPOSITORY',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(Order),
        inject: ['DATA_SOURCE'],
    },
];

export const orderDetailProviders = [
    {
        provide: 'ORDER_DETAIL_REPOSITORY',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(OrderDetail),
        inject: ['DATA_SOURCE'],
    },
];

export const orderAttachedFileProviders = [
    {
        provide: 'ORDER_ATTACHED_FILE_REPOSITORY',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(OrderAttachedFile),
        inject: ['DATA_SOURCE'],
    },
];

export const orderConfigProviders = [
    {
        provide: 'ORDER_CONFIG_REPOSITORY',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(OrderConfig),
        inject: ['DATA_SOURCE'],
    },
];

export const orderLanguageInfoProviders = [
    {
        provide: 'ORDER_LANGUAGE_INFO_REPOSITORY',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(OrderLanguageInfo),
        inject: ['DATA_SOURCE'],
    },
];