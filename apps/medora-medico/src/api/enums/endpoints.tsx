export const Endpoints = {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    FORGOT_PWD: '/auth/forgot-password',
    RESET_PWD: '/auth/reset-password',
    LOGOUT: '/auth/logout',

    INIT_MFA: '/mfa/',
    VERIFY_AUTH_CODE: '/mfa/auth/verify',

    USE_BACKUP_CODE: '/backup-code/use',

    REGISTER_DOCTOR: '/doctors/register',

    GET_DOCTOR_PROFILE: '/doctors/profile',
    UPDATE_DOCTOR_PROFILE: '/doctors/profile',

    DAILY_SCHEDULE: '/doctors/availability/daily',
    RECURRING_SCHEDULE: '/doctors/availability/recurring',
    SPECIFIC_AVAILABILITY: '/doctors/availability/specific',
    SCHEDULE_BLOCKS: '/doctors/availability/blocks',
} as const;