'use strict';

const axios = require('axios');
const apiKey = 'AIzaSyCuqqRyIQcvB2Hzd7VKgdSphWfFuWh40kI';

async function getCounty(address) {
    let counties = [];
    const geoResp = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address.replace(/ /g, '+')}&key=${apiKey}`);
    if(geoResp.data.status == "ZERO_RESULTS") {
        return null;
    } else {
        counties = geoResp.data.results.map(obj1 => Object.assign({
            name: obj1.address_components.filter(obj2 => obj2.types.includes("administrative_area_level_2"))[0].short_name,
            state: obj1.address_components.filter(obj2 => obj2.types.includes("administrative_area_level_1"))[0].short_name
        }));
    }
    return counties[0];
}

module.exports = {
    getCounty
};