const fs = require('fs');

// Read the JSON data from 'input.json'
fs.readFile('microsoft365.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading input file:', err);
        return;
    }

    try {
        // Parse the JSON data
        const jsonData = JSON.parse(data);

        // Extract email addresses
        const emails = jsonData.map(entry => entry.email);

        // Write email addresses to 'output.txt'
        fs.writeFile('output.txt', emails.join('\n'), 'utf8', (err) => {
            if (err) {
                console.error('Error writing to output file:', err);
            } else {
                console.log('Email addresses have been saved to output.txt');
            }
        });
    } catch (parseErr) {
        console.error('Error parsing JSON data:', parseErr);
    }
});
