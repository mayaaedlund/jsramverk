import dotenv from 'dotenv';
import database from "../database.mjs";
import hat from "hat";
import validator from "email-validator";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pkg from 'uuid';
const { v4: uuidv4 } = pkg;


dotenv.config();


const jwtSecret = process.env.JWT_SECRET;
const API_KEY = process.env.API_KEY;  // Lägg till detta för att läsa från .env


const auth = {
    checkAPIKey: function (req, res, next) {
        if ( req.path == '/') {
            return next();
        }

        if ( req.path == '/api_key') {
            return next();
        }

        if ( req.path == '/api_key/confirmation') {
            return next();
        }

        if ( req.path == '/api_key/deregister') {
            return next();
        }

        auth.isValidAPIKey(req.query.api_key || req.body.api_key, next, req.path, res);
    },

    isValidAPIKey: async function(apiKey, next, path, res) {
        try {
            const db = await database.getDb();

            const filter = { key: apiKey || API_KEY };

            const keyObject = await db.collection.findOne(filter);

            if (keyObject) {
                await db.client.close();

                return next();
            }

            return res.status(401).json({
                errors: {
                    status: 401,
                    source: path,
                    title: "Valid API key",
                    detail: "No valid API key provided."
                }
            });
        } catch (e) {
            return res.status(500).json({
                errors: {
                    status: 500,
                    source: path,
                    title: "Database error",
                    detail: e.message
                }
            });
        }
    },

    getNewAPIKey: async function(res, email) {
        let data = {
            apiKey: ""
        };

        if (email === undefined || !validator.validate(email)) {
            data.message = "A valid email address is required to obtain an API key.";
            data.email = email;

            return res.render("api_key/form", data);
        }

        try {
            const db = await database.getDb();

            const filter = { email: email };

            const keyObject = await db.collection.findOne(filter);

            if (keyObject) {
                data.apiKey = keyObject.key;

                return res.render("api_key/confirmation", data);
            }

            return auth.getUniqueAPIKey(res, email, db);
        } catch (e) {
            data.message = "Database error: " + e.message;
            data.email = email;

            return res.render("api_key/form", data);
        }
    },

    getUniqueAPIKey: async function(res, email, db) {
        const apiKey = hat();
        let data = {
            apiKey: ""
        };

        try {
            const filter = { key: apiKey };

            const keyObject = await db.collection.findOne(filter);

            if (!keyObject) {
                return await auth.insertApiKey(
                    res,
                    email,
                    apiKey,
                    db
                );
            }

            return await auth.getUniqueAPIKey(res, email, db);
        } catch (e) {
            data.message = "Database error: " + e.message;
            data.email = email;

            return res.render("api_key/form", data);
        }
    },

    insertApiKey: async function(res, email, apiKey, db) {
        let data = {};

        try {
            data.apiKey = apiKey;

            const doc = { email: email, key: apiKey };

            await db.collection.insertOne(doc);

            return res.render("api_key/confirmation", data);
        } catch (e) {
            data.message = "Database error: " + e.message;
            data.email = email;

            return res.render("api_key/form", data);
        } finally {
            await db.client.close();
        }
    },

    deregister: async function(res, body) {
        const email = body.email;
        const apiKey = body.apikey;

        try {
            const db = await database.getDb();

            const filter = { key: apiKey, email: email };

            const keyObject = await db.collection.findOne(filter);

            if (keyObject) {
                return await auth.deleteData(res, apiKey, email, db);
            } else {
                let data = {
                    message: "The E-mail and API-key combination does not exist.",
                    email: email,
                    apikey: apiKey
                };

                await db.client.close();

                return res.render("api_key/deregister", data);
            }
        } catch (e) {
            let data = {
                message: "Database error: " + e.message,
                email: email,
                apikey: apiKey
            };

            return res.render("api_key/deregister", data);
        }
    },

    deleteData: async function(res, apiKey, email, db) {
        try {
            const filter = { key: apiKey, email: email };

            await db.collection.deleteOne(filter);

            let data = {
                message: "All data has been deleted",
                email: "",
            };

            return res.render("api_key/form", data);
        } catch (e) {
            let data = {
                message: "Could not delete data due to: " + e.message,
                email: email,
                apikey: apiKey
            };

            return res.render("api_key/deregister", data);
        } finally {
            await db.client.close();
        }
    },

    login: async function(res, body) {
        const email = body.email;
        const password = body.password;
        const apiKey = body.api_key;
    
        if (!email || !password) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "/login",
                    title: "Email or password missing",
                    detail: "Email or password missing in request"
                }
            });
        }
    
        let db;
    
        try {
            db = await database.getDb();
    
            const filter = { key: apiKey };
            const userRecord = await db.collection.findOne(filter);
    
            if (userRecord) {
                // Hitta användaren baserat på e-post
                const user = userRecord.users.find(u => u.email === email);
    
                if (user) {
                    return auth.comparePasswords(res, password, user);
                }
            }
    
            // Om användaren inte hittas
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "/login",
                    title: "User not found",
                    detail: "User with provided email not found."
                }
            });
        } catch (e) {
            return res.status(500).json({
                errors: {
                    status: 500,
                    source: "/login",
                    title: "Database error",
                    detail: e.message
                }
            });
        } finally {
            await db.client.close();
        }
    },
    

    comparePasswords: async function(res, inputPassword, user) {
        try {
            console.log("Input password:", inputPassword); // Logga det inskickade lösenordet
            console.log("User object:", user); // Logga hela användarobjektet
            console.log("Stored hashed password:", user.password); // Logga det hashade lösenordet från databasen
    
            // Jämför det angivna lösenordet med det sparade hashade lösenordet
            const match = await bcrypt.compare(inputPassword, user.password);
            console.log("Password match result:", match); // Logga om lösenorden matchar eller inte
    
            if (match) {
                // Lösenorden matchar, returnera framgångsmeddelande
                console.log("Passwords match. User successfully logged in."); // Bekräfta matchning
                return res.status(200).json({
                    data: {
                        message: "User successfully logged in.",
                        user_id: user._id,
                        email: user.email
                    }
                });
            } else {
                // Lösenorden matchar inte
                console.log("Passwords do not match."); // Indikera att lösenorden inte stämde
                return res.status(401).json({
                    errors: {
                        status: 401,
                        source: "/login",
                        title: "Authentication failed",
                        detail: "Invalid password."
                    }
                });
            }
        } catch (err) {
            // Fel uppstod vid jämförelsen
            console.error("Error during password comparison:", err.message); // Logga felet
            return res.status(500).json({
                errors: {
                    status: 500,
                    source: "/login",
                    title: "bcrypt error",
                    detail: err.message
                }
            });
        }
    },
    

    register: async function(res, body) {
        const email = body.email;
        const password = body.password;
        const apiKey = body.api_key;
    
        if (!email || !password) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "/register",
                    title: "Email or password missing",
                    detail: "Email or password missing in request"
                }
            });
        }
    
        bcrypt.hash(password, 10, async function(err, hash) {
            if (err) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        source: "/register",
                        title: "bcrypt error",
                        detail: "bcrypt error"
                    }
                });
            }
    
            let db;
    
            try {
                db = await database.getDb();
    
                let filter = { key: apiKey };
                let updateDoc = {
                    $push: {
                        users: {
                            email: email,
                            password: hash,
                        }
                    }
                };
    
                const result = await db.collection.updateOne(filter, updateDoc);
                
                // Hämta användaren och returnera med användarens id (_id)
                const user = await db.collection.findOne(filter);
                const newUser = user.users.find(u => u.email === email); // Hitta användaren baserat på email
    
                // Skicka tillbaka användaren med deras ID
                return res.status(201).json({
                    data: {
                        message: "User successfully registered.",
                        user_id: newUser._id,  // Använd MongoDB's _id här
                        email: newUser.email
                    }
                });
            } catch (e) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        source: "/register",
                        title: "Database error",
                        detail: err.message
                    }
                });
            } finally {
                await db.client.close();
            }
        });
    },
    

    checkToken: function(req, res, next) {
        let token = req.headers['x-access-token'];
        let apiKey = req.query.api_key || req.body.api_key;

        if (token) {
            jwt.verify(token, jwtSecret, function(err, decoded) {
                if (err) {
                    return res.status(401).json({
                        errors: {
                            status: 401,
                            source: "/api",
                            title: "Invalid token",
                            detail: "The provided token is invalid."
                        }
                    });
                } else {
                    req.user = decoded;
                    next();
                }
            });
        } else {
            return res.status(403).json({
                errors: {
                    status: 403,
                    source: "/api",
                    title: "No token provided",
                    detail: "No token provided"
                }
            });
        }
    }
};

export default auth;
