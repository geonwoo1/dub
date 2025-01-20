import {Inject, Injectable} from '@nestjs/common';
import {CreateOrderGroupDto} from "./dto/create-order-group.dto";
import {Brackets, FindOneOptions, Repository, SelectQueryBuilder} from "typeorm";
import {OrderGroup} from "./entities/order-group.entity";
import {Order} from "./entities/order.entity";
import {Video} from "../video/entities/video.entity";
import {OrderConfig} from "./entities/order-config.entity";
import {FindManyOptions} from "typeorm/find-options/FindManyOptions";
import {LanguageService} from "../language/language.service";
import {Language} from "../language/entities/language.entity";
import {OrderDetail} from "./entities/order-detail.entity";
import {S3Service} from "../s3/s3.service";
import {ConfigService} from "@nestjs/config";
import {OrderAttachedFile} from "./entities/order-attached-file.entity";
import {ORDER} from "../const/order.const";
import {UpdateOrderGroupDto} from "./dto/update-order-group.dto";
import {Transactional} from "typeorm-transactional";
import {OrderLanguageInfo} from "./entities/order-language-info.entity";
import {OrderFilter} from "./interface/order-filter.interface";
import {VideoService} from "../video/video.service";
import {UpdateBackofficeOrderDto} from "./dto/update-backoffice-order.dto";
import {validator} from "../common/util/date.util";
import {UpdateOrderDetailDto} from "./dto/update-order-detail.dto";
import {ObjectIdentifier} from "@aws-sdk/client-s3/dist-types/models/models_0";
import {User} from "../user/entities/user.entity";
import {MailService} from "../mail/mail.service";
import {IMailData} from "../mail/interface/mail-template.interface";
import {IPaginationData, IPaginationOptions} from "../interface/pagination.interface";
import {Pagination} from "../common/pagination/paginate";

@Injectable()
export class OrderService {
    constructor(
        @Inject('ORDER_GROUP_REPOSITORY') private orderGroupRepository: Repository<OrderGroup>,
        @Inject('ORDER_REPOSITORY') private orderRepository: Repository<Order>,
        @Inject('VIDEO_REPOSITORY') private videoRepository: Repository<Video>,
        @Inject('ORDER_DETAIL_REPOSITORY') private orderDetailRepository: Repository<OrderDetail>,
        @Inject('ORDER_ATTACHED_FILE_REPOSITORY') private orderAttachedFileRepository: Repository<OrderAttachedFile>,
        @Inject('ORDER_CONFIG_REPOSITORY') private orderConfigRepository: Repository<OrderConfig>,
        @Inject('ORDER_LANGUAGE_INFO_REPOSITORY') private orderLanguageInfoRepository: Repository<OrderLanguageInfo>,
        private readonly languageService: LanguageService,
        private readonly videoService: VideoService,
        private readonly s3Service: S3Service,
        private readonly configService: ConfigService,
        private readonly mailService: MailService,
    ) {}

    /**
     * @description 단일 찾기
     * @author jason.jang
     * @date 2024/07/18
     **/
    async findOrderGroupByFields(options: FindOneOptions<OrderGroup>): Promise<OrderGroup | null> {
        return await this.orderGroupRepository.findOne(options);
    }

    /**
     * @description 주문그룹 리스트 조회(Back-Office 도 사용)
     * @author jason.jang
     * @date 2024/07/12
    **/
    async getOrderGroups(filter: OrderFilter, paginationOptions: IPaginationOptions): Promise<IPaginationData> {
        const orderGroupsPagination = new Pagination<OrderGroup>(this.getOrderGroupsQueryBuilder(filter), paginationOptions);
        return await orderGroupsPagination.paginateNestedOrderBy({mainEntity: 'og', orderBy: {'og.id': 'DESC', 'o.title': 'ASC', 'sli.fullname': 'ASC', 'tli.fullname': 'ASC',}});
    }

