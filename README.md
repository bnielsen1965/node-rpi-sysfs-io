# rpi-sysfs-io

A NodeJS module for Raspberry PI gpio and pwm io through the linux sysfs interface.

Many of the Raspberry PI GPIO features can be accessed via the linux sysfs interface.
This includes pulse width modulation (PWM) and general purpose I/O (GPIO). The rpi-sysfs-io
module provides methods to access these features through the sysfs interface.


# install

In your node project directory use npm to install the module...
```shell
npm install --save rpi-sysfs-io
```


# usage

Usage of the rpi-sysfs-io module involves the creation of an instance of the class
followed by calling the asynchronous methods to control the I/O signals.


## GPIO example

This example assumes that GPIO 18 is being used as an ouput to control an LED.

```javascript
// create an instance of the rpi-sysfs-io class
const RPiSysfsIO = require('rpi-sysfs-io');
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
```


## PWM example

This example assumes the Raspberry Pi has been configured to boot with the PWM hardware
enabled. I.E. the /boot/config.txt file has the following device tree overlay setting...
> dtoverlay=pwm,pin=12,func=4

```javascript
// create an instance of the rpi-sysfs-io class
const RPiSysfsIO = require('rpi-sysfs-io');
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
```


# methods

## constructor

The rpi-sysfs-io module is a Javascript class with a constructor. You can pass parameters
to the constructor when creating an instance of the class if you need to override any
of the default settings.

I.E.
```Javascript
const RPiSysfsIO = require('rpi-sysfs-io');
// create instance and override the timeout delay when waiting for an export success
let gpio = new RPiSysfsIO({ exportWaitTimeout: 500 });
```

### exportWaitTimeout

When calling the exportGPIO() or exportPWM() methods they may include a wait for the
exported path to complete. The exportWaitTimeout is the number of milliseconds to
wait before throwing a timeout error.

### exportWaitInterval

When the exportGPIO() or exportPWM() methods are waiting for the export to complete
there is a delay between checks to see if the export has completed. The exportWaitInterval
is the number of milliseconds between checks to see if the export has completed.

### sysfsGPIOPath

This is the GPIO path in the sysfs interface.

### sysfsPWMPath

This is the PWM path in the sysfs interface.


## exportGPIO (gpio, waitExport)

An asynchronous method used to export a GPIO pin in the sysfs interface. Pass an integer
as the argument for the GPIO to export. If a boolean true is passed as the waitExport
argument then the method will only resolve after the GPIO is finished with the export
process.


## unexportGPIO (gpio)

An asynchronous method to unexport a GPIO in the sysfs interface by passing the number of
the GPIO interface to be unexported.


## isExportedGPIO (gpio)

An asynchronous method to check if a GPIO is already exported in the sysfs interface.
Provide the gpio number and the method will resolve with a boolean true if the GPIO
is already exported.


## directionGPIO (gpio, direction)

An asynchronous method to set the direction of the GPIO, 'in' or 'out'.


## writeGPIO (gpio, data)

An asynchronous method to write a value to a GPIO.


## readGPIO (gpio)

An asynchronous method to read the value of a GPIO.


## exportPWM (pwm, waitExport)

An asynchronous method used to export a PWM pin in the sysfs interface. Pass an integer
as the argument for the PWM to export. If a boolean true is passed as the waitExport
argument then the method will only resolve after the PWM is finished with the export
process.


## unexportPWM (pwm)

An asynchronous method to unexport a PWM in the sysfs interface by passing the number of
the PWM interface to be unexported.


## isExportedPWM (pwm)

An asynchronous method to check if a PWM is already exported in the sysfs interface.
Provide the PWM number and the method will resolve with a boolean true if the PWM
is already exported.


## periodPWM (pwm, period)

Set the total period of a PWM channel in nanoseconds. This will determine the frequency
of the PWM signal.


## dutyCyclePWM (pwm, dutyCycle)

Set the active time period of the PWM channel in nanoseconds. This will determine the
on time in the PWM signal.


## enablePWM (pwm, enable)

Set the PWM signal on or off.


# TODO

* Add polling methods
