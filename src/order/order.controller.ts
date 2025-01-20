import {
    BadRequestException,
    Body,
    Controller, DefaultValuePipe,
    Delete,
    Get,
    Param, ParseIntPipe,
    Post,
    Put,
    Query,
    Req,
    Res,
    UseGuards
} from '@nestjs/common';
import {OrderService} from './order.service';
import {CreateOrderGroupDto} from "./dto/create-order-group.dto";
import {Request, Response} from 'express';
import {RESPONSE} from "../const/response.const";
import {AuthGuard} from "../auth/security/auth.guard";
import {User} from "../user/entities/user.entity";
import {ORDER} from "../const/order.const";
import {OrderGroup} from "./entities/order-group.entity";
import {UpdateOrderGroupDto} from "./dto/update-order-group.dto";
import {OrderFilter} from "./interface/order-filter.interface";
import {AUTH} from "../const/auth.const";
import {Transactional} from "typeorm-transactional";
import {UpdateBackofficeOrderDto} from "./dto/update-backoffice-order.dto";
import {UpdateOrderDetailDto} from "./dto/update-order-detail.dto";
import {YoutubeService} from "../youtube/youtube.service";
import {IPaginationData, IPaginationOptions} from "../interface/pagination.interface";

@Controller()
export class OrderController {
    constructor(private readonly orderService: OrderService,
                private readonly youtubeService: YoutubeService) {
    }

    //주문그룹 리스트(Back-Office 도 사용)
    @Get('/order-groups')
    @UseGuards(AuthGuard)
    async getOrderGroups(@Query('channelName') channelName: string,
                         @Query('title') title: string,
                         @Query('channelId') channelId: string,
                         @Query('status') status: string,
                         @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
                         @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
                         @Req() req: Request, @Res() res: Response) {
        const user: User = req.user as User;
        if(user.role === AUTH.ROLE.USER)
        {
            if(!channelId)
                throw new BadRequestException({code: RESPONSE.APP.STATUS.FAILED, message: "channel id is required"});
            else{
                const isExistChannelUser = await this.youtubeService.isExistChannelIdAuthorityForUser(user.id, channelId);
                if(!isExistChannelUser)
                    throw new BadRequestException({code: RESPONSE.APP.STATUS.FAILED, message: "you have not channel authority about this channel id"});
            }
        }
        //
        const paginationOptions: IPaginationOptions = {page: page, limit: limit,};
        const filter: OrderFilter = {channelName: channelName, title: title, channelId: channelId, status: status};
        return res.json({
            code: RESPONSE.APP.STATUS.SUCCESS,
            message: 'success',
            body: await this.orderService.getOrderGroups(filter, paginationOptions)
        });
    }

    //주문그룹 조회(연결 데이터 전부)(Back-Office 도 사용)
    @Get('/order-groups/:orderGroupId/detail')
    @UseGuards(AuthGuard)
    async getOrderGroupDetail(@Param('orderGroupId') orderGroupId: number, @Req() req: Request, @Res() res: Response) {
        const user: User = req.user as User;
        const orderGroupDetail: OrderGroup = await this.orderService.getOrderGroupDetail(orderGroupId);
        if(orderGroupDetail?.userId !== user.id && AUTH.ROLE.USER === user.role)
            throw new BadRequestException({code: RESPONSE.AUTH.STATUS.WRONG_USER, message: "user is wrong"});
        //
        return res.json({
            code: RESPONSE.APP.STATUS.SUCCESS,
            message: 'success',
            body: orderGroupDetail
        });
    }

    //주문그룹 생성
    @Post('/order-groups')
    @UseGuards(AuthGuard)
    async createOrderGroups(@Body() createOrderGroupDto: CreateOrderGroupDto, @Req() req: Request, @Res() res: Response) {
        const user = req.user as User;
        createOrderGroupDto.userId = user.id;
        //
        const createOrderGroup = await this.orderService.createOrderGroups(createOrderGroupDto);
        //this.orderService.sendCreateOrder(user, language);
        //
        return res.json({
            code: RESPONSE.APP.STATUS.SUCCESS,
            message: 'success',
            body: createOrderGroup
        });
    }

    //주문그룹 상세 수정
    @Put('/order-groups')
    @UseGuards(AuthGuard)
    async updateOrderGroup(@Body() updateOrderGroupDto: UpdateOrderGroupDto, @Req() req: Request, @Res() res: Response) {
        const findOrderGroup = await this.orderService.findOrderGroupByFields({where: {id: updateOrderGroupDto.id}});
        if(findOrderGroup.status !== ORDER.STATUS.ORDERED)
            throw new BadRequestException({code: RESPONSE.ORDER.STATUS.UNCHANGEABLE, message: "It is impossible status to change"});
        return res.json({
            code: RESPONSE.APP.STATUS.SUCCESS,
            message: 'success',
            body: await this.orderService.updateOrderGroup(updateOrderGroupDto)
        });
    }

