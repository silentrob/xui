var fs = require('fs'),
    uri = require('path'),
    sys = require('sys'),
    puts = sys.puts;

function _getStat(path) {
  try {
    return fs.statSync(path);
  } catch (e) {}
  return null;
}

_escape = function(str) {
  // via prototypejs
  return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
};

function isDir(path) {
  var stat = _getStat(path);
  return (stat) ? stat.isDirectory() : false;
}
exports.isDir = isDir;

function isFile(path) {
  var stat = _getStat(path);
  return (stat) ? stat.isFile() : false;
}
exports.isFile = isFile;

function rm(path, callback) {
  uri.exists(path, function(exists) {
    if (exists) {
      if (isDir(path)) {
        var files = [];

        // Collect files for deletion
        walk(path, function(file) {
          files.push(file);
        }, true);

        // Reverse file list so we delete dir contents before trying to delete dir.
        // Iterate through all and delete.
        files.reverse().forEach(function(file) {
          if (isDir(file)) {
            try {
              fs.rmdirSync(file);
            } catch (e) {}
          } else if (isFile(file)) {
            try {
              fs.unlinkSync(file);
            } catch (e) {}
          }
        });
      } else if (isFile(path)) {
        fs.unlinkSync(path);
      }
    }
    callback();
  });
}
exports.rm = rm;

function rmSync(path) {
  if (existsSync(path)) {
    if (isDir(path)) {
      var files = [];

      walk(path, function(file) {
        files.push(file);
      }, true);

      files.reverse().forEach(function(file) {
        if (isDir(file)) {
          try {
            fs.rmdirSync(file);
          } catch (e) {}
        } else if (isFile(file)) {
          try {
            fs.unlinkSync(file);
          } catch (e) {}
        }
      });

    } else if (isFile(path)) {
      fs.unlinkSync(path);
    }
  }
}
exports.rmSync = rmSync;

function exists(path, callback) {
  uri.exists(path, callback);
}
exports.exists = exists;

function existsSync(path) {
  var stat = _getStat(path);
  return (stat) ? (stat.isDirectory() || stat.isFile()) : false;
}
exports.existsSync = existsSync;

/**
 * fileutils.walk(dir, callback, [showDotFiles=false])
**/
function walk(dir, callback, showDotFiles) {
  showDotFiles = (typeof showDotFiles === "undefined") ? false : showDotFiles ;
  
  if (!isDir(dir)) {
    throw new Error("`dir` \"" + dir + "\" is not a directory.");
  }
  
  dir = resolve(dir);
  
  callback(dir);
  
  // adapted from a function of mikeal's:
  fs.readdirSync(dir).forEach(function (name) {
    // ignore . and .. directories
    if (name.match(/^\.(\.)?$/)) return;
    
    // ignore . files if specified
    if (!showDotFiles && name[0] == ".") return;

    var path = uri.join(dir, name);
    var stats = fs.statSync(path);
    
    if (stats.isDirectory()) {
      walk(path, callback);

    } else if (stats.isFile()) {
      callback(path);
    }
  });
}    
exports.walk = walk;

/**
 *  fileutils.resolve(path) -> String
 *
 *  Resolves `path` into a fully qualified version of itself.
 *
 *  Relative paths are resolved based on `process.cwd`. Unlike `fs.realpath` no
 *  file need exist at the specified path.
 *
 *  Examples (given cwd == /Users/dandean/Sites):
 *
 *    fileutils.resolve(".");
 *    //-> /Users/dandean/Sites
 *
 *    fileutils.resolve("./radical");
 *    //-> /Users/dandean/Sites/radical
 *
 *    fileutils.resolve("../radical");
 *    //-> /Users/dandean/radical
 *
 *    fileutils.resolve("/some/path/../from/root/");
 *    //-> /some/from/root
**/
function resolve(path) {
  if (!path || path == "." || path == "./") {
    return process.cwd();
  }
  
  var parts = uri.normalize(path).split("/");
  
  if (parts[0] === "") {
    // from root
    parts.shift();

  } else if (parts[0] === "..") {
    // from parent directory
    parts[0] = uri.dirname(process.cwd());

  } else if (parts[0] === ".") {
    // explicitly from current directory
    parts[0] = process.cwd();;

  } else {
    // from current directory
    parts.unshift(process.cwd());
  }
  // Join all parts with "/"; remove trailing slash.
  path = uri.join.apply(uri, parts).replace(/\/$/, "");

  // Make sure path starts with a slash.
  return (path[0] == "/") ? path : "/" + path;
}
exports.resolve = resolve;

function mkdir(path, mode, callback) {
  throw new Error("Not implemented");
  // TODO: some sort of asynchronous loop...
}
exports.mkdir = mkdir;

