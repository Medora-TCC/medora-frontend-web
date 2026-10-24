export const Endpoints = {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    FORGOT_PWD: '/auth/forgot-password',
    RESET_PWD: '/auth/reset-password',
    LOGOUT: '/auth/logout',
  
    VERIFY_EMAIL: '/mfa/config/authenticator/verify-email',
    RESEND_EMAIL_VERIFICATION: '/mfa/config/authenticator/resend-email',

    INIT_MFA: '/mfa/',
    VERIFY_AUTH_CODE: '/mfa/auth/verify',

    USE_BACKUP_CODE: '/backup-code/use',

    REGISTER_DOCTOR: '/v1/Doctor',

    GET_DOCTOR_PROFILE: '/doctors/profile',
    UPDATE_DOCTOR_PROFILE: '/doctors/profile',

    DAILY_SCHEDULE: '/doctors/availability/daily',
    RECURRING_SCHEDULE: '/doctors/availability/recurring',
    SPECIFIC_AVAILABILITY: '/doctors/availability/specific',
    SCHEDULE_BLOCKS: '/doctors/availability/blocks',  

    ICE_SERVERS: '/api/telemedicine/ice-servers',
    TELEMEDICINE_HUB: '/hubs/telemedicine',
    
    GET_DOCTOR_RQES: '/v1/Doctor/me/rqes',
    UPDATE_RQE_PRIORITIES: `/v1/Doctor/me/rqes/priorities`,

    DOCTOR_APPOINTMENTS: "/appointments/doctor/me",
    GET_DASHBOARD_DOCTOR: '/v1/Doctor/me/dashboard',
    GET_WEEK_FLOW: '/v1/Doctor/me/dashboard/weekly-flow',

    MEDICAL_RECORD_BY_APPOINTMENT: (appointmentId: number) => `/appointments/${appointmentId}/medical-record`,
    FINALIZE_MEDICAL_RECORD: (id: number) => `/medical-records/${id}/finalize`,
    MEDICAL_RECORD_PDF: (id: number) => `/medical-records/${id}/pdf`,
} as const;