    //주문 삭제 -> 비디오 삭제 + s3 object 삭제(Back-Office 도 사용) -> canceled
    @Delete('/orders/:orderId/status/:status')
    @UseGuards(AuthGuard)
    async deleteOrder(@Param('orderId') orderId: number, @Param('status') status: string, @Req() req: Request, @Res() res: Response) {
        await this.orderService.deleteOrder(orderId, status);
        return res.send({code: RESPONSE.APP.STATUS.SUCCESS
            , message: 'success'
        });
    }

    //업로드 된 제품 파일 삭제 -> 제품 삭제 + s3 object 삭제(Back-Office 도 사용)
    @Delete('/order-details/:orderDetailId/products')
    @UseGuards(AuthGuard)
    async deleteUploadedProduct(@Param('orderDetailId') orderDetailId: number,
                                @Body() updateOrderDetailDto: UpdateOrderDetailDto,
                                @Req() req: Request, @Res() res: Response) {
        const user: User = req.user as User;
        if(user.role === AUTH.ROLE.USER)
        {
            throw new BadRequestException({code: RESPONSE.APP.STATUS.FAILED, message: "you have not authority"});
        }
        updateOrderDetailDto.id = orderDetailId;
        await this.orderService.deleteUploadedProduct(updateOrderDetailDto);
        return res.send({code: RESPONSE.APP.STATUS.SUCCESS
            , message: 'success'
        });
    }

    //주문 등장 인물 수 설정값 호출
    @Get('/orders/configs/number-of-characters')
    @UseGuards(AuthGuard)
    async getNumberOfCharactersOrderConfigs() {
        const whereOptions: any = {
            order: {priority: 'ASC'},
            where: {
                type: ORDER.CONFIG.NUMBER_OF_CHARACTERS,
                hidden: 0,
            },
        }
        return await this.orderService.getOrderConfigsByFields(whereOptions);
    }

    //주문 납기 희망일 설정값 호출
    @Get('/orders/configs/hope-date-comments')
    @UseGuards(AuthGuard)
    async getHopeDateCommentsOrderConfigs() {
        const whereOptions: any = {
            order: {priority: 'ASC'},
            where: {
                type: ORDER.CONFIG.HOPE_DATE_COMMENTS,
                hidden: 0,
            },
        }
        return await this.orderService.getOrderConfigsByFields(whereOptions);
    }

    //주문 시 source 언어 리스트
    @Get('/orders/configs/source-languages')
    @UseGuards(AuthGuard)
    async getSourceLanguagesOrderConfigs() {
        return await this.orderService.getOrderLanguages();
    }

    //주문 시 target 언어 리스트
    @Get('/orders/configs/target-languages')
    @UseGuards(AuthGuard)
    async getTargetLanguagesOrderConfigs() {
        return await this.orderService.getOrderLanguages();
    }

    /**
     * @description 주문 첨부파일 업로드 할 s3 presigned url 제공
     * @author jason.jang
     * @date 2024/06/28
     **/
    @Get('/attached-files/s3/upload-presigned-urls')
    @UseGuards(AuthGuard)
    async getUploadAttachedFilePreSignedUrls (@Query('count') count: number, @Res() res: Response) {
        const uploadPreSignedUrlInfo: IUploadPreSignedUrlInfo = {count: 0, preSignedInfos: [{}]};
        //
        if(!(typeof count === 'number') || isNaN(count)) {
            uploadPreSignedUrlInfo.count = 1;
        }else
            uploadPreSignedUrlInfo.count = count;
        //
        uploadPreSignedUrlInfo.preSignedInfos = await this.orderService.getUploadAttachedFilePreSignedUrls(uploadPreSignedUrlInfo.count);
        uploadPreSignedUrlInfo.count = uploadPreSignedUrlInfo.preSignedInfos.length;
        //
        return res.send({code: RESPONSE.APP.STATUS.SUCCESS, message: 'success', body: uploadPreSignedUrlInfo});
    }

    /**
     * @description 주문 영상 썸네일 업로드 할 s3 presigned url 제공
     * @author jason.jang
     * @date 2024/07/23
     **/
    @Get('/thumbnail-urls/s3/upload-presigned-urls')
    @UseGuards(AuthGuard)
    async getUploadThumbnailUrlPreSignedUrls (@Query('count') count: number, @Res() res: Response) {
        const uploadPreSignedUrlInfo: IUploadPreSignedUrlInfo = {count: 0, preSignedInfos: [{}]};
        //
        if(!(typeof count === 'number') || isNaN(count)) {
            uploadPreSignedUrlInfo.count = 1;
        }else
            uploadPreSignedUrlInfo.count = count;
        //
        uploadPreSignedUrlInfo.preSignedInfos = await this.orderService.getUploadThumbnailUrlPreSignedUrls(uploadPreSignedUrlInfo.count);
        uploadPreSignedUrlInfo.count = uploadPreSignedUrlInfo.preSignedInfos.length;
        //
        return res.send({code: RESPONSE.APP.STATUS.SUCCESS, message: 'success', body: uploadPreSignedUrlInfo});
    }

