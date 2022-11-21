export const logger = {
  info: (...args: any[]) => {
    console.log('\x1b[33m%s\x1b[0m', ...args);
  },
  success: (...args: any[]) => {
    console.log('\x1b[32m%s\x1b[0m', ...args);
  },
  error: (...args: any[]) => {
    console.log('\x1b[31m%s\x1b[0m', ...args);
  },
  dev: (...args: any[]) => {
    console.log('\x1b[36m%s\x1b[0m', ...args);
  }
};
