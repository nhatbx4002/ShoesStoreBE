import bcrypt from "bcrypt";
import { create as createUser, findByEmail } from "../repositories/UserRepository.js";
import { create as createRefreshToken, findByToken, deleteByToken } from "../repositories/RefreshTokenRepository.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/tokenUtils.js";
import prisma from "../libs/prisma.js";

const EXPIRES_IN_7_DAYS = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

export const register = async ({ name, email, password }) => {
    // 1. Check user exists
    const existingUser = await findByEmail(email);
    if (existingUser) {
        throw new Error('User already exists');
    }

    // 2. Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Create user
    const user = await createUser({ name, email, passwordHash });

    // 4. Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 5. Save refreshToken to DB
    await createRefreshToken({ token: refreshToken, userId: user.id, expiresAt: EXPIRES_IN_7_DAYS });

    // 6. Return user without password
    const { passwordHash: _, ...userWithoutPassword } = user;
    return { accessToken, refreshToken, user: userWithoutPassword };
}

export const login = async ({ email, password }) => {
    // 1. Find user
    const user = await findByEmail(email);
    if (!user) {
        throw new Error('Invalid credentials');
    }

    // 2. Compare password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
        throw new Error('Invalid credentials');
    }

    // 3. Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 4. Save refreshToken to DB
    await createRefreshToken({ token: refreshToken, userId: user.id, expiresAt: EXPIRES_IN_7_DAYS });

    // 5. Return user without password
    const { passwordHash: _, ...userWithoutPassword } = user;
    return { accessToken, refreshToken, user: userWithoutPassword };
}

export const refresh = async ({ refreshToken }) => {
    // 1. Verify refreshToken signature
    const decoded = verifyRefreshToken(refreshToken);

    // 2. Check refreshToken exists in DB
    const storedToken = await findByToken(refreshToken);
    if (!storedToken) {
        throw new Error('Invalid refresh token');
    }

    // 3. Check if expired
    if (new Date() > storedToken.expiresAt) {
        await deleteByToken(refreshToken);
        throw new Error('Refresh token expired');
    }

    // 4. Find user
    const user = await findByEmailById(decoded.userId);
    if (!user) {
        throw new Error('User not found');
    }

    // 5. Delete old refreshToken
    await deleteByToken(refreshToken);

    // 6. Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // 7. Save new refreshToken to DB
    await createRefreshToken({ token: newRefreshToken, userId: user.id, expiresAt: EXPIRES_IN_7_DAYS });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

export const logout = async ({ refreshToken }) => {
    // Delete refreshToken from DB
    await deleteByToken(refreshToken);
    return { message: 'Logged out successfully' };
}

// Helper function to find user by ID
const findByEmailById = async (userId) => {
    return prisma.user.findUnique({ where: { id: userId } });
}
