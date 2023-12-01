import { Field } from "@nestjs/graphql";
import { IsString } from "class-validator";
import { User } from "src/users/entities/user.entity";
import { ManyToOne } from "typeorm";
import { Room } from "../entities/room.entity";

export class CreateMessageDto {

    @IsString()
    content : string;

    roomId : number;
    
	sendAt: string;
    
}