import prisma from '../config/db';
import { User } from '@prisma/client';

export const findByEmail = async (email: string): Promise<User | null> => {
    return prisma.user.findUnique({
        where: { email },
    });
};

export const findById = async (id: string): Promise<User | null> => {
    return prisma.user.findUnique({
        where: { id },
    });
};

export const create = async (data: {
    email: string;
    password: string;
    displayName?: string;
}): Promise<User> => {
    return prisma.user.create({
        data,
    });
};