    /**
     * @description 주문 납품 파일 업로드 할 s3 presigned url 제공
     * @author jason.jang
     * @date 2024/07/21
     **/
    @Get('/order-details/s3/products/upload-presigned-urls')
    @UseGuards(AuthGuard)
    async getUploadProductPreSignedUrls (@Res() res: Response) {
        return res.send({code: RESPONSE.APP.STATUS.SUCCESS, message: 'success'
                            , body: await this.orderService.getUploadProductPreSignedUrls()});
    }

    //order detail 복수 데이터 수정(ex.영상의 target 언어)(Back-Office 도 사용)
    @Put('/order-details')
    @UseGuards(AuthGuard)
    async updateOrderDetails(@Body() updateBackofficeOrdersDto: UpdateBackofficeOrderDto[]
                            , @Req() req: Request, @Res() res: Response) {
        const orderGroupId = await this.orderService.updateOrderDetails(updateBackofficeOrdersDto);
        this.orderService.sendModifiedOrder(orderGroupId);
        return res.json({
            code: RESPONSE.APP.STATUS.SUCCESS,
            message: 'success'
        });
    }

    //주문체크 상태변경(Back-Office 도 사용)
    @Put('/order-groups/:orderGroupId/orders/status/checked')
    @UseGuards(AuthGuard)
    @Transactional()
    async updateCheckedStatusOrderGroupWithOrders(@Param('orderGroupId') orderGroupId: number
                                                , @Req() req: Request, @Res() res: Response) {
        const updateValues = {status: ORDER.STATUS.CHECKED}
        await this.orderService.updateOrderGroupStatus({orderGroupId: orderGroupId, updateValues: updateValues});
        await this.orderService.updateOrderStatus({orderGroupId: orderGroupId, updateValues: updateValues});
        return res.json({
            code: RESPONSE.APP.STATUS.SUCCESS,
            message: 'success',
        });
    }

    //주문승인 상태변경(Back-Office 도 사용)
    @Put('/order-groups/:orderGroupId/orders/status/in-progress')
    @UseGuards(AuthGuard)
    async updateInProgressStatusOrderGroupWithOrders(@Param('orderGroupId') orderGroupId: number
        , @Req() req: Request, @Res() res: Response) {
        const updateValues = {status: ORDER.STATUS.IN_PROGRESS, startedAt: new Date()};
        await this.orderService.updateInProgressStatusOrderGroupWithOrders({orderGroupId, updateValues});
        this.orderService.sendApproveOrder(orderGroupId);
        return res.json({
            code: RESPONSE.APP.STATUS.SUCCESS,
            message: 'success',
        });
    }

    //주문 첨부파일 다운로드 할 s3 presigned url 제공(Back-Office 도 사용)
    @Post('/order-groups/attached-files/s3/download-presigned-urls')
    @UseGuards(AuthGuard)
    async getDownloadAttachedFilesPreSignedUrls (@Body('s3Keys') s3Keys: [{name: string; s3Key: string}], @Req() req: Request, @Res() res: Response) {
        return res.send({code: RESPONSE.APP.STATUS.SUCCESS
            , message: 'success'
            , body: await this.orderService.getDownloadPreSignedUrls(s3Keys)});
    }

    //주문 완료 제품 다운로드 할 s3 presigned url 제공
    @Post('/orders/products/s3/download-presigned-urls')
    @UseGuards(AuthGuard)
    async getDownloadOrderProductsPreSignedUrls (@Body('s3Keys') s3Keys: [{name: string; s3Key: string}], @Req() req: Request, @Res() res: Response) {
        return res.send({code: RESPONSE.APP.STATUS.SUCCESS
            , message: 'success'
            , body: await this.orderService.getDownloadPreSignedUrls(s3Keys)});
    }

    //주문거절 상태변경(Back-Office 도 사용)
    @Put('/order-groups/:orderGroupId/orders/status/reject')
    @UseGuards(AuthGuard)
    async updateRejectStatusOrderGroupWithOrders(@Param('orderGroupId') orderGroupId: number, @Body('rejectReason') rejectReason: string
                                                , @Req() req: Request, @Res() res: Response) {
        const updateValues = {canceledAt: new Date(), status: ORDER.STATUS.REJECT}
        const findOrders = await this.orderService.updateRejectStatusOrderGroupWithOrders({orderGroupId: orderGroupId, updateValues: updateValues, rejectReason: rejectReason})
        this.orderService.deleteOrderVideos(findOrders);//비동기로 삭제 진행
        this.orderService.sendRejectOrder(orderGroupId);
        //
        return res.json({
            code: RESPONSE.APP.STATUS.SUCCESS,
            message: 'success',
            body: await this.orderService.getOrderGroupDetail(orderGroupId)
        });
    }

