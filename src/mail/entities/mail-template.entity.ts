import {Column, DeleteDateColumn, Entity, PrimaryColumn} from "typeorm";

@Entity({name: 'mail_templates'})
export class MailTemplate {
    @PrimaryColumn()
    id: number;

    @PrimaryColumn()
    language: string;

    @Column()
    type: number;

    @Column()
    subject: string;

    @Column()
    title: string;

    @Column()
    content: string;

    @DeleteDateColumn({name: 'deleted_at'})
    deletedAt: Date | null;

    @Column({name: 'created_at', type: 'timestamp'})
    createdAt: Date;

    @Column({name: 'updated_at', type: 'timestamp'})
    updatedAt: Date;
}
