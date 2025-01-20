import {IsNotEmpty, IsNumber} from "class-validator";

export class CreateYoutubeUserChannelAuthorityDto {
    @IsNotEmpty()
    @IsNumber()
    userId: number;

    @IsNotEmpty()
    @IsNumber()
    channelInnerId: number;
}
