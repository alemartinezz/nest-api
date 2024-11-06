// src/auth/mongo/token.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Token, TokenDocument } from './token.schema';

@Injectable()
export class TokenService {
  constructor(
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
  ) {}

  async createToken(
    token: string,
    userId: string,
    expiresIn: number,
  ): Promise<Token> {
    const expiresAt = new Date(Date.now() + expiresIn * 1000); // expiresIn is in seconds
    const newToken = new this.tokenModel({ token, userId, expiresAt });
    return newToken.save();
  }

  async validateToken(token: string): Promise<boolean> {
    const tokenDoc = await this.tokenModel.findOne({ token });
    if (!tokenDoc) return false;
    if (tokenDoc.expiresAt < new Date()) {
      await this.tokenModel.deleteOne({ token });
      return false;
    }
    return true;
  }

  async deleteToken(token: string): Promise<void> {
    await this.tokenModel.deleteOne({ token });
  }
}
