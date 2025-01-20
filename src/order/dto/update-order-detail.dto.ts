import {PartialType} from "@nestjs/swagger";
import {CreateOrderDetailDto} from "./create-order-detail.dto";
import {IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";

export class UpdateOrderDetailDto extends PartialType(CreateOrderDetailDto){
    @IsOptional()
    @IsNumber()
    id: number;

    @IsOptional()
    @IsString()
    status: string;

    @IsOptional()
    @IsString()
    dubS3Key: string;

    @IsOptional()
    @IsString()
    dubName: string;

    @IsOptional()
    @IsString()
    dubSize: string;

    @IsOptional()
    @IsString()
    audioS3Key: string;

    @IsOptional()
    @IsString()
    audioName: string;

    @IsOptional()
    @IsString()
    audioSize: string;

    @IsOptional()
    @IsString()
    subS3Key: string;

    @IsOptional()
    @IsString()
    subName: string;

    @IsOptional()
    @IsString()
    subSize: string;

    @IsOptional()
    uploadAt: Date | null;

    @IsOptional()
    @IsString()
    titleGuide: string;

    @IsOptional()
    @IsString()
    descriptionGuide: string;

    @IsOptional()
    @IsString()
    hashTagGuide: string;

    @IsOptional()
    dueDate: Date | null;

    @IsOptional()
    completedAt: Date | null;

    @IsOptional()
    deletedAt: Date | null;
}
