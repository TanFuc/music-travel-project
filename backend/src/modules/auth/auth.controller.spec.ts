import { AuthController } from './auth.controller';
describe('AuthController', () => {
  let controller: AuthController;
  const authService = {
    login: jest.fn(),
  };
  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AuthController(authService as any);
  });
  it('logs in with POST credentials', async () => {
    authService.login.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresIn: 86400,
      user: {
        id: 1,
        phoneNumber: '0901234567',
        fullName: 'Admin User',
        email: 'admin@maichohanhtinhxanh.com',
        role: 'ADMIN',
      },
    });
    const result = await controller.login({
      phoneNumber: '0901234567',
      password: 'password123',
    });
    expect(authService.login).toHaveBeenCalledWith({
      phoneNumber: '0901234567',
      password: 'password123',
    });
    expect(result.accessToken).toBe('access-token');
    expect(result.user.role).toBe('ADMIN');
  });
});