    getOrderGroupsQueryBuilder(filter: OrderFilter/*, paginationOptions: IPaginationOptions*/): SelectQueryBuilder<OrderGroup> {
        const orderGroupsQueryBuilder: SelectQueryBuilder<OrderGroup> = this.orderGroupRepository
            .createQueryBuilder('og')
            .leftJoinAndSelect('og.orders', 'o')
            .leftJoinAndSelect('o.video', 'v')
            .leftJoinAndSelect('o.orderDetails', 'od')
            .leftJoinAndSelect('od.orderLanguageInfos', 'oli')
            .leftJoinAndSelect('oli.sourceLanguageInfo', 'sli')
            .leftJoinAndSelect('oli.targetLanguageInfo', 'tli')
            .select([
                'og.id'
                , 'og.title'
                , 'og.currency'
                , 'og.userId'
                , 'og.comment'
                , 'og.ownerUserId'
                , 'og.channelId'
                , 'og.channelName'
                , 'og.orderedAt'
                , 'og.status'
                , 'o.id'
                , 'o.title'
                , 'o.completedAt'
                , 'o.canceledAt'
                , 'o.status'
                , 'v.id'
                , 'v.name'
                , 'v.thumbnailS3Key'
                , 'v.duration'
                , 'od.id'
                , 'od.sourceLanguage'
                , 'od.targetLanguage'
                , 'od.dubS3Key'
                , 'od.dubName'
                , 'od.audioS3Key'
                , 'od.audioName'
                , 'od.subS3Key'
                , 'od.subName'
                , 'od.titleGuide'
                , 'od.descriptionGuide'
                , 'od.hashTagGuide'
                , 'od.dueDate'
                , 'od.status'
                , 'oli.orderDetailId'
                , 'oli.sourceLanguage'
                , 'oli.targetLanguage'
                , 'sli.fullname'
                , 'tli.fullname'
            ])
            .where('og.hidden = :ogHidden', {ogHidden: 0})
            .andWhere(
                new Brackets((qb) => {
                    qb.where('o.hidden = :oHidden or o.hidden is null', {oHidden: 0})
                }))
            .andWhere(
                new Brackets((qb) => {
                    qb.where('v.hidden = :vHidden or v.hidden is null', {vHidden: 0})
                }))
            .andWhere(
                new Brackets((qb) => {
                    qb.where('od.hidden = :odHidden or od.hidden is null', {odHidden: 0})
                }));

        //주문자 필터 검색 Delimiter -> ','
        if(filter.channelName){
            const channelNameArray = filter.channelName.split('<;>');
            orderGroupsQueryBuilder.andWhere('og.channelName in (:channelNameArray)', {channelNameArray: channelNameArray});
        }

        //title 필터 검색
        if(filter.title){
            orderGroupsQueryBuilder.andWhere(
                new Brackets((qb) => {
                    qb.where('v.name like :videoName', {videoName: `%${filter.title}%`})
                        .orWhere('og.channelName like :channelName', {channelName: `%${filter.title}%`})
                        .orWhere('og.id like :ogId', {ogId: `%${filter.title}%`})
                }));
        }

        //channelId 필터 검색
        if(filter.channelId){
            orderGroupsQueryBuilder.andWhere('og.channelId = :channelId', {channelId: filter.channelId});
        }

        //상태값 필터 검색
        if(filter.status){
            orderGroupsQueryBuilder.andWhere('og.status in (:status)', {status: filter.status.split(',')});
        }
        //
        return orderGroupsQueryBuilder;
    }

