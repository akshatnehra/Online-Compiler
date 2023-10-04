const { compileC } = require('../utils/C_Compiler');
const { compileCpp } = require('../utils/Cpp_Compiler');
const { compileJava } = require('../utils/Java_Compiler');
const { compilePython } = require('../utils/Python_Compiler');

exports.compile = async function(req, res){
    try {
        // Get code, language and input from request body   
        const { code, language, input } = req.body;

        // Check if code, language and input are provided
        if (!code || !language) {
            return res.status(400).send('Bad Request');
        }

        // Check if language is supported
        if (!['c', 'cpp', 'java', 'python'].includes(language)) {
            return res.status(400).send('Bad Request');
        }

        // Compile code
        let result = await compileCode(code, language, input);

        // Send result  
        res.status(200).json({
            status: 'success',
            result: result,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 'error',
            result: error.message,
        });
    }
}

// Compile code
const compileCode = async (code, language, input) => {
    switch (language) {
        case 'c':
            return await compileC(code, input);
        case 'cpp':
            return await compileCpp(code, input);
        case 'java':
            return await compileJava(code, input);
        case 'python':
            return await compilePython(code, input);
    }
}