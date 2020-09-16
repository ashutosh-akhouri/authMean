const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
var jwt = require('jsonwebtoken');
var ejwt = require('express-jwt');

// DON'T HARDCODE connection string here, read it from process.env
const connectionString = "mongodb+srv://bz:bz@cluster0-li9qp.mongodb.net/meanauth1?retryWrites=true&w=majority";
const dbOptions = { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true, auto_reconnect: true };
mongoose.connect(connectionString, dbOptions);
mongoose.connection.on('connected', function () {
    console.log("Connected to DB");
});
mongoose.connection.on('error', function (err) {
    console.log("Error while connecting to DB: " + err);
});

const app = express();
app.use(express.static(__dirname + '/dist/meanAuth'));
app.use(express.json());
app.use(cors());

const { OAuth2Client } = require('google-auth-library');
const { stringify } = require('querystring');
const client = new OAuth2Client('562036829081-rr70prvp4fe55vjb1m6iui5l4ep9ha7l.apps.googleusercontent.com');
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: '562036829081-rr70prvp4fe55vjb1m6iui5l4ep9ha7l.apps.googleusercontent.com',  // Specify the CLIENT_ID of the app that accesses the backend
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];

    return payload;
}


var userSchema = new mongoose.Schema({
    email: String,
    google: {
        id: String,
        photoUrl: String,
        name: String
    },
    facebook: {
        id: String,
        photoUrl: String,
        name: String
    }
})

// instance methods
userSchema.methods.genToken = function () {
    var token = jwt.sign({
        name: this.google.name,
        email: this.email,
        photoUrl: this.google.photoUrl,
        role: 'Normal'
    }, 'SECRET....SHHH', { expiresIn: '1d' });

    return token;
}

var User = mongoose.model('User', userSchema);

app.post('/api/login/google', async (req, res) => {
    // console.log(req.body);
    try {
        let payload = await verify(req.body.token);
        console.log(JSON.stringify(payload));

        let user = await User.findOne({ email: payload.email });
        if (!user) {
            console.log("User not found");
            var newUser = new User(
                { email: payload.email, google: { id: payload.sub, name: payload.name, photoUrl: payload.picture } }
            );
            user = await newUser.save();
            console.log("User saved in db");
        }
        var jwToken = user.genToken();
        res.json({ msg: "Okay", token: jwToken });
    } catch (e) {
        console.log('Err while g verify ' + e);
        res.status(401).json({ msg: "Noooo" });
    }
})

// check for token and if token is valid, then allow
app.use(ejwt({secret: 'SECRET....SHHH', algorithms:['HS256']}));
app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send('invalid token...');
    }
});

app.get('/api/profile', (req, res) => {
    res.json({ profile: "You are able to access" });
})


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log("Server started...") });