export const Endpoints = {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',

    INIT_MFA: '/mfa/',
    VERIFY_CODE: '/mfa/verify',

    REGISTER_DOCTOR: '/doctors/register',

    GET_DOCTOR_PROFILE: '/doctors/profile',
    UPDATE_DOCTOR_PROFILE: '/doctors/profile',

    DAILY_SCHEDULE: '/doctors/availability/daily',
    RECURRING_SCHEDULE: '/doctors/availability/recurring',
    SPECIFIC_AVAILABILITY: '/doctors/availability/specific',
    SCHEDULE_BLOCKS: '/doctors/availability/blocks',
} as const;