    /**
     * @description 주문그룹 상세 조회(Back-Office 도 사용)
     * @author jason.jang
     * @date 2024/07/11
     **/
    async getOrderGroupDetail(orderGroupId: number): Promise<OrderGroup | null> {
        const orderGroupDetail = await this.orderGroupRepository
            .createQueryBuilder('og')
            .leftJoinAndSelect('og.user', 'u')
            .leftJoinAndSelect('og.orders', 'o')
            .leftJoinAndSelect('og.orderAttachedFiles', 'oaf')
            .leftJoinAndSelect('o.video', 'v')
            .leftJoinAndSelect('o.orderDetails', 'od')
            .leftJoinAndSelect('od.orderLanguageInfos', 'oli')
            .leftJoinAndSelect('oli.sourceLanguageInfo', 'sli')
            .leftJoinAndSelect('oli.targetLanguageInfo', 'tli')
            .select([
                'og.id'
                , 'og.title'
                , 'og.currency'
                , 'og.price'
                , 'og.comment'
                , 'og.numOfCharactersCode'
                , 'og.numOfCharactersValue'
                , 'og.hopeDateCommentCode'
                , 'og.hopeDateCommentValue'
                , 'og.sourceLanguage'
                , 'og.targetLanguage'
                , 'og.channelName'
                , 'og.channelId'
                , 'og.userId'
                , 'og.orderedAt'
                , 'og.status'
                , 'u.email'
                , 'o.id'
                , 'o.type'
                , 'o.title'
                , 'o.description'
                , 'o.numOfCharactersCode'
                , 'o.numOfCharactersValue'
                , 'o.hopeDateCommentCode'
                , 'o.hopeDateCommentValue'
                , 'o.completedAt'
                , 'o.status'
                , 'oaf.id'
                , 'oaf.s3Key'
                , 'oaf.type'
                , 'oaf.size'
                , 'oaf.name'
                , 'v.id'
                , 'v.youtubeVideoId'
                , 'v.youtubeLink'
                , 'v.s3Key'
                , 'v.name'
                , 'v.thumbnailS3Key'
                , 'v.duration'
                , 'od.id'
                , 'od.sourceLanguage'
                , 'od.targetLanguage'
                , 'od.status'
                , 'od.dubS3Key'
                , 'od.dubName'
                , 'od.dubSize'
                , 'od.audioS3Key'
                , 'od.audioName'
                , 'od.audioSize'
                , 'od.subS3Key'
                , 'od.subName'
                , 'od.subSize'
                , 'od.titleGuide'
                , 'od.descriptionGuide'
                , 'od.hashTagGuide'
                , 'od.dueDate'
                , 'od.completedAt'
                , 'oli.orderDetailId'
                , 'oli.sourceLanguage'
                , 'oli.targetLanguage'
                , 'sli.fullname'
                , 'tli.fullname'
            ])
            .where('og.id = :orderGroupId and og.hidden = :ogHidden', { orderGroupId: orderGroupId, ogHidden: 0})
            .andWhere(
                new Brackets((qb) => {
                    qb.where('o.hidden = :oHidden or o.hidden is null', {oHidden: 0})
                }))
            .andWhere(
                new Brackets((qb) => {
                    qb.where('v.hidden = :vHidden or v.hidden is null', {vHidden: 0})
                }))
            .andWhere(
                new Brackets((qb) => {
                    qb.where('oaf.hidden = :oafHidden or oaf.hidden is null', {oafHidden: 0})
                }))
            .andWhere(
                new Brackets((qb) => {
                    qb.where('od.hidden = :odHidden or od.hidden is null', {odHidden: 0})
                }))
            .orderBy({
                'o.title': 'ASC',
                'sli.fullname': 'ASC',
                'tli.fullname': 'ASC',
            })
            //취소, 거절 status 제외
            //.andWhere('o.status not in (:status)', {status: [ORDER.STATUS.REJECT, ORDER.STATUS.CANCELED]})
            .getOne();
        //
        return orderGroupDetail;
    }

