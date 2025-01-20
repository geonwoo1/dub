import {OmitType} from "@nestjs/swagger";
import {CreateOrderGroupDto} from "./create-order-group.dto";
import {IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested} from "class-validator";
import {Type} from "class-transformer";
import {UpdateClientOrderDto} from "./update-client-order.dto";
import {UpdateOrderAttachedFileDto} from "./update-order-attached-file.dto";

export class UpdateOrderGroupDto extends OmitType(CreateOrderGroupDto, ['userId', 'orders', 'orderAttachedFiles']) {
    @IsNotEmpty()
    @IsNumber()
    id: number;

    @IsOptional()
    @IsString()
    rejectReason: string;

    @ValidateNested({ each: true })
    @Type(() => UpdateClientOrderDto)
    orders: UpdateClientOrderDto[]

    @ValidateNested({ each: true })
    @Type(() => UpdateOrderAttachedFileDto)
    orderAttachedFiles: UpdateOrderAttachedFileDto[]
}
