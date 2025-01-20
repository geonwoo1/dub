export const RESPONSE = {
    APP: {
        STATUS: {
            SUCCESS: 1,
            FAILED: -1
        }
    },
    AUTH: {
        STATUS: {
            UNAUTHORIZED: -999,
            NOT_VALID: -333,
            NOT_MATCH_TOKEN: -444,
            NOT_FOUND: -222,
            USER_EMAIL_ALREADY_EXIST: -10,
            WRONG_USER: -15,
        }
    },
    ORDER: {
        STATUS: {
            ALREADY_CHECKED: 2,
            BAD_REQUEST: -15,
            UNCHANGEABLE: -20,
        }
    }
}