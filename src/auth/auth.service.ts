import {BadRequestException, Injectable} from '@nestjs/common';
import {JwtService} from "@nestjs/jwt";
import {UserService} from "../user/user.service";
import {CreateUserDto} from "../user/dto/create-user.dto";
import {User} from "../user/entities/user.entity";
import {LoginUserDto} from "../user/dto/login-user.dto";
import * as bcrypt from 'bcrypt'
import {Payload} from "./interface/payload.interface";
import {ConfigService} from "@nestjs/config";
import {AUTH} from "../const/auth.const";
import {CreateUserTokenDto} from "../user/dto/create-user-token.dto";
import {Transactional} from "typeorm-transactional";
import {Profile} from 'passport-google-oauth20';
import {LoginUserInfo} from "./interface/login-info.interface";
import {RESPONSE} from "../const/response.const";
import {OAuth2Client, TokenPayload} from "google-auth-library";
import {YoutubeService} from "../youtube/youtube.service";
import {CreateYoutubeUserChannelDto} from "../youtube/dto/create-youtube-user-channel.dto";
import {convert} from "../common/util/date.util";
import {CreateYoutubeUserGroupDto} from "../youtube/dto/create-youtube-user-group.dto";
import {CreateYoutubeUserChannelAuthorityDto} from "../youtube/dto/create-youtube-user-channel-authority.dto";
import {YOUTUBE} from "../const/youtube.const";
import {SaveOptions} from "typeorm";

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private youtubeService: YoutubeService,
        private configService: ConfigService
    ) {}

    /**
     * @description 신규 유저 등록
     * @author jason.jang
     * @date 2024/06/26
     **/
    async registerUser(newUser: CreateUserDto): Promise<boolean> {
        const isNotExist = await this.isNotExistUserEmail(newUser.email);
        newUser.role = AUTH.ROLE.ADMIN;
        //true -> 미존재, false -> 존재
        if(!isNotExist)
            return false;
        //
        await this.userService.save(newUser);
        return true;
    }

    /**
     * @description 유저 검증
     * @author jason.jang
     * @date 2024/06/26
     **/
    @Transactional()
    async validateUser(loginUserDto: LoginUserDto): Promise<{ accessToken: string, refreshToken: string } | undefined> {
        const user: User = await this.userService.findByFields({
            where: {email: loginUserDto.email, loginType: AUTH.LOGIN_TYPE.PASSWORD}
        });
        //
        const isMatch = await this.isMatchPassword (user, loginUserDto)//패스워드 검증
        if (!isMatch) {
            throw new BadRequestException();
        }
        //
        return await this.login(user);
    }

    /**
     * @description 유저 비밀번호 검증
     * @author jason.jang
     * @date 2024/06/26
     **/
    async isMatchPassword(userFind: User, loginUserDto: LoginUserDto): Promise<boolean> {
        const validatePassword = await bcrypt.compare(loginUserDto.password, userFind.password);
        if (!userFind || !validatePassword) {
            return false;
        }
        return true;
    }

    /**
     * @description 유저 구글 검증
     * @author jason.jang
     * @date 2024/06/26
     **/
    async validateGoogleUser(profile: Profile): Promise<any> {
        const {name, emails } = profile;
        const email = emails[0].value;
        const users: User[] = await this.userService.findsByFields({
            where: {email: email}
        });

        //구글 타입 유저 존재하는지 찾기
        let googleTypeUser: User | CreateUserDto = users.find((user: User) => user.loginType === AUTH.LOGIN_TYPE.GOOGLE)
        const otherTypeUser: User | CreateUserDto = users.find((user: User) => user.loginType !== AUTH.LOGIN_TYPE.GOOGLE)

        const createUserDto: CreateUserDto = new CreateUserDto();
        createUserDto.username = name.givenName + name.familyName;
        createUserDto.email = email;
        createUserDto.loginType = AUTH.LOGIN_TYPE.GOOGLE;
        if (!googleTypeUser && !otherTypeUser) {
            googleTypeUser = await this.userService.save(createUserDto, {reload: true});
        }else if(otherTypeUser)
        {
            throw new BadRequestException({code: RESPONSE.AUTH.STATUS.USER_EMAIL_ALREADY_EXIST, message: "user's email already exists"});
        }

        return googleTypeUser;
    }

    /**
     * @description 로그인
     * @author jason.jang
     * @date 2024/06/26
     **/
    async login(findUser: User):  Promise<LoginUserInfo> {
        const payload: Payload = {id: findUser.id, email: findUser.email, username: findUser.username}// payload 등록(비밀번호 포함시키면 X)
        //
        await this.userService.updateLastLoginedAt(findUser);
        //
        const jwtTokens = this.createJwtTokens(payload);
        const createUserTokenDto: CreateUserTokenDto = new CreateUserTokenDto();
        createUserTokenDto.userId = findUser.id;
        createUserTokenDto.type = AUTH.TOKEN_TYPE.LOGIN;
        createUserTokenDto.accessToken = jwtTokens.accessToken;
        createUserTokenDto.refreshToken = jwtTokens.refreshToken;
        await this.userService.saveAuthJwtTokens(createUserTokenDto);
        //
        delete findUser.password;
        //
        return {
            accessToken: jwtTokens.accessToken,
            refreshToken: jwtTokens.refreshToken,
            userInfo: findUser
        }
    }

    /**
     * @description jwt 토큰 생성
     * @author jason.jang
     * @date 2024/07/02
    **/
    createJwtTokens(payload: Payload): {accessToken: string; refreshToken: string;} {
        return {
            accessToken: this.jwtService.sign(payload, {expiresIn: this.configService.get<string>('APP.JWT_ACCESS_EXPORESIN'),}),
            refreshToken: this.jwtService.sign(payload, {expiresIn: this.configService.get<string>('APP.JWT_REFRESH_EXPORESIN'),})
        }
    }

    /**
     * @description 유저 토큰 삭제
     * @author jason.jang
     * @date 2024/07/02
     **/
    async deleteUserTokens(user: User): Promise<void> {
        await this.userService.deleteUserTokens({userId: user.id, type: AUTH.TOKEN_TYPE.LOGIN});
        user.accessToken = null;
        user.refreshToken = null;
        await this.userService.refreshUserJwtToken(user);
    }

    /**
     * @description 토큰에 내포 된 유저정보 확인
     * @author jason.jang
     * @date 2024/06/28
    **/
    async validateUserJwtToken(payload: Payload): Promise<User | undefined> {
        return await this.userService.findByFields({
            where: {id: payload.id}
        })
    }

    /**
     * @description 유저 이메일 존재 여부 확인
     * @author jason.jang
     * @date 2024/07/02
    **/
    async isNotExistUserEmail(email: string): Promise<boolean> {
        const userFind: User = await this.userService.findByFields({
            where: {email: email}
        })
        if (userFind) {
            throw new BadRequestException({code: RESPONSE.AUTH.STATUS.USER_EMAIL_ALREADY_EXIST, message: "user's email already exists"});
        }
        return true;// 미존재
    }

    /**
     * @description 구글 토큰 검증
     * @author jason.jang
     * @date 2024/07/02
    **/
    @Transactional()
    async validateGoogleToken(token: string): Promise<User | null> {
        const client: OAuth2Client = this.getGoogleOAuthClient();
        const { tokens } = await client.getToken({code: token
            , client_id: this.configService.get<string>('GOOGLE_API_GOOGLE_CLIENT_ID')
            , redirect_uri: "postmessage"});
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: this.configService.get<string>('GOOGLE_API_GOOGLE_CLIENT_ID'),
        });
        const payload: TokenPayload = ticket.getPayload();
        const { sub, email, name, given_name, family_name, picture } = payload;
        // If the request specified a Google Workspace domain:
        // const domain = payload['hd'];
        //
        const users: User[] = await this.userService.findsByFields({
            where: {email: email}
        });

        //구글 타입 유저 존재하는지 찾기
        let googleTypeUser: User = users.find((user: User) => user.loginType === AUTH.LOGIN_TYPE.GOOGLE)
        const otherTypeUser: User = users.find((user: User) => user.loginType !== AUTH.LOGIN_TYPE.GOOGLE)

        if(otherTypeUser)
            throw new BadRequestException({code: RESPONSE.AUTH.STATUS.USER_EMAIL_ALREADY_EXIST, message: "user's email already exists"});

        const newUser: User = new User();
        newUser.username = name;
        newUser.email = email;
        newUser.loginType = AUTH.LOGIN_TYPE.GOOGLE;
        //
        if (googleTypeUser) {
            //createUserTokenDto.userId = googleTypeUser.id;
            //googleTypeUser = await this.userService.save(newUser, {reload: true});
        }else if (!googleTypeUser) {
            googleTypeUser = await this.userService.save(newUser, {reload: true});
        }
        //
        const createUserTokenDto: CreateUserTokenDto = new CreateUserTokenDto();
        createUserTokenDto.userId = googleTypeUser.id;
        createUserTokenDto.type = AUTH.TOKEN_TYPE.YOUTUBE;
        createUserTokenDto.tokenId = tokens.id_token;
        createUserTokenDto.accessToken = tokens.access_token;
        createUserTokenDto.refreshToken = tokens.refresh_token;
        createUserTokenDto.expiresIn = tokens.expiry_date.toString();
        createUserTokenDto.expiredAt = new Date(tokens.expiry_date);

        client.setCredentials({access_token: tokens.access_token});
        const {channelId, channelName, channelProfilePicture} = await this.youtubeService.getChannelInfo({client});
        if(!channelId)//채널이 없는 계정 로그인의 경우
            return googleTypeUser
        //
        createUserTokenDto.tokenId = channelId;
        await this.userService.saveYoutubeTokens(createUserTokenDto);
        const createYoutubeUserChannelDto: CreateYoutubeUserChannelDto = new CreateYoutubeUserChannelDto();
        createYoutubeUserChannelDto.ownerUserId = googleTypeUser.id;
        createYoutubeUserChannelDto.channelId = channelId;
        createYoutubeUserChannelDto.channelName = channelName;
        createYoutubeUserChannelDto.channelProfileUrl = channelProfilePicture;
        const savedYoutubeUserChannel = await this.youtubeService.saveYoutubeUserChannel(createYoutubeUserChannelDto);

        const createYoutubeUserGroup: CreateYoutubeUserGroupDto = new CreateYoutubeUserGroupDto()
        createYoutubeUserGroup.ownerUserId = googleTypeUser.id;
        createYoutubeUserGroup.subUserId = googleTypeUser.id;
        createYoutubeUserGroup.privilege = YOUTUBE.PRIVILEGE.OWNER;
        await this.youtubeService.saveYoutubeUserGroup(createYoutubeUserGroup);

        const createYoutubeUserChannelAuthorityDto: CreateYoutubeUserChannelAuthorityDto = new CreateYoutubeUserChannelAuthorityDto()
        createYoutubeUserChannelAuthorityDto.userId = googleTypeUser.id;
        createYoutubeUserChannelAuthorityDto.channelInnerId = savedYoutubeUserChannel.id;
        await this.youtubeService.saveYoutubeUserChannelAuthority(createYoutubeUserChannelAuthorityDto);

        return googleTypeUser;
    }

    /**
     * @description google OAuth Client
     * @author jason.jang
     * @date 2024/07/14
    **/
    getGoogleOAuthClient(): OAuth2Client {
        return new OAuth2Client({
            clientId: this.configService.get<string>('GOOGLE_API_GOOGLE_CLIENT_ID'),
            clientSecret: this.configService.get<string>('GOOGLE_API_GOOGLE_CLIENT_SECRET'),
            redirectUri: "postmessage"
        });
    }

    /**
     * @description 유저 jwt 토큰 refresh
     * @author jason.jang
     * @date 2024/06/28
     **/
    async refreshJwtToken(refreshToken: string): Promise<LoginUserInfo> {
        // Verify refresh token
        // JWT Refresh Token 검증 로직
        const decodedRefreshToken = this.jwtService.verify(refreshToken, { secret: this.configService.get<string>('APP.JWT_SECRET_KEY') }) as Payload;

        // Check if user exists
        const userId = decodedRefreshToken.id;
        const user = await this.userService.getUserIfRefreshTokenMatches(refreshToken, userId);
        if (!user) {
            throw new BadRequestException({code: RESPONSE.AUTH.STATUS.NOT_VALID, message: "refresh token is not valid"});
        }

        // Generate new access token
        return await this.login(user);
    }

    /**
     * @description 유저 save
     * @author jason.jang
     * @date 2024/08/01
    **/
    async saveUser(user: User, saveOptions: SaveOptions): Promise<User> {
        return await this.userService.save(user, saveOptions);
    }
}
