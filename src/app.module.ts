import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {UserModule} from './user/user.module';
import {OrderModule} from './order/order.module';
import {DatabaseModule} from 'src/database/database.module'
import {ConfigModule} from "@nestjs/config";
import {AuthModule} from "./auth/auth.module";
import {LoggerMiddleware} from "./middlewares/logger.middleware";
import {VideoModule} from './video/video.module';
import {JwtStrategy} from "./auth/security/passport.jwt.strategy";
import { LanguageModule } from './language/language.module';
import { YoutubeModule } from './youtube/youtube.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [DatabaseModule
      , UserModule
      , OrderModule
      , AuthModule
      , ConfigModule.forRoot({cache: true, isGlobal: true, envFilePath: `.env.${process.env.NODE_ENV}`,})
      , VideoModule, LanguageModule, YoutubeModule, MailModule
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): any {
        consumer.apply(LoggerMiddleware).forRoutes('*');
    }
}
