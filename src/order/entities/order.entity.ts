import {
    Column,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn
} from 'typeorm';
import {OrderGroup} from "./order-group.entity";
import {Video} from "../../video/entities/video.entity";
import {OrderDetail} from "./order-detail.entity";

@Entity({name: 'orders'})
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({name: 'order_group_id'})
    orderGroupId: number;

    @Column({name: 'video_id'})
    videoId: number;

    @Column()
    type: string;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column({name: 'num_of_characters_code'})
    numOfCharactersCode: string;

    @Column({name: 'num_of_characters_value'})
    numOfCharactersValue: string;

    @Column({name: 'hope_date_comment_code'})
    hopeDateCommentCode: string

    @Column({name: 'hope_date_comment_value'})
    hopeDateCommentValue: string

    @Column()
    status: string;

    @Column({name: 'ordered_at', type: 'timestamp'})
    orderedAt: Date;

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

    @ManyToOne(() => OrderGroup, (orderGroup) => orderGroup.orders)
    @JoinColumn({name: 'order_group_id', referencedColumnName: 'id'})
    orderGroup: OrderGroup;

    @OneToOne(() => Video, (video) => video.id, {cascade: true })
    @JoinColumn({name: 'video_id', referencedColumnName: 'id'})
    video: Video;

    @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.order, {cascade: true })
    orderDetails: OrderDetail[];
}