    //전체 주문취소 상태변경(Back-Office 도 사용)
    @Put('/order-groups/:orderGroupId/orders/status/canceled')
    @UseGuards(AuthGuard)
    @Transactional()
    async updateCanceledStatusOrderGroupWithOrders(@Param('orderGroupId') orderGroupId: number
        , @Req() req: Request, @Res() res: Response) {
        const findCheckedOrderGroup = await this.orderService.findOrderGroupByFields({where:{id: orderGroupId, status: ORDER.STATUS.CHECKED}});
        if(findCheckedOrderGroup)//order가 이미 checked 상태가 되었을 때 client 취소 불가
            return res.json({code: RESPONSE.ORDER.STATUS.ALREADY_CHECKED, message: 'order is already checked status'});
        //
        const updateValues = {canceledAt: new Date(), status: ORDER.STATUS.CANCELED}
        await this.orderService.updateOrderGroupStatus({orderGroupId: orderGroupId, updateValues: updateValues});
        await this.orderService.updateOrderStatus({orderGroupId: orderGroupId, updateValues: updateValues});
        const findOrders = await this.orderService.updateOrderDetailStatus({orderGroupId: orderGroupId, updateValues: updateValues});
        this.orderService.deleteOrderVideos(findOrders);//비동기로 삭제 진행
        //
        return res.json({
            code: RESPONSE.APP.STATUS.SUCCESS,
            message: 'success',
            body: await this.orderService.getOrderGroupDetail(orderGroupId)
        });
    }

    //order detail 완료 상태 변경 -> 구조적으로 order details > orders > order groups 찾아서 status 변경(Back-Office 도 사용)
    @Put('/order-groups/:orderGroupId/orders/:orderId/details/:orderDetailId/status/complete')
    @UseGuards(AuthGuard)
    async updateOrderDetailStatusComplete(@Param('orderGroupId') orderGroupId: number,
                            @Param('orderId') orderId: number,
                            @Param('orderDetailId') orderDetailId: number,
                            @Req() req: Request, @Res() res: Response) {
        const completeOrderDetail = await this.orderService.updateOrderDetailStatusComplete({orderGroupId: orderGroupId, orderId: orderId, orderDetailId: orderDetailId});
        this.orderService.sendCompleteOrder(orderGroupId);
        return res.json({
            code: RESPONSE.APP.STATUS.SUCCESS,
            message: 'success',
            body: completeOrderDetail
        });
    }

    //주문 디테일 변경(Back-Office 도 사용)
    @Put('/order-details/:orderDetailId')
    @UseGuards(AuthGuard)
    @Transactional()
    async updateOrderDetail(@Param('orderDetailId') orderDetailId: number, @Body() updateOrderDetailDto: UpdateOrderDetailDto
        , @Req() req: Request, @Res() res: Response) {
        await this.orderService.updateOrderDetail(updateOrderDetailDto);
        return res.json({
            code: RESPONSE.APP.STATUS.SUCCESS,
            message: 'success',
            body: ""
        });
    }

    //주문그룹 조회(연결 데이터 전부)(Back-Office 도 사용)
    @Get('/order-groups/:orderGroupId')
    @UseGuards(AuthGuard)
    async getOrderGroup(@Param('orderGroupId') orderGroupId: number, @Req() req: Request, @Res() res: Response) {
        const findOrderGroup: OrderGroup | null = await this.orderService.findOrderGroupByFields({where: {id: orderGroupId}})
        if(!findOrderGroup)
            throw new BadRequestException({code: RESPONSE.ORDER.STATUS.BAD_REQUEST, message: "order group id is wrong"});
        //
        return res.json({
            code: RESPONSE.APP.STATUS.SUCCESS,
            message: 'success',
            body: findOrderGroup
        });
    }

    @Get('/mail-test')
    @UseGuards(AuthGuard)
    async sendMailTest(@Body() {data}, @Req() req: Request, @Res() res: Response) {
        const user: User = req.user as User;
        user.email = "jason.jang@iyuno.com";
        //console.log(data.normalize('NFC') == "남도형");
        this.orderService.sendCreateOrder(user as User, user.contentLanguage);
        //
        return res.json({
            code: RESPONSE.APP.STATUS.SUCCESS,
            message: 'success',
            body: ""
        });
    }
}
