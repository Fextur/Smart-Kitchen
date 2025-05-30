import { Injectable, NotFoundException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { UserService } from 'src/Users/user.service';

const client = new OAuth2Client();

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async googleLogin(credential: string) {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (payload && payload.email) {
      const user = await this.userService.findByEmail(payload.email);

      if (user) {
        return user;
      } else {
        const newUser = await this.userService.create({
          email: payload.email,
          name: payload.name!,
          userName: payload.name!,
          password: 'google_sign',
        });

        return newUser;
      }
    } else {
      throw NotFoundException;
    }
  }
}
