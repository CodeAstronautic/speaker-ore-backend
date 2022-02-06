import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe, Logger } from '@nestjs/common'

async function bootstrap() {
    const logger = new Logger('bootstrap');
    const app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'verbose', 'debug', 'log']
    })
    app.setGlobalPrefix('api')
    app.enableCors()
    // * whitelist: true ensures no extra values other than what mentioned in the DTO is passed to the controller
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
        })
    )
    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`Listening on port ${port}`);
}
bootstrap()
