export const getClientIp = (c: any): string => {
    const forwarded = c.req.header('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    return c.req.header('cf-connecting-ip') || '127.0.0.1';
}