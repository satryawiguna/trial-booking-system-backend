import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@app/auth';
import { LoggerModule } from '@app/logger';
import { DatabaseModule } from '@app/database';
import { ParentsModule } from '@app/parents';
import { TrialClassesModule } from '@app/trial-classes';
import { BookingsModule } from '@app/bookings';
import { PaymentsModule } from '@app/payments';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    LoggerModule,
    DatabaseModule,
    ParentsModule,
    TrialClassesModule,
    BookingsModule,
    PaymentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
