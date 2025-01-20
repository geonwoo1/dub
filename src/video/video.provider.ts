import {DataSource} from 'typeorm';
import {Video} from "./entities/video.entity";

export const videoProviders = [
    {
        provide: 'VIDEO_REPOSITORY',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(Video),
        inject: ['DATA_SOURCE'],
    },
];