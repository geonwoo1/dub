import {IsNotEmpty, IsNumber, IsString} from "class-validator";

export class CreateYoutubeUserGroupDto {
    @IsNotEmpty()
    @IsNumber()
    ownerUserId: number;

    @IsNotEmpty()
    @IsNumber()
    subUserId: number;

    @IsNotEmpty()
    @IsString()
    privilege: string;
}
