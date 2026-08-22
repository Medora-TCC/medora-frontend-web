export const Endpoints = {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',

    INIT_MFA: '/mfa/',
    VERIFY_CODE: '/mfa/verify',

    REGISTER_DOCTOR: '/doctors/register',

    GET_DOCTOR_PROFILE: '/doctors/profile',
    UPDATE_DOCTOR_PROFILE: '/doctors/profile',

    DAILY_SCHEDULE: '/api/doctors/availability/daily',
    RECURRING_SCHEDULE: '/api/doctors/availability/recurring',
    SPECIFIC_AVAILABILITY: '/api/doctors/availability/specific',
    SCHEDULE_BLOCKS: '/api/doctors/availability/blocks',
} as const;