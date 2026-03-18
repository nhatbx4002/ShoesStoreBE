import prisma from "../libs/prisma.js";

export const create = async({token , userId , expiresAt}) => {
    return await prisma.refreshToken.create({
        data:{
            token ,
            userId ,
            expiresAt
        }
    })
}

export const findByToken = async (token) => {
    return await prisma.refreshToken.findUnique({
        where: {
            token: token,
        },
    });
}

export const deleteByUserId = async (userId) => {
    return await prisma.refreshToken.deleteMany({
        where: {
            userId: userId,
        },
    });
}

export const deleteByToken = async (token) => {
    return await prisma.refreshToken.delete({
        where: {
            token: token,
        },
    });
}