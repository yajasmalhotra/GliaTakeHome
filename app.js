import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';


const app = express();
const PORT = 5000;
const API_URL = 'http://www.boredapi.com/api/activity/';
app.use(bodyParser.json());

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
        return "High";
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
    res.redirect('/activity');
})

app.get('/activity', async (req, res) => {
    
    try {
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