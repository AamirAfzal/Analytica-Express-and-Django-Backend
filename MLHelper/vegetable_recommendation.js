const { ML_SERVER_BASE, VEGETABLE_PREDICTION_ENDPOINT, PREDICTED_VEG } = require('./constants');

const mongoose = require('mongoose');
const FarmPrediction = require("../models/farmPrediction");
const axios = require('axios');
const answerRegex =  /\[([^\]]+)\]/g;

module.exports.doVegetablePrediction = async (temp, ph, humidity, farm) => {
    try {
        let response = await axios.get(ML_SERVER_BASE + VEGETABLE_PREDICTION_ENDPOINT.replace("{ph}", ph).replace("{humidity}", humidity).replace("{temp}", temp));
        if (parseInt(response.status) === 200) {
            //Oh boy we got a response
            let answer = answerRegex.exec(response.data)[1].replace(/&#x27;/g,"").split(',');
            let farmPrediction = {
                farm: farm._id,
                prediction: answer.map(a => a.trim()),
                predictionType: PREDICTED_VEG,
            };
            await FarmPrediction.deleteMany({predictionType : PREDICTED_VEG, farm: farm._id,});
            FarmPrediction.create(farmPrediction);
        } else {
            console.log(response);
        }
    } catch(e) {
        console.log(e);
    }
}