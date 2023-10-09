const supportedLanguages = ['c', 'cpp', 'java', 'python, javascript'];

// Export Supported Languages   
exports.supportedLanguages = function (req, res) {  
    try {
        // Send supported languages
        res.status(200).json({
            status: 'success',
            result: supportedLanguages,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server error');
    }
}