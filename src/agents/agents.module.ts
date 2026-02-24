import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AgentsService } from './agents.service';
import { AgentsController } from './agents.controller';
import { Agent, AgentSchema } from './agent.schema';
import { MailModule } from '../mail/mail.module'

@Module({
  imports: [MongooseModule.forFeature([{ name: Agent.name, schema: AgentSchema }]),MailModule],
  providers: [AgentsService],
  controllers: [AgentsController],
  exports: [AgentsService],
})
export class AgentsModule {}
