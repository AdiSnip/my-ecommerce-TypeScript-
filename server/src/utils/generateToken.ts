import User from '../models/user.model';


/**
 * @description Generates both Access and Refresh tokens for a user and saves the Refresh token to the DB
 * @param {string} userId - The MongoDB ObjectId of the user
 * @returns {Promise<{accessToken: string, refreshToken: string}>}
 */
export const generateAccessAndRefreshTokens = async (userId: string) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new Error("User not found");
        }

        // Methods defined in the User Schema
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // Persist refresh token in DB to enable token rotation/revocation
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        // Log locally and propagate error to the controller
        throw error;
    }
}