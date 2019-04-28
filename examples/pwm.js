// create an instance of the rpi-sysfs-io class
const RPiSysfsIO = require('../lib/index.js'); // NOTE: this would normally be require('rpi-sysfs-io');
const PWM = 0;
const PWM_PERIOD = 1000000;
const PWM_DUTY_CYCLE = 100000;
let gpio = new RPiSysfsIO();
let enable = 0;

// initialize the gpio
init()
.then(() => {
  // start the PWM cycling
  togglePWM();
})
.catch(error => {
  console.log('ERROR:', error.message);
});


// asynchronous method to initialize the PWM
async function init () {
  // make sure the GPIO is exported
  if (!(await gpio.isExportedPWM(PWM))) {
    // export the PWM and wait until the export is complete
    await gpio.exportPWM(PWM, true);
  }

  // apply the PWM settings
  await gpio.periodPWM(PWM, PWM_PERIOD);
  await gpio.dutyCyclePWM(PWM, PWM_DUTY_CYCLE);
  await gpio.enablePWM(PWM, enable);
}

// method to toggle the PWM off and on
function togglePWM() {
  enable = (enable ? 0 : 1);
  gpio.enablePWM(PWM, enable)
  .then(() => {
    // wait a moment then call togglePWM again
    setTimeout(togglePWM, 500);
  })
}
