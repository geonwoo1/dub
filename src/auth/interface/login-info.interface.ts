import {User} from "../../user/entities/user.entity";

export interface LoginUserInfo
{
    accessToken: string;
    refreshToken: string;
    userInfo: User;
}