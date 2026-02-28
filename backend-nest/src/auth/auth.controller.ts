import { Body, Controller, Get, Patch, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body() body: any) {
        let { email, password } = body;
        email = email?.trim() || '';
        password = password?.trim() || '';

        console.log('Login attempt:', { email, password });
        const user = await this.authService.findByEmail(email);

        console.log('User found in DB:', user);

        // Replace with real bcrypt logic if hashed. Here we just assume plain or simple validation for this demo, 
        // since the frontend mock had "123456" for admin@ibrc.com.br.
        // We will do a simple check or allow if matched.
        // Also note that IBRC-DB.sql has no inserted users by default, so we might need to handle that or let register handle it.
        if (user && user.password === password) {
            console.log('Password matched!');
            return {
                success: true,
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    role: user.role,
                },
                accessToken: 'real_access_token_' + user.id,
                refreshToken: 'real_refresh_token_' + user.id,
            };
        }

        console.log('Throwing 401 Unauthorized');
        throw new UnauthorizedException({ success: false, message: 'Credenciais inválidas' });
    }

    @Post('register')
    async register(@Body() userData: any) {
        const user = await this.authService.create(userData);
        return this.loginSuccessPayload(user);
    }

    @Get('profile')
    async getProfile() {
        // Return a mock profile or decode from JWT
        return { success: true, data: { name: 'Admin IBRC' } };
    }

    @Patch('profile')
    async updateProfile(@Body() userData: any) {
        if (!userData.id && !userData.email) {
            return { success: false, message: 'ID ou Email necessários' };
        }
        let user: any;
        if (userData.id) user = await this.authService.findById(userData.id);
        else user = await this.authService.findByEmail(userData.email);

        if (user) {
            const updated = await this.authService.update(user.id, userData);
            return { success: true, data: updated };
        }
        return { success: false, message: 'Usuário não encontrado' };
    }

    @Post('logout')
    async logout() {
        return { success: true };
    }

    @Post('refresh')
    async refresh() {
        return { success: true, accessToken: 'new_token_' + Date.now() };
    }

    private loginSuccessPayload(user: any) {
        return {
            success: true,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
            },
            accessToken: 'real_access_token_' + user.id,
            refreshToken: 'real_refresh_token_' + user.id,
        };
    }
}
