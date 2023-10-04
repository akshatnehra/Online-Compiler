

exports.compile = function(req, res){
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
        let result = compileCode(code, language, input);

        // Send result  
        res.status(200).json({
            status: 'success',
            result: result,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server error');
    }
}