import {Module} from '@nestjs/common';
import {UserService} from './user.service';
import {UserController} from './user.controller';
import {DatabaseModule} from "../database/database.module";
import {userProviders, userTokenProviders} from "./user.provider";
import {YoutubeModule} from "../youtube/youtube.module";

@Module({
  imports: [DatabaseModule, YoutubeModule],
  controllers: [UserController],
  providers: [UserService, ...userProviders, ...userTokenProviders],
  exports: [UserService]
})
export class UserModule {}