'use strict';

const path = require('path');
const express = require('express');
const app = express();

const dbUtil = require('./util/dbUtil');
const geoUtil = require('./util/geoUtil');
const loanUtil = require('./util/loanUtil');

const acceptedStates = ['FL', 'CA', 'OR'];

app.use(express.urlencoded());


// County data
app.get('/county', (req, res) => {
    return res.sendFile(path.resolve('./src/pages/county.html'));
});

app.post('/county', async (req, res) => {
    const data = {
        name: req.body.name,
        ratio: parseFloat(req.body.ratio)
    };

    Object.keys(data).forEach(key => {
        if(data[key] === undefined || data[key] === "") {
            return res.status(400).send(`The form submission has missing fields, "${key}" is required.`);
        }
    });

    const county = await dbUtil.findOne({ name: data.name }, 'counties');
    if(county == null || county == undefined) {
        await dbUtil.save(data, 'counties');
    } else {
        await dbUtil.update({ name: county.name }, data, 'counties');
    }

    return res.send(`County information updated: ${JSON.stringify(data)}`);
});

app.get('/counties', (req, res) => {
    return dbUtil.find({}, 'counties').then(data => res.send(JSON.stringify(data)));
});



// Applications
app.get('/applications', (req, res) => {
    return dbUtil.find({}, 'applications').then(data => res.send(JSON.stringify(data)));
});

app.get('/apply', (req, res) => {
    return res.sendFile(path.resolve('./src/pages/apply.html'));
});

app.post('/apply', async (req, res) => {
    const data = {
        name: req.body.name,
        address: req.body.address,
        income: req.body.income,
        amount: req.body.amount,
        date: new Date
    };

    Object.keys(data).forEach(key => {
        if(data[key] === undefined || data[key] === "") {
            return res.status(400).send(`The form submission has missing fields, "${key}" is required.`);
        }
    });

    const geoData = await geoUtil.getCounty(data.address);
    if(geoData == null) {
        return res.status(400).send("The address supplied is invalid!");
    }
    if(!acceptedStates.includes(geoData.state)) {
        return res.status(400).send("The address must be within FL, OR or CA!");
    }

    const previousApplications = await dbUtil.find({ name: data.name }, 'applications');
    previousApplications.forEach(application => {
        if(application.income == data.income && application.amount == data.amount && !application.approved) {
            return res.send(`We received your original application on ${data.date.toLocaleString()}, unfortunately it was declined.`);
        }

        return res.send(`We received your original application on ${data.date.toLocaleString()}, it was approved!`);
    })

    const county = await dbUtil.find({ name: geoData.name }, 'counties');
    data['approved'] = loanUtil.loanApproved(req.body.income, req.body.amount, county.ratio);
    dbUtil.save(data, 'applications');

    if(data.approved) {
        return res.send(`Congratulations ${data.name}, you have been approved!`);
    } else {
        return res.send("We are sorry, your application has been declined.");
    }
});

app.listen(3000);