    /**
     * @description 주문그룹 생성
     * @author jason.jang
     * @date 2024/07/08
    **/
    @Transactional()
    async createOrderGroups(createOrderGroupDto: CreateOrderGroupDto): Promise<OrderGroup> {
        for (const createOrderDto of createOrderGroupDto.orders) {
            await this.orderDetailRepository.save(createOrderDto.orderDetails);
            createOrderDto.video.name = createOrderDto.video.name.normalize('NFC');//자소 분리 이슈 수정
            await this.videoRepository.save(createOrderDto.video);
            await this.orderRepository.save(createOrderDto);
        }
        await this.orderAttachedFileRepository.save(createOrderGroupDto.orderAttachedFiles);
        createOrderGroupDto.channelName = createOrderGroupDto.channelName.normalize('NFC');//자소 분리 이슈 수정
        const orderGroup = await this.orderGroupRepository.save(createOrderGroupDto);
        //
        const orderLanguageInfoParams: OrderLanguageInfo[] = [];
        for (const order of orderGroup.orders) {
            for (const orderDetail of order.orderDetails) {
                const sourceLanguages = orderDetail.sourceLanguage.split(',');
                for (const sourceLanguage of sourceLanguages) {
                    const orderLanguageInfo = new OrderLanguageInfo();
                    orderLanguageInfo.orderId = order.id;
                    orderLanguageInfo.orderDetailId = orderDetail.id;
                    orderLanguageInfo.sourceLanguage = sourceLanguage;
                    orderLanguageInfo.targetLanguage = orderDetail.targetLanguage;
                    orderLanguageInfoParams.push(orderLanguageInfo)
                }
            }
        }
        //bulk insert
        await this.orderLanguageInfoRepository
            .createQueryBuilder()
            .insert()
            .into(OrderLanguageInfo)
            .values(orderLanguageInfoParams)
            .execute();
        return orderGroup;
    }

    /**
     * @description 주문그룹 상세 수정
     * @author jason.jang
     * @date 2024/07/08
     **/
    @Transactional()
    async updateOrderGroup(updateOrderGroupDto: UpdateOrderGroupDto): Promise<OrderGroup> {
        for (const updateOrderDto of updateOrderGroupDto.orders?? []) {
            await this.orderDetailRepository.softDelete({orderId: updateOrderDto.id});//order detail soft delete
            await this.orderDetailRepository.save(updateOrderDto.orderDetails?? []);//order detail 재생성
            await this.videoRepository.save(updateOrderDto.video?? {});
            await this.orderRepository.save(updateOrderDto?? {});
        }
        await this.orderAttachedFileRepository.save(updateOrderGroupDto.orderAttachedFiles?? []);
        const orderGroup = await this.orderGroupRepository.save(updateOrderGroupDto?? {});
        //
        const orderLanguageInfoParams: OrderLanguageInfo[] = [];
        for (const order of orderGroup.orders?? []) {
            for (const orderDetail of order.orderDetails) {
                const sourceLanguages = orderDetail.sourceLanguage.split(',');
                for (const sourceLanguage of sourceLanguages) {
                    const orderLanguageInfo = new OrderLanguageInfo();
                    orderLanguageInfo.orderId = order.id;
                    orderLanguageInfo.orderDetailId = orderDetail.id;
                    orderLanguageInfo.sourceLanguage = sourceLanguage;
                    orderLanguageInfo.targetLanguage = orderDetail.targetLanguage;
                    orderLanguageInfoParams.push(orderLanguageInfo)
                }
            }
            if(orderLanguageInfoParams.length !== 0 )
                await this.orderLanguageInfoRepository.delete({orderId: order.id})
        }
        await this.orderLanguageInfoRepository.createQueryBuilder().insert().into(OrderLanguageInfo).values(orderLanguageInfoParams).execute();
        await this.orderDetailRepository.createQueryBuilder().delete().from(OrderDetail).where('orderId is null').execute();
        return orderGroup;
    }

    /**
     * @description 주문 시 등장인물 수 설정값 호출
     * @author jason.jang
     * @date 2024/07/08
    **/
    async getOrderConfigsByFields(whereOptions: FindManyOptions): Promise<OrderConfig[]> {
        return await this.orderConfigRepository.find(whereOptions);
    }

    /**
     * @description 주문 시 가능 언어 리스트 호출
     * @author jason.jang
     * @date 2024/07/08
     **/
    async getOrderLanguages(): Promise<Language[]> {
        return await this.languageService.getOrderLanguages();
    }

