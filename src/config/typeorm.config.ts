import { TypeOrmModuleOptions } from '@nestjs/typeorm'

export const typeOrmConfig = (): TypeOrmModuleOptions => {

    return {
        type: 'sqlite',
        entities: [__dirname + '/../**/*.entity.{js,ts}'],
        synchronize: true,
        database: process.env.PG_DATABASE,
    }

    // return {
    //     type: 'postgres',
    //     host: process.env.PG_HOST,
    //     port: 5432,
    //     username: process.env.PG_USERNAME,
    //     password: process.env.PG_PASSWORD,
    //     database: process.env.PG_DATABASE,
    //     entities: [__dirname + '/../**/*.entity.{js,ts}'],
    //     synchronize: true
    // }
}

