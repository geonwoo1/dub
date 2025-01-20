import {Module} from '@nestjs/common';
import {LanguageService} from './language.service';
import {languageProviders} from "./language.provider";
import {DatabaseModule} from "../database/database.module";

@Module({
    imports: [DatabaseModule,],
    providers: [LanguageService, ...languageProviders],
    exports: [LanguageService]
})
export class LanguageModule {
}
