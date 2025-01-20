import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ValidationPipe} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import * as cookieParser from 'cookie-parser';
import { initializeTransactionalContext } from 'typeorm-transactional';

async function bootstrap() {
    initializeTransactionalContext();
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,//DTO에 정의되지 않은 속성이 들어오면 자동으로 제거합니다. 예를 들어, @Body()를 사용하여 전송된 필드가 DTO에 정의된 필드와 일치하지 않을 경우, DTO에서 정의되지 않은 필드는 무시됩니다.
        transform: true,//DTO에 정의된 필드 유형이 일치하지 않는 경우 자동으로 타입 변환을 수행합니다. 예를 들어, 전송된 문자열을 숫자로 변환하거나, 전송된 배열을 객체로 변환할 수 있습니다.
        transformOptions: {
            enableImplicitConversion: true,//이 설정이 활성화되면 문자열에서 숫자, 불리언 또는 배열로의 암시적 변환이 가능해집니다. 예를 들어, 문자열 "10"은 number 타입으로 자동 변환됩니다.
        }
    }));
    //
    const configService = app.get(ConfigService);
    const corsUrls: string[] = (configService.get<string>('FRONTEND.APP.CORS_ALLOW_URL')).split(',').map(url => `https://${url}`);
    app.enableCors({
        origin: corsUrls,
        credentials: true,
        exposedHeaders: ['Authorization'], // * 사용할 헤더 추가.
    });
    app.use(cookieParser());
    const port = configService.get<number>('APP.PORT');
    await app.listen(port);
}

bootstrap();
