import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm'
import { Product } from './Product'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column()
  email: string

  @Column()
  mobile: string

  @Column()
  postcode: string

  @ManyToMany(() => Product, (product) => product.interestedUsers)
  @JoinTable()
  interests: Product[]
}
