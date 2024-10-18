const detect = require('detect-port');

const DEFAULT_PORT = 3000;

detect(DEFAULT_PORT, (err, availablePort) => {
  if (err) {
    console.log(`Error detecting port: ${err.message}`);
    process.exit(1);
  }

  if (DEFAULT_PORT === availablePort) {
    console.log(`Port ${DEFAULT_PORT} is available`);
    process.env.PORT = DEFAULT_PORT;
  } else {
    console.log(`Port ${DEFAULT_PORT} is occupied, switching to port ${availablePort}`);
    process.env.PORT = availablePort;
  }

  const { exec } = require('child_process');
  exec('react-scripts start', (err, stdout, stderr) => {
    if (err) {
      console.error(`Error starting frontend: ${err.message}`);
      return;
    }
    console.log(stdout);
    console.error(stderr);
  });
});
