var fetchControlledTerms = require('./server/kg_util/fetchControlledTerms');
const {execSync} = require('child_process');

async function setup() {
    
    console.log('Fetching controlled terms...')
    var startTime = performance.now()
    let result = await fetchControlledTerms();
    var endTime = performance.now()
    console.log(`Fetching controlled terms took: ${endTime - startTime} milliseconds`)
    
    console.log('Creating build...')
    var startTime = performance.now()
    execSync('npm run build') // Redo the build in order for the updated terms to be used by the frontend
    var endTime = performance.now()
    console.log(`Creating build took: ${endTime - startTime} milliseconds`)
}

setup();