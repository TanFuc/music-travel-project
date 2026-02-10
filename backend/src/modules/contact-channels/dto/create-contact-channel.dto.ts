import { IsEnum, IsString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';
import { ContactChannelType } from '../enums/contact-channel.enum';

export class CreateContactChannelDto {
    @IsEnum(ContactChannelType)
    type: ContactChannelType;

    @IsString()
    label: string;

    @IsString()
    value: string; // Phone number, Zalo ID, Messenger link, etc.

    @IsOptional()
    @IsString()
    icon?: string;

    @IsOptional()
    @IsString()
    colorCode?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    displayOrder?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
