import {PartialType} from "@nestjs/swagger";
import {CreateOrderAttachedFileDto} from "./create-order-attached-file.dto";
import {IsNotEmpty, IsNumber, IsOptional} from "class-validator";

export class UpdateOrderAttachedFileDto extends PartialType(CreateOrderAttachedFileDto){
    @IsOptional()
    @IsNumber()
    id: number;

    @IsOptional()
    deletedAt: Date | null;
}
