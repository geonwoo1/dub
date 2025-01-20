import {OmitType} from "@nestjs/swagger";
import {CreateOrderDto} from "./create-order.dto";
import {IsNotEmpty, IsNumber, IsOptional, ValidateNested} from "class-validator";
import {Type} from "class-transformer";
import {UpdateOrderVideoDto} from "./update-order-video.dto";
import {CreateOrderDetailDto} from "./create-order-detail.dto";

export class UpdateClientOrderDto extends OmitType(CreateOrderDto, ['type', 'video', 'orderDetails']) {
    @IsNotEmpty()
    @IsNumber()
    id: number;

    @ValidateNested({ each: true })
    @Type(() => UpdateOrderVideoDto)
    video: UpdateOrderVideoDto

    @ValidateNested({ each: true })
    @Type(() => CreateOrderDetailDto)
    orderDetails: CreateOrderDetailDto[]

    @IsOptional()
    deletedAt: Date | null;
}
