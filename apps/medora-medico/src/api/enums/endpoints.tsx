export const Endpoints = {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    FORGOT_PWD: '/auth/forgot-password',
    RESET_PWD: '/auth/reset-password',
    LOGOUT: '/auth/logout',
  
    VERIFY_EMAIL: '/mfa/config/authenticator/verify-email',
    RESEND_EMAIL_VERIFICATION: '/mfa/config/authenticator/resend-email',

    INIT_MFA: '/mfa/',
    VERIFY_MFA: '/mfa/verify',
    CONFIGURE_AUTHENTICATOR: '/mfa/config/authenticator',
    VERIFY_AUTHENTICATOR: '/mfa/config/authenticator/verify',
    VERIFY_AUTH_CODE: '/mfa/auth/verify',

    USE_BACKUP_CODE: '/recovery-codes/use',
    CREATE_BACKUP_CODES: '/recovery-codes/create',

    REGISTER_DOCTOR: '/v1/Doctor',

    GET_DOCTOR_PROFILE: '/doctors/profile',
    UPDATE_DOCTOR_PROFILE: '/doctors/profile',

    DAILY_SCHEDULE: '/doctors/availability/daily',
    RECURRING_SCHEDULE: '/doctors/availability/recurring',
    SPECIFIC_AVAILABILITY: '/doctors/availability/specific',
    SCHEDULE_BLOCKS: '/doctors/availability/blocks',
    
    GET_DOCTOR_RQES: '/v1/Doctor/me/rqes',
    UPDATE_RQE_PRIORITIES: '/v1/Doctor/me/rqes/priorities',
    GET_DASHBOARD_DOCTOR: '/v1/Doctor/me/dashboard',
    GET_WEEK_FLOW: '/v1/Doctor/me/dashboard/weekly-flow',
    DOCTOR_APPOINTMENTS: '/appointments/doctor/me',
    APPOINTMENT_STATUS: (appointmentId: number) => `/appointments/${appointmentId}/status`,
    CONFIRM_TELECONSULTATION: (appointmentId: number) => `/appointments/${appointmentId}/confirm`,
    REJECT_TELECONSULTATION: (appointmentId: number) => `/appointments/${appointmentId}/reject`,

    MEDICAL_RECORD_BY_APPOINTMENT: (appointmentId: number) => `/appointments/${appointmentId}/medical-record`,
    FINALIZE_MEDICAL_RECORD: (id: number) => `/medical-records/${id}/finalize`,
    MEDICAL_RECORD_PDF: (id: number) => `/medical-records/${id}/pdf`,

    ISSUE_PRESCRIPTION: (medicalRecordId: number) => `/medical-records/${medicalRecordId}/prescriptions`,
    PRESCRIPTION_PDF: (publicId: string) => `/prescriptions/${publicId}/pdf`,
} as const;