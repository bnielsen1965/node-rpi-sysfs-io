'use strict';

const FS = require('fs');

const Defaults = {
  sysfsGPIOPath: '/sys/class/gpio/',
  sysfsPWMPath: '/sys/class/pwm/pwmchip0/',
  exportWaitTimeout: 5000,
  exportWaitInterval: 50
};

class RPiSysfsIO {
  constructor (settings) {
    this.settings = Object.assign({}, Defaults, settings);
    this.autoExport();
  }

  // auto export underscored class methods
  autoExport () {
    let self = this;
    Object.getOwnPropertyNames(Object.getPrototypeOf(self)).forEach(function (name) {
      if (/^_[^_]+/.test(name)) {
        self[name.replace(/^_/, '')] = self[name].bind(self);
      }
    });
  }


  async _exportGPIO (gpio, waitExport) {
    await this.write(this.settings.sysfsGPIOPath + 'export', gpio);
    if (!waitExport) {
      return;
    }
    return await this.waitExported(this.settings.sysfsGPIOPath + 'gpio' + gpio);
  }

  async _unexportGPIO (gpio) {
    return await this.write(this.settings.sysfsGPIOPath + 'unexport', gpio);
  }

  async _isExportedGPIO (gpio) {
    return await this.isExported(this.settings.sysfsGPIOPath + 'gpio' + gpio);
  }

  async _directionGPIO (gpio, direction) {
    return await this.write(this.settings.sysfsGPIOPath + 'gpio' + gpio + '/direction', direction);
  }

  async _writeGPIO (gpio, data) {
    return await this.write(this.settings.sysfsGPIOPath + 'gpio' + gpio + '/value', data);
  }

  async _readGPIO (gpio) {
    let data = await this.read(this.settings.sysfsGPIOPath + 'gpio' + gpio + '/value');
    return parseInt(data.toString());
  }


  async _exportPWM (pwm, waitExport) {
    await this.write(this.settings.sysfsPWMPath + 'export', pwm);
    if (!waitExport) {
      return;
    }
    return await this.waitExported(this.settings.sysfsPWMPath + 'pwm' + pwm);
  }

  async _unexportPWM (pwm) {
    return await this.write(this.settings.sysfsPWMPath + 'unexport', pwm);
  }

  async _isExportedPWM (pwm) {
    return await this.isExported(this.settings.sysfsPWMPath + 'pwm' + pwm);
  }

  async _periodPWM (pwm, period) {
    return await this.write(this.settings.sysfsPWMPath + 'pwm' + pwm + '/period', period);
  }

  async _dutyCyclePWM (pwm, dutyCycle) {
    return await this.write(this.settings.sysfsPWMPath + 'pwm' + pwm + '/duty_cycle', dutyCycle);
  }

  async _enablePWM (pwm, enable) {
    return await this.write(this.settings.sysfsPWMPath + 'pwm' + pwm + '/enable', enable ? '1' : '0');
  }


  _write (path, data) {
    return new Promise((resolve, reject) => {
      FS.writeFile(path, '' + data, (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }

  _read (path) {
    return new Promise((resolve, reject) => {
      FS.readFile(path, (error, data) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(data);
      });
    });
  }

  async _waitExported (path) {
    let waitTime = 0;
    while (!(await this._isExported(path))) {
      waitTime += this.settings.exportWaitInterval;
      if (waitTime > this.settings.exportWaitTimeout) {
        throw new Error('Timeout waiting for export.');
      }
      await this.wait(this.settings.exportWaitInterval);
    }
  }

  _isExported (path) {
    return new Promise((resolve, reject) => {
      FS.access(path, FS.constants.F_OK, (error) => {
        if (error) {
          resolve(false);
        }
        else {
          resolve(true);
        }
      });
    });
  }

  _wait (ms) {
    return new Promise((resolve, reject) => {
      setTimeout(function () { resolve(); }, ms);
    });
  }
}

module.exports = RPiSysfsIO;
