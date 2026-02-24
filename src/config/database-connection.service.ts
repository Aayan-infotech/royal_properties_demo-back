import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class DatabaseConnectionService implements OnModuleInit {
  constructor(
    @InjectConnection() private readonly connection: Connection,
  ) {}

  onModuleInit() {
    // If already connected
    if (this.connection.readyState === 1) {
      console.log('✅ MongoDB connected successfully');
    }

    // When connected
    this.connection.on('connected', () => {
      console.log('✅ MongoDB connected successfully');
    });

    // On error
    this.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });

    // On disconnect
    this.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });
  }
}
