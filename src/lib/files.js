const fs = require('fs'),
      path = require('path');

module.exports = {

  //Gets the current base directory 
  getCurrentDirectoryBase: () => {
    return path.basename(process.cwd());
  },

  // Checks if directory exists
  directoryExists: (filePath) => {
    try {
      return fs.statSync(filePath).isDirectory();
    } catch (err) {
      return false;
    }
  },

  // Checks if file exists
  fileExists: (filePath) => {
    try {
      return fs.statSync(filePath).isFile();
    } catch (err) {
      return false;
    }
  },

  // Recurses directory and returns an array of all files
  // Synchronous
  walkSync: (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {
      filelist = fs.statSync(path.join(dir, file)).isDirectory() ?
        module.exports.walkSync(path.join(dir, file), filelist) :
        filelist.concat(path.join(dir, file));
    });
    return filelist;
  }
};