import {Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {Order} from "./order.entity";
import {OrderLanguageInfo} from "./order-language-info.entity";

@Entity({name: 'order_details'})
export class OrderDetail {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({name: 'order_id'})
    orderId: number;

    @Column({name: 'source_language'})
    sourceLanguage: string;

    @Column({name: 'target_language'})
    targetLanguage: string;

    @Column()
    status: string;

    @Column({name: 'dub_s3_key'})
    dubS3Key: string;

    @Column({name: 'dub_name'})
    dubName: string;

    @Column({name: 'dub_size'})
    dubSize: string;

    @Column({name: 'audio_s3_key'})
    audioS3Key: string;

    @Column({name: 'audio_name'})
    audioName: string;

    @Column({name: 'audio_size'})
    audioSize: string;

    @Column({name: 'sub_s3_key'})
    subS3Key: string;

    @Column({name: 'sub_name'})
    subName: string;

    @Column({name: 'sub_size'})
    subSize: string;

    @Column({name: 'upload_at', type: 'timestamp'})
    uploadAt: Date;

    @Column({name: 'title_guide'})
    titleGuide: string;

    @Column({name: 'description_guide'})
    descriptionGuide: string;

    @Column({name: 'hash_tag_guide'})
    hashTagGuide: string;

    @Column({name: 'due_date', type: 'timestamp'})
    dueDate: Date;

    @Column({name: 'started_at', type: 'timestamp'})
    startedAt: Date;

    @Column({name: 'completed_at', type: 'timestamp'})
    completedAt: Date;

    @Column({name: 'canceled_at', type: 'timestamp'})
    canceledAt: Date;

    @Column({type: 'tinyint', default: 0})
    hidden: number;

    @DeleteDateColumn({name: 'deleted_at'})
    deletedAt: Date | null;

    @Column({name: 'created_at', type: 'timestamp'})
    createdAt: Date;

    @Column({name: 'updated_at', type: 'timestamp'})
    updatedAt: Date;

    @ManyToOne(() => Order, (order) => order.orderDetails)
    @JoinColumn({name: 'order_id', referencedColumnName: 'id'})
    order: Order;

    @OneToMany(() => OrderLanguageInfo, (orderLanguageInfo) => orderLanguageInfo.orderDetail)
    orderLanguageInfos: OrderLanguageInfo[];
}
