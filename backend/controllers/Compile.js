const { compileC } = require('../utils/C_Compiler');
const { compileCpp } = require('../utils/Cpp_Compiler');
const { compileJava } = require('../utils/Java_Compiler');
const { compilePython } = require('../utils/Python_Compiler');
const path = require('path');
const fs = require('fs').promises;
const fsExtra = require('fs-extra');
const { time } = require('console');

exports.compile = async function(req, res) {
    try {
      const { code, language, input } = req.body;
  
      if (!code || !language) {
        return res.status(400).send('Bad Request');
      }
  
      if (!['c', 'cpp', 'java', 'python'].includes(language)) {
        return res.status(400).send('Bad Request');
      }
  
      // Create a temporary directory using the current time
      const tempDir = path.join(__dirname, `${Date.now()}`);
      await fs.mkdir(tempDir, { recursive: true });
  
      // Compile code and store the result
      let result = await compileCode(code, language, input, tempDir);
  
      // Send result
      res.status(200).json({
        status: 'success',
        result: result,
      });

      // Force delete the temporary directory and its contents even if file is in use
  
      // Delete the temporary directory and its contents
      await fs.rm(tempDir, { recursive: true });
        // await fsExtra.remove(tempDir);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: 'error',
        result: error.message,
      });
    }
  }

// Compile code
const compileCode = async (code, language, input, tempDir) => {
    const timeout = 5000;

    switch (language) {
        case 'c':
            return await compileC(code, input, timeout, tempDir);
        case 'cpp':
            return await compileCpp(code, input, timeout, tempDir);
        case 'java':
            return await compileJava(code, input, timeout);
        case 'python':
            return await compilePython(code, input, timeout);
    }
}