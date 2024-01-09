import express from 'express';
import bcrypt from 'bcrypt'; // Import bcrypt properly
const session = require ("express-session")
const flash = require ("express-flash")

const app = express();
// import { pool } from '../dbConfig.js';
const PORT = process.env.PORT || 4000;
app.use(session({
    secret:'secret', 
    resave: false,

    saveUninitialized: false
}));

app.use(flash())

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

//Routes
app.get("/", (req, res) => {
    res.render("index");
});

app.get("/users/register", (req, res) => {
    res.render('register');
});

app.get("/users/login", (req, res) => {
    res.render('login');
});

app.get("/users/dashboard", (req, res) => {
    res.render('dashboard', { user: "Mike" });
});

app.post("/users/register", async (req, res) => {
    let { name, email, password, password1 } = req.body;
    console.log({ name, email, password, password1 });

    let errors = [];

    if (!name || !email || !password || !password1) {
        errors.push({ message: "Please enter all the fields" });
    }

    if (password.length < 6) {
        errors.push({ message: "Password should be at least six characters long" });
    }

    if (password !== password1) {
        errors.push({ message: "Passwords do not match" });
    }

    if (errors.length > 0) {
        res.render('register', { errors, name, email, password, password1 });
    } else {
        try {
            const hashedPassword = await bcrypt.hash(password, 10); 

            pool.query(
                `SELECT * FROM users WHERE email = $1`,
                [email],
                (err, results) => {
                    if (err) {
                        throw err;
                    }
                    if (results.rows.length === 0) {
                        pool.query(
                            `INSERT INTO users (name, email, password) VALUES ($1, $2, $3)`,
                            [name, email, hashedPassword],
                            (err, results ) => {
                                if (err) {
                                    throw err;
                                }
                                req.flash("success_msg", "You are registered")
                                res.redirect("./users/login")
                            }
                        );
                    } else {
                       errors.push('Email already exists!'); 
                    }
                }
            );
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});