    /**
     * @description 비디오 업로드 할 s3 presigned url 제공
     * @author jason.jang
     * @date 2024/07/09
    **/
    async getUploadAttachedFilePreSignedUrls(count: number): Promise<Array<JSONObject>> {
        const rootPath = this.configService.get('AWS.S3Base.ORDER_ATTACHED_FILE_PATH');
        const results: Array<JSONObject> = [];
        for (let idx = 1; idx <= count; idx++)
        {
            const uploadPreSignedInfo = await this.s3Service.getUploadPreSignedUrl(rootPath);
            results.push(uploadPreSignedInfo);
        }
        return results;
    }

    /**
     * @description 비디오 썸네일 업로드 할 s3 presigned url 제공
     * @author jason.jang
     * @date 2024/07/23
     **/
    async getUploadThumbnailUrlPreSignedUrls(count: number): Promise<Array<JSONObject>> {
        const rootPath = this.configService.get('AWS.S3Base.VIDEO_THUMBNAIL_PATH');
        const results: Array<JSONObject> = [];
        for (let idx = 1; idx <= count; idx++)
        {
            const uploadPreSignedInfo = await this.s3Service.getUploadPreSignedUrlWithPublic(rootPath);
            results.push(uploadPreSignedInfo);
        }
        return results;
    }

    /**
     * @description 주문 납품 파일 업로드 할 s3 presigned url 제공
     * @author jason.jang
     * @date 2024/07/21
     **/
    async getUploadProductPreSignedUrls(): Promise<JSONObject> {
        const productVideoRootPath = this.configService.get('AWS.S3Base.ORDER_PRODUCT_VIDEO_FILE_PATH');
        const productAudioRootPath = this.configService.get('AWS.S3Base.ORDER_PRODUCT_AUDIO_FILE_PATH');
        const productSubtitleRootPath = this.configService.get('AWS.S3Base.ORDER_PRODUCT_SUBTITLE_FILE_PATH');
        return {
            productVideo: await this.s3Service.getUploadPreSignedUrl(productVideoRootPath),
            productAudio: await this.s3Service.getUploadPreSignedUrl(productAudioRootPath),
            productSubtitle: await this.s3Service.getUploadPreSignedUrl(productSubtitleRootPath),
        };
    }

    /**
     * @description 주문 Details 수정(복수)
     * @author jason.jang
     * @date 2024/07/08
     **/
    @Transactional()
    async updateOrderDetails(updateBackofficeOrdersDto: UpdateBackofficeOrderDto[]): Promise<number> {
        const updateOrders = await this.orderRepository.save(updateBackofficeOrdersDto?? []);
        const orderLanguageInfoParams: OrderLanguageInfo[] = [];
        let orderGroupId = 0;
        for (const order of updateOrders?? []) {
            for (const orderDetail of order.orderDetails) {
                if(validator.isDateString(orderDetail?.deletedAt)
                    || !orderDetail.hasOwnProperty('sourceLanguage') || !orderDetail.hasOwnProperty('targetLanguage'))
                    continue;
                //
                const sourceLanguages = orderDetail.sourceLanguage.split(',');
                for (const sourceLanguage of sourceLanguages) {
                    const orderLanguageInfo = new OrderLanguageInfo();
                    orderLanguageInfo.orderId = order.id;
                    orderLanguageInfo.orderDetailId = orderDetail.id;
                    orderLanguageInfo.sourceLanguage = sourceLanguage;
                    orderLanguageInfo.targetLanguage = orderDetail.targetLanguage;
                    orderLanguageInfoParams.push(orderLanguageInfo)
                }
            }
            if(orderLanguageInfoParams.length !== 0 )
                await this.orderLanguageInfoRepository.delete({orderId: order.id})
            //
            orderGroupId = order.orderGroupId;
        }
        await this.orderLanguageInfoRepository.createQueryBuilder().insert().into(OrderLanguageInfo).values(orderLanguageInfoParams).execute();
        await this.orderDetailRepository.createQueryBuilder().delete().from(OrderDetail).where('orderId is null').execute();
        return orderGroupId;
    }

