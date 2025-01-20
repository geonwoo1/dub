import { DataSource } from 'typeorm';
import {ConfigModule, ConfigService} from "@nestjs/config";
import {addTransactionalDataSource, initializeTransactionalContext, StorageDriver} from "typeorm-transactional";

export const databaseProviders = [
    {
        provide: 'DATA_SOURCE',
        import: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => {
            const dataSource = new DataSource({
                type: 'mysql',
                host: configService.get<string>('DB_HOST'),
                port: configService.get<number>('DB_PORT'),
                username: configService.get<string>('DB_USER'),
                password: configService.get<string>('DB_PASSWORD'),
                database: configService.get<string>('DB_NAME'),
                entities: [
                    __dirname + './../**/entities/*.entity{.ts,.js}',
                ],
                extra: {
                  charset: 'utf8mb4'
                },
                logging: true,
            });
            await dataSource.initialize();
            initializeTransactionalContext({ storageDriver: StorageDriver.ASYNC_LOCAL_STORAGE });
            return addTransactionalDataSource(dataSource);
        },
    },
];