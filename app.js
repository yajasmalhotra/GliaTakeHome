import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';


const app = express();
const PORT = 5000;
const API_URL = 'http://www.boredapi.com/api/activity/';
app.use(bodyParser.json());


function getAccessibilityLabel(activity) {
    if (activity.accessibility <= 0.25 ) {
        return "High";
    } else if (activity.price <= 0.75) {
        return "Medium";
    } else {
        return "High";
    }
}

function getPriceLabel(activity) {
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
        console.log(activity);

        const accessibilityLabel = getAccessibilityLabel(activity);
        console.log(accessibilityLabel);
        activity.accessibility = accessibilityLabel;

        const priceLabel = getPriceLabel(activity);
        console.log(priceLabel);
        activity.price = priceLabel;
        const activityLabelled = {activity}

        res.json(activityLabelled);

    } catch (error) {
        // res.status(500).json({error: 'An error has occurred'});
    }

});

app.listen(PORT, () => {console.log(`Server running on port: http://localhost:${PORT}`)});