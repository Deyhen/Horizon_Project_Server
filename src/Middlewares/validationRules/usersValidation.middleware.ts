import { checkSchema } from 'express-validator'
const registrationValidationSchema = checkSchema({
  password: {
    isString: true,
    notEmpty: true,
    errorMessage: 'invalid password',
    isLength: {
      options: { min: 3 },
      errorMessage: 'Password should be at least 3 chars',
    },
    matches: {
      options: [/^[\p{L}\p{M}\p{Nd}\p{Pc}\p{Join_C}_-]+$/gu],
      errorMessage: 'Use banned symbols',
    },
  },
  username: {
    isString: true,
    notEmpty: true,
    errorMessage: 'invalid username',
    matches: {
      options: [/^[\p{L}\p{M}\p{Nd}\p{Pc}\p{Join_C}_-]+$/gu],
      errorMessage: 'Use banned symbols',
    },
  },
  email: {
    isString: true,
    isEmail: true,
    notEmpty: true,
    errorMessage: 'invalid email',
    matches: {
      options: [/^[\p{L}\p{M}\p{Nd}\p{Pc}\p{Join_C}@._-]+$/gu],
      errorMessage: 'Use banned symbols',
    },
  },
})
const loginValidationSchema = checkSchema({
  username: {
    isString: true,
    notEmpty: true,
    errorMessage: 'invalid username',
    matches: {
      options: [/^[\p{L}\p{M}\p{Nd}\p{Pc}\p{Join_C}_-]+$/gu],
      errorMessage: 'Use banned symbols',
    },
  },
  password: {
    isString: true,
    notEmpty: true,
    errorMessage: 'invalid password',
    matches: {
      options: [/^[\p{L}\p{M}\p{Nd}\p{Pc}\p{Join_C}_-]+$/gu],
      errorMessage: 'Use banned symbols',
    },
  },
})
const changeUsernameValidationSchema = checkSchema({
  username: {
    isString: true,
    notEmpty: true,
    errorMessage: 'invalid username',
    matches: {
      options: [/^[\p{L}\p{M}\p{Nd}\p{Pc}\p{Join_C}_-]+$/gu],
      errorMessage: 'Use banned symbols',
    },
  },
})
const changePasswordValidationSchema = checkSchema({
  password: {
    isString: true,
    notEmpty: true,
    errorMessage: 'invalid password',
    matches: {
      options: [/^[\p{L}\p{M}\p{Nd}\p{Pc}\p{Join_C}_-]+$/gu],
      errorMessage: 'Use banned symbols',
    },
  },
})
export {
  loginValidationSchema,
  registrationValidationSchema,
  changePasswordValidationSchema,
  changeUsernameValidationSchema,
}
