import {Inject, Injectable} from '@nestjs/common';
import {UpdateLanguageDto} from './dto/update-language.dto';
import {Repository} from "typeorm";
import {Language} from "./entities/language.entity";

@Injectable()
export class LanguageService {
    constructor(
        @Inject('LANGUAGE_REPOSITORY') private languageRepository: Repository<Language>,
    ) {}

    /**
     * @description 언어리스트 가져오기
     * @author jason.jang
     * @date 2024/07/08
    **/
    async getOrderLanguages() {
        return await this.languageRepository.find({where: {hidden: 0}})
    }

    findAll() {
        return `This action returns all language`;
    }

    findOne(id: number) {
        return `This action returns a #${id} language`;
    }

    update(id: number, updateLanguageDto: UpdateLanguageDto) {
        return `This action updates a #${id} language`;
    }

    remove(id: number) {
        return `This action removes a #${id} language`;
    }
}
