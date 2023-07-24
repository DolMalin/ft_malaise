import { Injectable, Logger} from '@nestjs/common';
import { CreateAuthDto } from '../dto/create-auth.dto';
import { UpdateAuthDto } from '../dto/update-auth.dto';
import { UsersService } from 'src/users/services/users.service';
import { User } from 'src/users/entities/user.entity';

import axios from 'axios'


@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) { }

  // async validateUser(username: string): Promise<any> {
  //   const user = await this.usersService.findOne()
  // }


  buildRedirectUrl(): string {
    let url = new URL( '/oauth/authorize', process.env.OAUTH_URL)
    url.searchParams.set('client_id', process.env.CLIENT_ID)
    url.searchParams.set('redirect_uri', process.env.CALLBACK_URL)
    url.searchParams.set('response_type', 'code')
    return (url.toString())
  }

  async getFtToken(code: string): Promise<string> {
    return new Promise((resolve, reject) => {

        const bodyParameters = {
          grant_type: 'authorization_code',
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.SECRET,
          code: code,
          redirect_uri: process.env.CALLBACK_URL
        }

        const config = {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }

        axios.post(
          "https://api.intra.42.fr/oauth/token",
          bodyParameters,
          config
        ).then((response) => {
          resolve(response.data.access_token as string)
        }, (err) => {
          resolve(null)
        })

    })
  }


  async getFtId(token: string): Promise<number> {
    return new Promise((resolve, reject) => {

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }

      axios.get(
        "https://api.intra.42.fr/v2/me",
        config
      ).then((response) => {
        resolve(response.data.id as number)
      }, (err) => {
        resolve(null)
      })
    })
  }

  /**
   * @description Check the validity of a user from his given `ftId`, and then return him if it exists, or creates a new one
   */
  async validateUser(ftId: number): Promise<User> {
    const user = await this.usersService.findOne(ftId)
    if (user) {
      Logger.log(`User #${ftId} logged`)
      return user
    }
    const newUser = await this.usersService.create({ftId: ftId})
    Logger.log(`User ${ftId} created`)
    return newUser
  }

  create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth'
  }

  findAll() {
    return `This action returns all auth`
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`
  }

  remove(id: number) {
    return `This action removes a #${id} auth`
  }
}
