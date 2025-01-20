import {Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn} from 'typeorm';
import {OrderDetail} from "./order-detail.entity";
import {User} from "../../user/entities/user.entity";
import {Language} from "../../language/entities/language.entity";

@Entity({name: 'order_language_infos'})
export class OrderLanguageInfo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({name: 'order_id'})
    orderId: number;

    @Column({name: 'order_detail_id'})
    orderDetailId: number;

    @Column({name: 'source_language'})
    sourceLanguage: string;

    @Column({name: 'target_language'})
    targetLanguage: string;

    @Column({name: 'created_at', type: 'timestamp'})
    createdAt: Date;

    @Column({name: 'updated_at', type: 'timestamp'})
    updatedAt: Date;

    @ManyToOne(() => OrderDetail, (orderDetail) => orderDetail.orderLanguageInfos)
    @JoinColumn({name: 'order_detail_id', referencedColumnName: 'id'})
    orderDetail: OrderDetail;

    @OneToOne(() => Language, (language) => language.code)
    @JoinColumn({name: 'source_language', referencedColumnName: 'code'})
    sourceLanguageInfo: Language;

    @OneToOne(() => Language, (language) => language.code)
    @JoinColumn({name: 'target_language', referencedColumnName: 'code'})
    targetLanguageInfo: Language;
}
