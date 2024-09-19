import { checkSchema } from "express-validator"
 const registrationValidationSchema = checkSchema({

    password: {
        isString: true,
        notEmpty: true,
        errorMessage: 'invalid password',
        isLength: {
            options: { min: 3 },
            errorMessage: 'Password should be at least 8 chars',
          },
          matches: {
            options: [/^[a-zA-Z0-9 .,'!&]+$/],
            errorMessage: 'Use banned symbols'
          }
    },
    email: {
        isString: true,
        isEmail: true,
        notEmpty: true,
        errorMessage: 'invalid email',
        matches: {
            options: [/^[a-zA-Z0-9 .,'!&]+$/],
            errorMessage: 'Use banned symbols'
          }
    },
})
const loginValidationSchema = checkSchema({
    email: {
        isEmail: true,
        isString: true,
        notEmpty: true,
        errorMessage: 'invalid email',
        matches: {
            options: [/^[a-zA-Z0-9 .,'!&]+$/],
            errorMessage: 'Use banned symbols'
          }
    },
    password: {
        isString: true,
        notEmpty: true,
        errorMessage: 'invalid password',
        matches: {
            options: [/^[a-zA-Z0-9 .,'!&]+$/],
            errorMessage: 'Use banned symbols'
          }
    },
})
export  {loginValidationSchema, registrationValidationSchema}