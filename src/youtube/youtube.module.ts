import {Module} from '@nestjs/common';
import {YoutubeService} from './youtube.service';
import {YoutubeController} from './youtube.controller';
import {
    youtubeChannelLogProviders,
    youtubeUserChannelAuthorityProviders,
    youtubeUserChannelProviders,
    youtubeUserGroupProviders
} from "./youtube.provider";
import {DatabaseModule} from "../database/database.module";

@Module({
    imports: [DatabaseModule],
    controllers: [YoutubeController],
    providers: [YoutubeService, ...youtubeUserChannelProviders
        , ...youtubeUserGroupProviders
        , ...youtubeUserChannelAuthorityProviders
        , ...youtubeChannelLogProviders
    ],
    exports: [YoutubeService]
})
export class YoutubeModule {}
