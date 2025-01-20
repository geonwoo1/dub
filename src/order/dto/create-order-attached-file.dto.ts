import {IsNotEmpty, IsOptional, IsString} from "class-validator";

export class CreateOrderAttachedFileDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    s3Key: string;

    @IsString()
    size: string;

    @IsString()
    type: string;
}
