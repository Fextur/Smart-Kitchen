import { Injectable, NotFoundException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { UserService } from 'src/Users/user.service';
import { JwtService } from '@nestjs/jwt';

const client = new OAuth2Client();

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async googleLogin(credential: string) {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (payload && payload.email) {
      let user = await this.userService.findByEmail(payload.email);

      if (!user) {
        const newUserData = await this.userService.create({
          email: payload.email,
          name: payload.name!,
          userName: payload.name!,
          password: 'google_sign',
        });

        return newUserData;
      } else {
        const accessToken = await this.userService.generateAccessToken(
          user.id,
          user.userName,
        );

        return { ...user, accessToken };
      }
    } else {
      throw new NotFoundException('Invalid Google credentials');
    }
  }
}
