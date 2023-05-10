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
const BASE_URL = 'http://www.boredapi.com/api/activity';
const URI = 'mongodb+srv://admin:imbored@boredinator.wgeqqjc.mongodb.net/?retryWrites=true&w=majority'


class currentUser {
    constructor(name = '', price = '', accessibility = '') {
      this.name = name;
      this.price = price;
      this.accessibility = accessibility;
    }
}

const newestUser = new currentUser();

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

function getPriceRange(label) {
    if (label == "Free") {
        return "price = 0.0";
    } else if (label == "Low") {
        return "minprice=0.01&maxprice=0.49";
    } else {
        return "minprice=0.5&maxprice=1"
    }
}

function getAccessibilityRange(label) {
    if (label == "Low") {
        return "minaccessibility=0.76&maxaccessibility=1";
    } else if (label == "Medium") {
        return "minaccessibility=0.26&maxaccessibility=0.75"
    } else {
        return "minaccessibility=0&maxaccessibility=0.25"
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
      newestUser.name = name;
      newestUser.accessibility = accessibility;
      newestUser.price = price;
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
        console.log(newestUser.name);
        const priceRange = getPriceRange(newestUser.price);
        const accessibilityRange = getAccessibilityRange(newestUser.accessibility);
        const response = await axios.get(BASE_URL + "?" + accessibilityRange + "&" + priceRange);
        console.log(BASE_URL + accessibilityRange + priceRange);
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