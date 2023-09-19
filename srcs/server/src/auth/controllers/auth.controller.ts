import { Controller, Get, Req,Res,Headers, Body, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { UsersService } from 'src/users/services/users.service';
import { FtAuthGuard } from '../guards/ft.auth.guard';
import { JwtAuthGuard } from '../guards/accessToken.auth.guard';
import { read } from 'fs';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) { }

    @Get('redirect')
    redirect(): object {
      return this.authService.buildRedirectUrl()
    }

    @UseGuards(FtAuthGuard)
    @Get('login/:code')
    async login(@Req() req: any, @Res() res: any) {
      return await this.authService.login(req, res)
    }

    @UseGuards(JwtAuthGuard)
    @Get('logout')
    logout(@Req() req: any, @Res() res: any) {
      return this.authService.logout(req, res)
    }
    
    @UseGuards(JwtAuthGuard)
    @Get('protected')
    protected(@Req() req: any, @Res() res: any, @Headers() headers: any) {
      console.log("prout")
      res.send('ok')
    }

    @Get('test')
    test(@Req() req: any, @Res() res: any) {
      res.send("coucou biloute")
    }


}
