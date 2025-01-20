import {IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested} from "class-validator";
import {CreateOrderDto} from "./create-order.dto";
import {Type} from "class-transformer";
import {CreateOrderAttachedFileDto} from "./create-order-attached-file.dto";

export class CreateOrderGroupDto {
    @IsOptional()
    @IsString()
    userId: number;

    @IsOptional()
    @IsString()
    title: string;

    @IsOptional()
    @IsInt()
    price: number;

    @IsOptional()
    @IsString()
    currency: string;

    @IsNotEmpty()
    @IsString()
    sourceLanguage: string;

    @IsNotEmpty()
    @IsString()
    targetLanguage: string;

    @IsOptional()
    @IsString()
    comment: string;

    @IsOptional()
    @IsString()
    numOfCharactersCode: string;

    @IsOptional()
    @IsString()
    numOfCharactersValue: string;

    @IsOptional()
    @IsString()
    hopeDateCommentCode: string

    @IsOptional()
    @IsString()
    hopeDateCommentValue: string

    @IsNotEmpty()
    @IsNumber()
    ownerUserId: number;

    @IsNotEmpty()
    @IsString()
    channelId: string;

    @IsNotEmpty()
    @IsString()
    channelName: string;

    @IsOptional()
    @IsDateString()
    dueDate: string;

    @ValidateNested({ each: true })
    @Type(() => CreateOrderDto)
    orders: CreateOrderDto[]

    @ValidateNested({ each: true })
    @Type(() => CreateOrderAttachedFileDto)
    orderAttachedFiles: CreateOrderAttachedFileDto[]
}
