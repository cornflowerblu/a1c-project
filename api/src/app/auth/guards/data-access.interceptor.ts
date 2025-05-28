import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { PrismaService } from "../../database";

@Injectable()
export class DataAccessInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Set user context for all database queries
    this.prisma.$use(async (params, next) => {
      // Apply filters based on user role and relationships
      if (params.model === 'Run' || params.model === 'Reading') {
        if (params.action === 'findMany' || params.action === 'findFirst' || params.action === 'findUnique') {
          // For regular users, only show their own data
          if (user.role === 'user') {
            params.args.where = {
              ...params.args.where,
              userId: user.id,
            };
          }
          
          // For caregivers, show their own data + data of patients they care for
          if (user.role === 'caregiver') {
            const caregivingForIds = await this.getCaregivingPatientIds(user.id);
            
            params.args.where = {
              ...params.args.where,
              OR: [
                { userId: user.id },
                { userId: { in: caregivingForIds } }
              ]
            };
          }
        }
      }
      
      return next(params);
    });
    
    return next.handle();
  }
  
  private async getCaregivingPatientIds(caregiverId: string): Promise<string[]> {
    const relationships = await this.prisma.caregiverAccess.findMany({
      where: {
        caregiverId,
        status: 'active',
      },
      select: {
        patientId: true,
      },
    });
    
    return relationships.map(rel => rel.patientId);
  }
}