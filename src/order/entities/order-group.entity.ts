import {Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {Order} from "./order.entity";
import {OrderAttachedFile} from "./order-attached-file.entity";
import {User} from "../../user/entities/user.entity";

@Entity({name: 'order_groups'})
export class OrderGroup {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({name: 'user_id'})
    userId: number;

    @Column()
    title: string;

    @Column({type: 'decimal'})
    price: number;

    @Column()
    currency: string;

    @Column({name: 'source_language'})
    sourceLanguage: string;

    @Column({name: 'target_language'})
    targetLanguage: string;

    @Column()
    comment: string;

    @Column({name: 'num_of_characters_code'})
    numOfCharactersCode: string;

    @Column({name: 'num_of_characters_value'})
    numOfCharactersValue: string;

    @Column({name: 'hope_date_comment_code'})
    hopeDateCommentCode: string

    @Column({name: 'hope_date_comment_value'})
    hopeDateCommentValue: string

    @Column({name: 'owner_user_id'})
    ownerUserId: number;

    @Column({name: 'channel_id'})
    channelId: string;

    @Column({name: 'channel_name'})
    channelName: string;

    @Column({name: 'reject_reason'})
    rejectReason: string;

    @Column()
    status: string;

    @Column({name: 'due_date', type: 'timestamp'})
    dueDate: Date;

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

    @OneToMany(() => Order, (order) => order.orderGroup)
    orders: Order[];

    @OneToMany(() => OrderAttachedFile, (orderAttachedFile) => orderAttachedFile.orderGroup)
    orderAttachedFiles: OrderAttachedFile[];

    @ManyToOne(() => User, (user) => user.orderGroups)
    @JoinColumn({name: 'user_id', referencedColumnName: 'id'})
    user: User;
}
