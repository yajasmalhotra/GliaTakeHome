import express from 'express';
import axios from 'axios';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;
const API_URL = 'http://www.boredapi.com/api/activity/';
const URI = 'mongodb+srv://admin:imbored@boredinator.wgeqqjc.mongodb.net/?retryWrites=true&w=majority'

async function connect() {
    try {
        await mongoose.connect(URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error({error: 'Could not connect to MongoDB'});
    }
}

connect();
const AccessibilityOptions = ["High", "Medium", "Low"];
const PriceOptions = ["Free", "Low", "High"];

const userSchema = new mongoose.Schema({
   name: String,
   accessibility: String,
   price: String
});

const User = mongoose.model('User', userSchema);

// app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// helper function that takes activity and returns associated accessibility label
function getAccessibilityLabel(activity) {
    if (activity.accessibility == null) {
        res.status(400).json({error: 'Accessibility value not available'});
    }

    if (activity.accessibility <= 0.25 ) {
        return "High";
    } else if (activity.price <= 0.75) {
        return "Medium";
    } else {
        return "Low";
    }
}

// helper function that takes activity and returns associated price label
function getPriceLabel(activity) {
    if (activity.price == null) {
        res.status(400).json({error: 'Price value not available'});
    }

    if (activity.price === 0) {
        return "Free";
    } else if (activity.price <= 0.5) {
        return "Low";
    } else {
        return "High";
    }
}

app.get('/', function (req, res) {
    res.redirect('/users');
})

// function getUserInfo(userName, userAccessibility, userPrice) {
//     const userName = prompt("Enter your name");
//     const userAccessibility = prompt("Choose a level of accessibility from \'low', \'medium\', and \'high\'");
//     const userPrice = prompt("Choose price from \'free', \'low\', and \'high\'");
// }

app.get('/users', function (req, res) {
    res.sendFile(__dirname + '/user.html');
})

app.post('/users', async (req, res) => {
    try {
      const { name, accessibility, price } = req.body;
      console.log(req.body);
      const user = new User({ name, accessibility, price });
      await user.save();
    //   res.status(201).json(user);
      res.redirect('/activity');
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
    
});  

// app.post('/activity', function (req, res) {
//     res.redirect('/activity');
// })

app.get('/activity', async (req, res) => {
    try {
        const newestUser = await User.findOne().sort({ createdAt: -1 }).exec();
        const newestUserAccessibilityLabel = getAccessibilityLabel(newestUser.accessibility);
        const newestUserPriceLabel = getPriceLabel(newestUser.price);

        console.log(newestUserPriceLabel);

        const response = await axios.get(API_URL);
        const activity = response.data;

        // modifies accessibility field in JSON response
        const accessibilityLabel = getAccessibilityLabel(activity);
        activity.accessibility = accessibilityLabel;

        // modifies price field in JSON response
        const priceLabel = getPriceLabel(activity);
        activity.price = priceLabel;

        res.json(activity);

    } catch (error) {
        res.status(500).json({error: 'An error has occurred'});
    }

});

app.listen(PORT, () => {console.log(`Server running on port: http://localhost:${PORT}`)});