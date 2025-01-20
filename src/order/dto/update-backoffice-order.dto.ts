import {OmitType} from "@nestjs/swagger";
import {CreateOrderDto} from "./create-order.dto";
import {IsBoolean, IsNotEmpty, IsNumber, IsOptional, ValidateNested} from "class-validator";
import {Type} from "class-transformer";
import {UpdateOrderDetailDto} from "./update-order-detail.dto";

export class UpdateBackofficeOrderDto extends OmitType(CreateOrderDto, ['type', 'video', 'orderDetails']) {
    @IsNotEmpty()
    @IsNumber()
    id: number;

    @IsOptional()
    @IsBoolean()
    isSendMail: boolean

    @ValidateNested({ each: true })
    @Type(() => UpdateOrderDetailDto)
    orderDetails: UpdateOrderDetailDto[]

    @IsOptional()
    deletedAt: Date | null;
}
