import {IsNotEmpty, IsNumber, IsString} from "class-validator";

export class CreateYoutubeUserChannelDto {
    @IsNotEmpty()
    @IsNumber()
    ownerUserId: number;

    @IsNotEmpty()
    @IsString()
    channelId: string;

    @IsString()
    channelName: string;

    @IsString()
    channelProfileUrl: string;
}