    /**
     * @description 주문승인 상태변경(Back-Office 도 사용)
     * @author jason.jang
     * @date 2024/08/01
    **/
    @Transactional()
    async updateInProgressStatusOrderGroupWithOrders({orderGroupId, updateValues}: {orderGroupId: number, updateValues: any}): Promise<void> {
        await this.updateOrderGroupStatus({orderGroupId: orderGroupId, updateValues: updateValues});
        await this.updateOrderStatus({orderGroupId: orderGroupId, updateValues: updateValues});
        await this.updateOrderDetailStatus({orderGroupId: orderGroupId, updateValues: updateValues});
    }

    /**
     * @description 주문거절 상태변경(Back-Office 도 사용)
     * @author jason.jang
     * @date 2024/08/01
     **/
    @Transactional()
    async updateRejectStatusOrderGroupWithOrders({orderGroupId, updateValues, rejectReason}
                                                         : {orderGroupId: number, updateValues: any, rejectReason: string}): Promise<Order[]> {
        await this.updateOrderGroupStatus({orderGroupId: orderGroupId, updateValues: {rejectReason: rejectReason, ...updateValues}});
        await this.updateOrderStatus({orderGroupId: orderGroupId, updateValues: updateValues});
        const findOrders = await this.updateOrderDetailStatus({orderGroupId: orderGroupId, updateValues: updateValues});
        return findOrders;
    }

    /**
     * @description order group 의 상태값 변경
     * @author jason.jang
     * @date 2024/07/08
     **/
    async updateOrderGroupStatus({orderGroupId, updateValues}: {orderGroupId: number, updateValues: any}): Promise<void> {
        await this.orderGroupRepository.createQueryBuilder()
            .update(OrderGroup)
            .set(updateValues)
            .where("id = :orderGroupId", {orderGroupId: orderGroupId})
            .andWhere("deletedAt IS NULL")
            .execute();
    }

    /**
     * @description order 의 상태값 전부 변경 orderGroupId가 존재하면 order 전부 변경, orderId가 존재하면 해당 order만 상태값 변경
     * @author jason.jang
     * @date 2024/07/08
     **/
    async updateOrderStatus({orderGroupId, orderId, updateValues}: {orderGroupId?: number, orderId?: number, updateValues: any}): Promise<void> {
        const updateOrders = this.orderGroupRepository.createQueryBuilder()
            .update(Order)
            .set(updateValues);
        if(orderGroupId)
        {
            updateOrders.where("orderGroupId = :orderGroupId", {orderGroupId: orderGroupId});
        }else if(orderId)
        {
            updateOrders.where("id = :orderId", {orderId: orderId});
        }else
            updateOrders.where("1 = 0");
        //
        await updateOrders.andWhere("deletedAt IS NULL").execute();
    }

    /**
     * @description order detail 변경
     * @author jason.jang
     * @date 2024/07/22
     **/
    async updateOrderDetail(updateOrderDetailDto: UpdateOrderDetailDto): Promise<void> {
        await this.orderDetailRepository.save(updateOrderDetailDto, {reload: false});
    }

    /**
     * @description orderGroupId가 존재하면 order detail 전부 변경
     * @author jason.jang
     * @date 2024/07/22
     **/
    async updateOrderDetailStatus({orderGroupId, updateValues}: {orderGroupId: number, updateValues: any}): Promise<Order[]> {
        const findOrders = await this.orderRepository.find({
            where: {
                orderGroupId: orderGroupId
            },
            relations: ['video']
        });
        //
        for(const order of findOrders){
            await this.orderDetailRepository.createQueryBuilder()
                .update(OrderDetail)
                .set(updateValues)
                .where("orderId = :orderId", {orderId: order.id})
                .andWhere("deletedAt IS NULL")
                .execute();
        }
        return findOrders;
    }

    /**
     * @description 취소된 주문들 비디오 삭제
     * @author jason.jang
     * @date 2024/07/25
    **/
    async deleteOrderVideos(findOrders: Order[]): Promise<void> {
        const s3Keys: ObjectIdentifier[] = [];
        for (const order of findOrders)
        {
            if(order.video.s3Key)
                s3Keys.push({Key: order.video.s3Key})
        }
        if(s3Keys.length !== 0)
            await this.videoService.deleteVideoS3Objects(s3Keys);
    }

