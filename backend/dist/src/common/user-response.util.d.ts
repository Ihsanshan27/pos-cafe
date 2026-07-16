type UserLike = Record<string, unknown> & {
    password?: string;
};
export declare function sanitizeUser<T extends UserLike>(user: T): Omit<T, 'password'>;
export {};
