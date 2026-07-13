import genToken from "../config/token.js"
import User from "../models/user.model.js"

/**
 * Controller: googleAuth
 * Endpoint: POST /api/auth/google
 * Purpose:
 * 1. Checks if a user already exists in the database by email.
 * 2. If the user doesn't exist, create a new record in MongoDB.
 * 3. Generate a secure JSON Web Token (JWT) containing the user's ID.
 * 4. Save the token as an HttpOnly cookie inside the browser and return user details.
 */
export const googleAuth = async (req,res) => {
    try {
        const { name, email } = req.body

        // Lookup user profile in database
        let user = await User.findOne({ email })

        // If no profile found, register them as a new user
        if(!user){
            user = await User.create({
                name, 
                email
                // Default start credits (500) will be assigned automatically by User Schema
            })
        }

        // Generate JWT token containing the user ID
        let token = await genToken(user._id)

        // Set the token inside a browser cookie named "token"
        // sameSite: "strict" blocks Cross-site Request Forgery (CSRF)
        // maxAge sets cookie life for 7 days
        res.cookie("token", token, {
            httpOnly: true, // Prevents Javascript access to protect against XSS scripting attacks
            secure: false,  // Set to true in production if running on HTTPS
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        // Respond with user details (Frontend will save this in UserContext)
        return res.status(200).json(user)

    } catch (error) {
        return res.status(500).json({ message: `Google auth error ${error}` })
    }
}

/**
 * Controller: logOut
 * Endpoint: GET /api/auth/logout
 * Purpose: Clears the JWT cookie from the user's browser to log them out.
 */
export const logOut = async (req,res) => {
    try {
        // Deletes the browser cookie named "token"
        await res.clearCookie("token")
        return res.status(200).json({ message: "LogOut Successfully" })
    } catch (error) {
         return res.status(500).json({ message: `Logout error ${error}` })
    }
}