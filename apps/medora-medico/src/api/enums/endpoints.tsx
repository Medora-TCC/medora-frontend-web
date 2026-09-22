export const Endpoints = {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',

    INIT_MFA: '/mfa/',
    VERIFY_CODE: '/mfa/verify',

    REGISTER_DOCTOR: '/v1/Doctor',

    GET_DOCTOR_PROFILE: '/doctors/profile',
    UPDATE_DOCTOR_PROFILE: '/doctors/profile',

    DAILY_SCHEDULE: '/doctors/availability/daily',
    RECURRING_SCHEDULE: '/doctors/availability/recurring',
    SPECIFIC_AVAILABILITY: '/doctors/availability/specific',
    SCHEDULE_BLOCKS: '/doctors/availability/blocks',
    VERIFY_EMAIL: '/mfa/config/authenticator/verify-email',
    RESEND_EMAIL_VERIFICATION: '/mfa/config/authenticator/resend-email',    
} as const;