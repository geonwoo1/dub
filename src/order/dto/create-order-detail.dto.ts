import {IsNotEmpty, IsString} from "class-validator";

export class CreateOrderDetailDto {
    @IsNotEmpty()
    @IsString()
    sourceLanguage: string;

    @IsNotEmpty()
    @IsString()
    targetLanguage: string;
}
