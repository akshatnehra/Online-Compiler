const defaultCodes = {
    javascript: `/*\n    Use INPUT variable to get stdin.\n    Try console.log(INPUT);\n*/\n\nconsole.log('Hello World');`,
    c: `#include <stdio.h>\n\nint main() {\n    printf("Hello, world!\\n");\n    return 0;\n}`,
    cpp: `#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, world!" << endl;\n    return 0;\n}`,
    python: `print("Hello, world!")`,
    java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, world!");\n    }\n}`,
  };
  
  export default defaultCodes;