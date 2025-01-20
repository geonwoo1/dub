import {IsNotEmpty, IsNumber, IsOptional} from "class-validator";

export class UpdateOrderVideoDto {
    @IsNotEmpty()
    @IsNumber()
    id: number;

    @IsOptional()
    deletedAt: Date | null;
}
