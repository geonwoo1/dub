import {Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {OrderGroup} from "./order-group.entity";

@Entity({name: 'order_attached_files'})
export class OrderAttachedFile {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({name: 'order_group_id'})
    orderGroupId: number;

    @Column({name: 'order_id'})
    orderId: number;

    @Column()
    name: string;

    @Column({name: 's3_key'})
    s3Key: string;

    @Column()
    size: string;

    @Column()
    type: string;

    @Column({type: 'tinyint', default: 0})
    hidden: number;

    @DeleteDateColumn({name: 'deleted_at'})
    deletedAt: Date | null;

    @Column({name: 'created_at', type: 'timestamp'})
    createdAt: Date;

    @Column({name: 'updated_at', type: 'timestamp'})
    updatedAt: Date;

    @ManyToOne(() => OrderGroup, (orderGroup) => orderGroup.orderAttachedFiles)
    @JoinColumn({name: 'order_group_id', referencedColumnName: 'id'})
    orderGroup: OrderGroup;
}
