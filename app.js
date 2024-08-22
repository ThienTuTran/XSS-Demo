const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const cookieParser = require('cookie-parser');

const app = express();

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
        if (username === "admin" && password === "password") {
            return done(null, {id: 1, name: "admin"});
        } else {
            return done(null, false);
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
        res.redirect('/profile');
    }
);

app.get('/profile', (req, res) => {
    if (req.isAuthenticated()) {
        res.send(`Logged in as ${req.user.name} <a href="/logout">Logout</a>`);
    } else {
        res.redirect('/login');
    }
});

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

app.get('/reflect', (req, res) => {
    let input = req.query.input || 'Hello, type something...';
    res.send(`Input was: ${input}`);
});

// Start the server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));

