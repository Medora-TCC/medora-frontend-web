export const Endpoints = {
    REGISTER_DOCTOR: '/doctors/register',

    GET_DOCTOR_PROFILE: '/doctors/profile',
    UPDATE_DOCTOR_PROFILE: '/doctors/profile',

    GET_DAILY_AVAILABILITY: '/doctors/availability/daily',
    CREATE_DAILY_AVAILABILITY: '/doctors/availability/daily',
    DELETE_DAILY_AVAILABILITY: '/doctors/availability/daily',
    UPDATE_DAILY_AVAILABILITY_TYPE: '/doctors/availability/daily',
} as const;