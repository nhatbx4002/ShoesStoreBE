import prisma from "../libs/prisma.js";

export const findByEmail = async (email) => {
    return await prisma.user.findUnique({
        where: {
            email: email,
        },
    });
}

export const create = async ({name , email , passwordHash , role = 'USER'}) => {
    return await prisma.user.create({
        data:{
            name , 
            email ,
            passwordHash ,
            role
        }
    })
}

