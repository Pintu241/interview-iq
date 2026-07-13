import jwt from "jsonwebtoken"

/**
 * Authentication Middleware (isAuth)
 * Intercepts requests destined for protected routes (like starting interviews or checking history)
 * to verify if the requesting client is logged in and has a valid JWT token cookie.
 */
const isAuth = async (req, res, next) => {
    try {
        // Retrieve the cookie named 'token' from incoming request cookies
        let { token } = req.cookies

        // If no token cookie exists, candidate is not logged in. Block request with 401 Unauthorized.
        if (!token) {
            return res.status(401).json({ message: "user does not have a token" })
        }

        // Verify the token signature using the secret key
        const verifyToken = jwt.verify(token, process.env.JWT_SECRET)

        // If validation fails (e.g. token expired, modified, invalid), block request.
        if (!verifyToken) {
            return res.status(401).json({ message: "user does not have a valid token" })
        }

        // Token is valid! Expose the decrypted userId to subsequent controllers
        req.userId = verifyToken.userId

        // Continue execution of the request (moves on to the main controller function)
        next()

    } catch (error) {
        // Catch expired tokens or decryption errors
        return res.status(500).json({ message: `isAuth error ${error}` })
    }
}

export default isAuth