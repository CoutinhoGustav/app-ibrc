const axios = require('axios');

const URL = 'http://192.168.0.60:3002/api/auth/login';

async function test() {
    console.log(`Testing connection to: ${URL}`);
    try {
        const response = await axios.post(URL, {
            email: 'test@test.com',
            password: '123'
        });
        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error Status:', error.response?.status);
        console.error('Error Data:', JSON.stringify(error.response?.data, null, 2));
        if (!error.response) {
            console.error('Network Error or No Response');
            console.error(error.message);
        }
    }
}

test();
