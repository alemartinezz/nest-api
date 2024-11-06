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
    profileGroup: string,
    rateLimit: number,
  ): Promise<Token> {
    const startingDate = new Date();
    const expiresAt = new Date(startingDate.getTime() + expiresIn * 1000);
    const newToken = new this.tokenModel({
      token,
      userId,
      expiresAt,
      startingDate,
      profileGroup,
      rateLimit,
    });
    return newToken.save();
  }

  async validateToken(token: string): Promise<Token | null> {
    const tokenDoc = await this.tokenModel.findOne({ token });
    if (!tokenDoc) return null;
    if (tokenDoc.expiresAt < new Date()) {
      await this.tokenModel.deleteOne({ token });
      return null;
    }
    return tokenDoc;
  }

  async deleteToken(token: string): Promise<void> {
    await this.tokenModel.deleteOne({ token });
  }
}
