import { z } from 'zod';

export const loginSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, 'Vui lòng nhập số điện thoại')
    .regex(/^(0|84|\+84)[0-9]{9}$/, 'Số điện thoại không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Vui lòng nhập họ tên')
      .min(2, 'Họ tên phải có ít nhất 2 ký tự')
      .max(100, 'Họ tên không được quá 100 ký tự'),
    phoneNumber: z
      .string()
      .min(1, 'Vui lòng nhập số điện thoại')
      .regex(/^(0|84|\+84)[0-9]{9}$/, 'Số điện thoại không hợp lệ'),
    email: z
      .string()
      .optional()
      .refine(
        (val) => !val || z.string().email().safeParse(val).success,
        'Email không đúng định dạng'
      ),
    password: z
      .string()
      .min(1, 'Vui lòng nhập mật khẩu')
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .regex(/[a-zA-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ cái')
      .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 số'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
