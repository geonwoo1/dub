import { DataSource } from 'typeorm';
import {User} from "./entities/user.entity";
import {UserToken} from "./entities/user-token.entity";

export const userProviders = [
    {
        provide: 'USER_REPOSITORY',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
        inject: ['DATA_SOURCE'],
    },
];

export const userTokenProviders = [
    {
        provide: 'USER_TOKEN_REPOSITORY',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(UserToken),
        inject: ['DATA_SOURCE'],
    },
];