function mkdirSync(path, mode) {
  if (!path) {
    throw new Error("Argument `path` must have a value");
  }
  
  // resolve path to root directory
  path = resolve(path);
  var parts = path.split("/");
  
  // Shift empty item at start
  var prefix = parts.shift();
  
  // Create each part of the path, recursively
  parts.forEach(function(p) {
    // get the mode from the prefix directory if possible
    if (typeof mode == "undefined") {
      var mode = 0777;
      if (prefix) {
        try {
          mode = fs.statSync(prefix).mode;
        } catch (e) {
          mode = 0777;
        }
      }
    }
    
    var current = uri.join(prefix, p);
    if (!existsSync(current)) {
      fs.mkdirSync(current, mode);
    }
    prefix = current;
  });
}
exports.mkdirSync = mkdirSync;

function copyFileToFile(file1, file2) {
  if (!isFile(file1)) {
    throw new Error("Argument `file1` is not a file.");
  }
  
  if (isFile(file2)) {
    fs.writeFileSync(file2, fs.readFileSync(file1, "binary"), "binary");

  } else {
    // ensure the directories
    var path = uri.dirname(resolve(file2));
    if (!existsSync(path)) {
      mkdirSync(path);
    }
    // create the file itself
    fs.writeFileSync(file2, fs.readFileSync(file1, "binary"), "binary");
  }
}
//exports.copyFileToFile = copyFileToFile;

function copyFileIntoDir(file, dir) {
  if (!isFile(file)) {
    throw new Error("Argument `file` is not a file.");
  }
  if (!isDir(dir)) {
    throw new Error("Argument `dir` is not a directory.");
  }
  
  // TODO: only resolve if necessary
  file = resolve(file);
  dir = resolve(dir);
  
  fs.writeFileSync(uri.join(dir, uri.basename(file)), fs.readFileSync(file, "binary"), "binary");
}
//exports.copyFileIntoDir = copyFileIntoDir;

function copyDirToDir(sourcedir, targetdir) {
  if (!isDir(sourcedir)) {
    throw new Error("Argument `sourcedir` is not a directory.");
  }
  if (!isDir(targetdir)) {
    throw new Error("Argument `targetdir` is not a directory.");
  }
  
  sourcedir = resolve(sourcedir);
  targetdir = resolve(targetdir);
  
  var files = [];
  var root = sourcedir;
  var matchesRoot = new RegExp(_escape(root));

  // Collect dirs before copying. Keeps from infinite recursion.
  walk(sourcedir, function(file) {
    files.push(file);
  });
  
  files.forEach(function(file) {
    var name = file.replace(matchesRoot, "");
    if (name) {
      name = uri.join(targetdir, name.replace(/^\//, ""));
      
      if (isFile(file)) {
        fs.writeFileSync(name, fs.readFileSync(file, "binary"), "binary");
      } else if (isDir(file)) {
        mkdirSync(name);
      }
    }
  });
}
//exports.copyDirToDir = copyDirToDir;

function copyDirIntoDir(sourcedir, targetdir) {
  if (!isDir(sourcedir)) {
    throw new Error("Argument `sourcedir` is not a directory.");
  }
  
  sourcedir = resolve(sourcedir);
  targetdir = resolve(targetdir);
  
  var files = [];
  var root = sourcedir;
  var matchesRoot = new RegExp(_escape(root));

  // Collect dirs before copying. Keeps from infinite recursion.
  walk(sourcedir, function(file) {
    files.push(file);
  });
  
  if (!existsSync(targetdir)) {
    mkdirSync(targetdir);
  }
  
  files.forEach(function(file) {
    var name = file.replace(matchesRoot, "");
    puts(name);
    if (name) {
      name = uri.join(targetdir, name.replace(/^\//, ""));
      puts(name);

      if (isFile(file)) {
        fs.writeFileSync(name, fs.readFileSync(file, "binary"), "binary");
      } else if (isDir(file)) {
        mkdirSync(name);
      }
    }
  });
}
//exports.copyDirIntoDir = copyDirIntoDir;

function copy(source, target) {
  var fullSource = resolve(source),
      fullTarget = resolve(target),

      sourceIsFile = isFile(source),
      sourceIsDir = isDir(source),

      targetIsFile = isFile(target),
      targetIsDir = isDir(target);
  
  if (sourceIsFile && (targetIsFile || !existsSync(target))) {
    // copy(file, file | doesn't exist)
    // -> copyFileToFile
    copyFileToFile(fullSource, fullTarget);

  } else if (sourceIsFile && targetIsDir) {
    // copy(file, dir)
    // -> copyFileIntoDir
    copyFileIntoDir(fullSource, fullTarget);
  
  } else if (sourceIsDir && targetIsDir && source.match(/\/$/)) {
    // copy(dir/, dir)
    // -> copyDirToDir
    copyDirToDir(fullSource, fullTarget);
  
  } else if (sourceIsDir && targetIsDir) {
    // copy(dir, dir)
    // -> copyDirIntoDir
    copyDirIntoDir(fullSource, fullTarget);
    
  }
}
exports.copy = copy;

function search(pattern, callback) {
  throw new Error("Not implemented.");
}
exports.search = search;

function searchSync(pattern) {
  throw new Error("Not implemented.");
}
exports.searchSync = searchSync;