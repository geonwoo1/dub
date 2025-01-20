import {ExecutionContext, HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {AuthGuard as NestAuthGuard} from "@nestjs/passport";
import {Observable} from "rxjs";
import {RESPONSE} from "../../const/response.const";

@Injectable()
export class AuthGuard extends NestAuthGuard('jwt') {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        return super.canActivate(context);
    }

    /**
     * @description AuthGuard 예외 핸들러
     * @author jason.jang
     * @date 2024/07/03
    **/
    handleRequest(err, user, info: Error): any {
        if( user )
            return user;
        //토큰 시간 만료된 경우
        if (info?.name === 'TokenExpiredError') {
            throw new HttpException(
                {code: RESPONSE.AUTH.STATUS.UNAUTHORIZED, message: "token is expired"},
                HttpStatus.UNAUTHORIZED
            );
        }
        // 토큰의 형식이 잘못된 경우
        else if (info?.name === 'JsonWebTokenError')
            throw new HttpException(
                {code: RESPONSE.AUTH.STATUS.NOT_VALID, message: "token is not valid"},
                HttpStatus.BAD_REQUEST
            )
        //헤더에 토큰이 없는 경우
        else
            throw new HttpException(
                {code: RESPONSE.AUTH.STATUS.NOT_VALID, message: "token is not valid"},
                HttpStatus.NOT_FOUND
            )
    }
}