import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { DatabaseConnectionService } from './config/database-connection.service';
import { SecretsModule } from './config/secrets.module';
import { AwsSecretsService } from './config/aws-secrets.service';

import { BuyersModule } from './buyers/buyers.module';
import { SellersModule } from './sellers/sellers.module';
import { AuthModule } from './auth/auth.module';
import { AgentsModule } from './agents/agents.module';
import { MailModule } from './mail/mail.module';
import { PropertyModule } from './property/property.module';
import { S3Module } from './s3/s3.module';
import { EnquiriesModule } from './enquiry/enquiry.module';
import { WatchlistsModule } from './watchlists/watchlist.module';
import { MapModule } from './map/map.module';
import { PropertyExtrasModule } from './property-extras/property-extras.module';
import { FaqModule } from './faq/faq.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    SecretsModule,

    MongooseModule.forRootAsync({
      imports: [SecretsModule],
      inject: [AwsSecretsService],
      useFactory: async (awsSecrets: AwsSecretsService) => {
        const secrets = await awsSecrets.getSecrets();
        return { uri: secrets.MONGODB_URI };
      },
    }),

    BuyersModule,
    SellersModule,
    AuthModule,
    AgentsModule,
    MailModule,
    PropertyModule, // ✅ handles PropertyController & PropertyService
    S3Module, EnquiriesModule, WatchlistsModule, MapModule, PropertyExtrasModule, FaqModule,
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseConnectionService],
})
export class AppModule {}
