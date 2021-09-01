import { Controller, Get, Param, Res, NotFoundException, HttpStatus } from '@nestjs/common';
import { AuthUser } from '../../shared/decorators/auth-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorators';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {

    constructor(
        private paymentService: PaymentService
    ) { }

    @Get()
    @Roles('user', 'premium', 'admin')
    async getMyPayment(@AuthUser() user, @Param() params) {
        const res = await this.paymentService.myPayments(user);
        console.log("My payments", res);
        return res;
    }
    
}
