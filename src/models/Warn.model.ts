import { Table, Column, Model, DataType, AllowNull, Unique, PrimaryKey, CreatedAt, UpdatedAt } from 'sequelize-typescript'

@Table({
    timestamps: true
})
export class Warn extends Model {
    @CreatedAt
    creationDate!: Date;
  
    @UpdatedAt
    updatedOn!: Date;

    @Column(DataType.STRING)
    @PrimaryKey
    @Unique(true)
    // @ts-expect-error
    id!: string;

    @Column(DataType.STRING)
    @AllowNull(true)
    reason?: string;

    @Column(DataType.DATE)
    @AllowNull(true)
    expireOn?: Date;

    @Column(DataType.STRING)
    @AllowNull(true)
    mod_id?: string;
}