    /**
     * @description 주문 첨부파일 다운로드 할 s3 presigned url 제공(Back-Office 도 사용)
     * @author jason.jang
     * @date 2024/07/18
    **/
    async getDownloadPreSignedUrls(s3Keys: [{name: string; s3Key: string}]): Promise<Array<JSONObject>> {
        const results: Array<JSONObject> = [];
        for (const s3KeyInfo of s3Keys)
        {
            const DownloadPreSignedInfo = await this.s3Service.getDownloadPreSignedUrl(s3KeyInfo);
            results.push(DownloadPreSignedInfo);
        }
        return results;
    }

    /**
     * @description 업로드 된 제품 파일 삭제 -> 제품 삭제 + s3 object 삭제(Back-Office 도 사용)
     * @author jason.jang
     * @date 2024/07/26
     **/
    async deleteUploadedProduct(updateOrderDetailDto: UpdateOrderDetailDto): Promise<void> {
        const s3Keys: ObjectIdentifier[] = [];
        if(updateOrderDetailDto.audioS3Key) {
            s3Keys.push({Key: updateOrderDetailDto.audioS3Key});
            updateOrderDetailDto.audioS3Key = null;
            updateOrderDetailDto.audioName = null;
        }
        //
        if(updateOrderDetailDto.dubS3Key) {
            s3Keys.push({Key: updateOrderDetailDto.dubS3Key});
            updateOrderDetailDto.dubS3Key = null;
            updateOrderDetailDto.dubName = null;
        }
        //
        if(updateOrderDetailDto.subS3Key) {
            s3Keys.push({Key: updateOrderDetailDto.subS3Key});
            updateOrderDetailDto.subS3Key = null;
            updateOrderDetailDto.subName = null;
        }

        if(s3Keys.length !== 0)
            this.s3Service.deleteObjects(s3Keys);

        await this.orderDetailRepository.save(updateOrderDetailDto, {reload: false});
    }

    /**
     * @description 주문 삭제 -> 비디오 삭제 + s3 object 삭제(Back-Office 도 사용)
     * @author jason.jang
     * @date 2024/07/19
     **/
    @Transactional()
    async deleteOrder(orderId: number, status: string): Promise<void> {
        const findOrder: Order = await this.orderRepository.findOne({
            where: {id: orderId},
            relations: ['video', 'orderDetails'],
            withDeleted: true,
        });

        if(findOrder)
        {
            if(findOrder.video?.s3Key)
                this.videoService.deleteVideoS3Object([findOrder.video.s3Key]);//await 하지 않고 비동기로 삭제 처리하는 게 나을듯
            //
            for(const orderDetail of findOrder.orderDetails)
            {
                orderDetail.status = ORDER.STATUS.CANCELED;//취소
                orderDetail.canceledAt = new Date();
            }
            await this.orderDetailRepository.save(findOrder.orderDetails?? [], {reload: false})
            findOrder.status = status;//주문 거절
            findOrder.canceledAt = new Date();
            const updatedOrder = await this.orderRepository.save(findOrder);
            await this.orderRepository.softRemove(updatedOrder, {reload: false});//논리 삭제
        }
    }

