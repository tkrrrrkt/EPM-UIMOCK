import type { KpiCardStatus } from '../enums';
export interface KpiCardDto {
    subjectId: string;
    subjectName: string;
    budget: number;
    actual: number;
    forecast: number;
    achievementRate: number;
    status: KpiCardStatus;
    variance: number;
    varianceRate: number;
    unit?: string;
    formatType?: 'currency' | 'percentage' | 'number';
}
