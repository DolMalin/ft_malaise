import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Game } from './game/entities/game-entity';
import { User } from './users/entities/user.entity';

import { GameModule } from './game/game.module';
import { UsersModule } from './users/users.module';

import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { Message } from './chat/entities/message.entity';
import { Room } from './chat/entities/room.entity';
import { Avatar } from './users/entities/avatar.entity';
import { FriendRequest } from './users/entities/friendRequest.entity';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'database',
      port: Number(process.env.DATABASE_PORT) || 5432,
      username: process.env.DATABASE_USER,
      database: process.env.DATABASE_NAME,
      password: process.env.DATABASE_PASSWORD,
      entities: [User, Room, Message, Avatar, Game, FriendRequest],
      synchronize: true,
      // dropSchema: true,/*  wipe la db a chaque refresh */
    }),
    UsersModule,
    GameModule,
    AuthModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(BrowserCheckMiddleware).forRoutes('*');
  }
}

