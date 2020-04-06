const sourceClientId = 'mobile-device';
const targetService = 'job-service';
const p2pClientPlugin = require("../../../src/p2p-client-plugin");
const socketClient = require('socket.io-client');
const rawSocket = socketClient.connect(`http://localhost:9000?clientId=${sourceClientId}`);
const socket = p2pClientPlugin(rawSocket, sourceClientId);

(() => {
  const downloadFile = (fileToDownload, jobId) => {
    const {fileName, size} = fileToDownload;
    let downloaded = 0;
    const downloadTask = setInterval(() => {
      if (downloaded === size) {
        clearInterval(downloadTask);
        return;
      }

      const status = {
        jobId,
        jobName: 'downloadFile',
        jobStatus: `Downloaded ${Math.round(downloaded++ / size * 100)}% of file ${fileName}`,
      };
      // emitService is just another name for emitTo
      // but it's recommended to use emitService to make the code related
      socket.emitService(targetService, 'update', status);
      console.log('device-client: ',status.jobStatus);
    }, 1000);
  };

  // onService makes client listen to a specific service and not others
  socket.onService(targetService, 'create', ({jobId, jobName, filesToDownload}, fn) => {
    if (jobName === 'downloadFile') {
      filesToDownload.forEach(file => {
        downloadFile(file, jobId);
      });
      fn();
    }
  });
})();
