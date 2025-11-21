import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SessionLoggerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('SessionLogger');
  private intervalRef: NodeJS.Timeout | null = null;

  constructor(private readonly prisma: PrismaService) {}

  async logSessionsOnce() {
    try {
      const users = await this.prisma.person.findMany({
        where: { currentToken: { not: null } },
        select: { id: true, username: true, lastActivityAt: true },
      });

      const now = Date.now();
      users.forEach((u) => {
        const last = u.lastActivityAt ? new Date(u.lastActivityAt).getTime() : null;
        const inactiveSec = last ? Math.floor((now - last) / 1000) : null;
        this.logger.log(
          `[Session] personId=${u.id} username=${u.username} inactive=${inactiveSec !== null ? inactiveSec + 's' : 'never'} lastActivityAt=${u.lastActivityAt ?? 'null'}`,
        );
      });
    } catch (e) {
      this.logger.error('Error while logging sessions', e as any);
    }
  }

  onModuleInit() {
    // Ejecutar inmediatamente y luego cada 30s
    this.logSessionsOnce();
    this.intervalRef = setInterval(() => this.logSessionsOnce(), 30 * 1000);
    this.logger.log('SessionLoggerService started, logging every 30s');
  }

  onModuleDestroy() {
    if (this.intervalRef) clearInterval(this.intervalRef);
    this.logger.log('SessionLoggerService stopped');
  }
}
