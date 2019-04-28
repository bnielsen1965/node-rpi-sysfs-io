// create an instance of the rpi-sysfs-io class
const RPiSysfsIO = require('../lib/index.js'); // NOTE: this would normally be require('rpi-sysfs-io');
const LED = 18;
let gpio = new RPiSysfsIO();

// initialize the gpio
init()
.then(() => {
  // start the LED blinking
  blinkLED();
})
.catch(error => {
  console.log('ERROR:', error.message);
});


// asynchronous method to initialize the LED GPIO
async function init () {
  // make sure the GPIO is exported
  if (!(await gpio.isExportedGPIO(LED))) {
    // export the GPIO and wait until the export is complete
    await gpio.exportGPIO(18, true);
  }
  // set the LED GPIO for output and initialize the initial state
  await gpio.directionGPIO(LED, 'out');
  await gpio.writeGPIO(LED, 0);
}

// method to blink the LED on the GPIO pin
function blinkLED() {
  // get the current GPIO value
  gpio.readGPIO(LED)
  .then(value => {
    // toggle the GPIO value
    return gpio.writeGPIO(LED, (value ? 0 : 1));
  })
  .then(() => {
    // wait a second then call blinkLED again
    setTimeout(blinkLED, 1000);
  })
}
