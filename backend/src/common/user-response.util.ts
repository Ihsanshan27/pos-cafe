type UserLike = Record<string, unknown> & {
  password?: string;
};

export function sanitizeUser<T extends UserLike>(user: T): Omit<T, 'password'> {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}
