import {IsOptional, IsString, ValidateNested} from "class-validator";
import {CreateOrderVideoDto} from "./create-order-video.dto";
import {Type} from "class-transformer";
import {CreateOrderDetailDto} from "./create-order-detail.dto";

export class CreateOrderDto {
    @IsOptional()
    @IsString()
    type: string;

    @IsOptional()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description: string;

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

    @ValidateNested({ each: true })
    @Type(() => CreateOrderVideoDto)
    video: CreateOrderVideoDto

    @ValidateNested({ each: true })
    @Type(() => CreateOrderDetailDto)
    orderDetails: CreateOrderDetailDto[]
}
