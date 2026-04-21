import { z } from 'zod';
export const SingingExperience = {
  NONE: 'NONE',
  HOBBY: 'HOBBY',
  SEMI_PROFESSIONAL: 'SEMI_PROFESSIONAL',
  PROFESSIONAL: 'PROFESSIONAL',
} as const;
export const SingerPackage = {
  BM_V1: 'BM_V1',
  BM_V2: 'BM_V2',
} as const;
export const singerRegistrationSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Họ tên phải có ít nhất 2 ký tự')
      .max(100, 'Họ tên không được vượt quá 100 ký tự')
      .regex(/^[a-zA-ZÀ-ỹ\s]+$/, 'Họ tên chỉ được chứa chữ cái và khoảng trắng'),
    phoneNumber: z
      .string()
      .min(10, 'Số điện thoại phải có ít nhất 10 số')
      .max(15, 'Số điện thoại không được vượt quá 15 số')
      .regex(/^[0-9+\-\s()]+$/, 'Số điện thoại không hợp lệ'),
    email: z.string().email('Email không hợp lệ').max(100, 'Email không được vượt quá 100 ký tự'),
    age: z.number().min(16, 'Tuổi phải từ 16 trở lên').max(80, 'Tuổi không được vượt quá 80'),
    gender: z.enum(['Nam', 'Nữ', 'Khác'], {
      errorMap: () => ({ message: 'Vui lòng chọn giới tính' }),
    }),
    address: z
      .string()
      .min(10, 'Địa chỉ phải có ít nhất 10 ký tự')
      .max(255, 'Địa chỉ không được vượt quá 255 ký tự'),
    singingExperience: z.enum(
      [
        SingingExperience.NONE,
        SingingExperience.HOBBY,
        SingingExperience.SEMI_PROFESSIONAL,
        SingingExperience.PROFESSIONAL,
      ] as const,
      {
        errorMap: () => ({ message: 'Vui lòng chọn mức độ kinh nghiệm' }),
      }
    ),
    favoriteGenre: z
      .string()
      .min(2, 'Thể loại yêu thích phải có ít nhất 2 ký tự')
      .max(100, 'Thể loại yêu thích không được vượt quá 100 ký tự'),
    package: z
      .enum([SingerPackage.BM_V1, SingerPackage.BM_V2] as const, {
        errorMap: () => ({ message: 'Vui lòng chọn gói đăng ký' }),
      })
      .optional(),
    packageTemplateId: z.string().uuid('ID gói đăng ký không hợp lệ').optional(),
    introduction: z.string().max(1000, 'Giới thiệu không được vượt quá 1000 ký tự').optional(),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: 'Bạn phải đồng ý với các điều khoản và điều kiện',
    }),
  })
  .refine((data) => data.package || data.packageTemplateId, {
    message: 'Vui lòng chọn gói đăng ký',
    path: ['packageTemplateId'],
  });
export type SingerRegistrationFormData = z.infer<typeof singerRegistrationSchema>;
export const getSingingExperienceLabel = (experience: keyof typeof SingingExperience): string => {
  const labels = {
    NONE: 'Chưa có kinh nghiệm',
    HOBBY: 'Hát theo sở thích',
    SEMI_PROFESSIONAL: 'Bán chuyên nghiệp',
    PROFESSIONAL: 'Chuyên nghiệp',
  };
  return labels[experience];
};
export const getPackageLabel = (pkg: keyof typeof SingerPackage): string => {
  const labels = {
    BM_V1: 'Gói Bm-V1 - Khởi đầu hành trình ca sĩ',
    BM_V2: 'Gói Bm-V2 - Phát triển & tỏa sáng',
  };
  return labels[pkg];
};
export const getPackagePrice = (pkg: keyof typeof SingerPackage): string => {
  const prices = {
    BM_V1: '2.000.000 VNĐ',
    BM_V2: '10.000.000 VNĐ',
  };
  return prices[pkg];
};
