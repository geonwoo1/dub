import {DataSource} from 'typeorm';
import {YoutubeUserChannel} from "./entities/youtube-user-channel.entity";
import {YoutubeUserGroup} from "./entities/youtube-user-group.entity";
import {YoutubeUserChannelAuthority} from "./entities/youtube-user-channel-authority.entity";
import {YoutubeChannelLog} from "./entities/youtube-channel-log.entity";

export const youtubeUserChannelProviders = [
    {
        provide: 'YOUTUBE_USER_CHANNEL_REPOSITORY',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(YoutubeUserChannel),
        inject: ['DATA_SOURCE'],
    },
];

export const youtubeUserGroupProviders = [
    {
        provide: 'YOUTUBE_USER_GROUP_REPOSITORY',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(YoutubeUserGroup),
        inject: ['DATA_SOURCE'],
    },
];

export const youtubeUserChannelAuthorityProviders = [
    {
        provide: 'YOUTUBE_USER_CHANNEL_AUTHORITY_REPOSITORY',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(YoutubeUserChannelAuthority),
        inject: ['DATA_SOURCE'],
    },
];

export const youtubeChannelLogProviders = [
    {
        provide: 'YOUTUBE_CHANNEL_LOG_REPOSITORY',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(YoutubeChannelLog),
        inject: ['DATA_SOURCE'],
    },
];