    /**
     * @description order detail 완료 상태 변경 -> 구조적으로 order details > orders > order groups 찾아서 status 변경
     * @author jason.jang
     * @date 2024/07/22
    **/
    @Transactional()
    async updateOrderDetailStatusComplete({orderGroupId, orderId, orderDetailId}: {orderGroupId: number, orderId: number, orderDetailId: number}): Promise<OrderDetail> {
        const completeOrderDetail = await this.orderDetailRepository.save({id: orderDetailId, status: ORDER.STATUS.COMPLETE, completedAt: new Date()});
        const findIncompleteOrderDetails = await this.orderDetailRepository.createQueryBuilder('od')
            .where('od.orderId = :orderId', {orderId: orderId})
            .andWhere('od.status NOT IN (:statusArray)', {statusArray: [ORDER.STATUS.COMPLETE, ORDER.STATUS.REJECT, ORDER.STATUS.CANCELED]})
            .getMany();
        if(findIncompleteOrderDetails.length === 0){//미완료 주문 디테일이 0개 -> 전부 완료
            await this.orderRepository.save({id: orderId, status: ORDER.STATUS.COMPLETE, completedAt: new Date()}, {reload: false});
            const findIncompleteOrders = await this.orderRepository.createQueryBuilder('o')
                .where('o.orderGroupId = :orderGroupId', {orderGroupId: orderGroupId})
                .andWhere('o.status NOT IN (:status)', {status: [ORDER.STATUS.COMPLETE, ORDER.STATUS.REJECT, ORDER.STATUS.CANCELED]})
                .getMany();
            if(findIncompleteOrders.length === 0) {//미완료 주문이 0개 -> 전부 완료
                await this.orderGroupRepository.save({id: orderGroupId, status: ORDER.STATUS.COMPLETE, completedAt: new Date()}, {reload: false});
            }
        }

        return completeOrderDetail;
    }

    /**
     * @description 주문 생성 메일 발송
     * @author jason.jang
     * @date 2024/07/30
    **/
    async sendCreateOrder(user: User, language: string): Promise<void> {
        const mailData: IMailData = {
            message: {
                language: language,
                to: user.email,
            },
            entriesForBinding: {
                subject: null,
                title: null,
                content: null,
            }
        };
        await this.mailService.sendCreateOrder(mailData);
    }

    /**
     * @description 주문 승인 메일 발송
     * @author jason.jang
     * @date 2024/08/01
    **/
    async sendApproveOrder(orderGroupId: number): Promise<void> {
        const findOrderGroup = await this.findOrderGroupByFields({where: {id: orderGroupId}, relations: ['user']});
        if(!findOrderGroup)
            return;
        const mailData: IMailData = {
            message: {
                language: findOrderGroup.user.contentLanguage,
                to: findOrderGroup.user.email,
            },
            entriesForBinding: {
                subject: null,
                title: null,
                content: null,
            }
        };
        await this.mailService.sendApproveOrder(mailData);
    }

    /**
     * @description 주문 수정 메일 발송
     * @author jason.jang
     * @date 2024/08/01
    **/
    async sendModifiedOrder(orderGroupId: number): Promise<void> {
        const findOrderGroup = await this.findOrderGroupByFields({where: {id: orderGroupId}, relations: ['user']});
        if(!findOrderGroup)
            return;
        //
        const mailData: IMailData = {
            message: {
                language: findOrderGroup.user.contentLanguage,
                to: findOrderGroup.user.email,
            },
            entriesForBinding: {
                subject: null,
                title: null,
                content: null,
            }
        };
        await this.mailService.sendModifiedOrder(mailData);
    }

    /**
     * @description 주문 거절 메일 발송
     * @author jason.jang
     * @date 2024/08/01
     **/
    async sendRejectOrder(orderGroupId: number): Promise<void> {
        const findOrderGroup = await this.findOrderGroupByFields({where: {id: orderGroupId}, relations: ['user']});
        if(!findOrderGroup)
            return;
        //
        const mailData: IMailData = {
            message: {
                language: findOrderGroup.user.contentLanguage,
                to: findOrderGroup.user.email,
            },
            entriesForBinding: {
                subject: null,
                title: null,
                content: null,
            }
        };
        await this.mailService.sendRejectOrder(mailData);
    }

    /**
     * @description 주문 완료 메일 발송
     * @author jason.jang
     * @date 2024/08/01
     **/
    async sendCompleteOrder(orderGroupId: number): Promise<void> {
        const findOrderGroup = await this.findOrderGroupByFields({where: {id: orderGroupId}, relations: ['user']});
        if(!findOrderGroup)
            return;
        //
        const mailData: IMailData = {
            message: {
                language: findOrderGroup.user.contentLanguage,
                to: findOrderGroup.user.email,
            },
            entriesForBinding: {
                subject: null,
                title: null,
                content: null,
            }
        };
        await this.mailService.sendCompleteOrder(mailData);
    }
}
