# Setup Instructions for Contest Platform

## Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   \`\`\`bash
   node --version
   npm --version
   \`\`\`

2. **Programming Language Compilers/Interpreters**:

   **For C++ Support:**
   \`\`\`bash
   # Ubuntu/Debian
   sudo apt-get install build-essential g++
   
   # macOS (with Homebrew)
   brew install gcc
   
   # Windows (install MinGW or Visual Studio)
   \`\`\`

   **For Java Support:**
   \`\`\`bash
   # Ubuntu/Debian
   sudo apt-get install default-jdk
   
   # macOS (with Homebrew)
   brew install openjdk
   
   # Windows - Download from Oracle or use OpenJDK
   \`\`\`

   **For Python Support:**
   \`\`\`bash
   # Ubuntu/Debian
   sudo apt-get install python3
   
   # macOS (usually pre-installed)
   python3 --version
   
   # Windows - Download from python.org
   \`\`\`

### Verify Installation

Test that all compilers are working:

\`\`\`bash
# Test C++
echo '#include<iostream>
int main(){std::cout<<"Hello World";return 0;}' > test.cpp
g++ -o test test.cpp && ./test
rm test.cpp test

# Test Java
echo 'public class Test{public static void main(String[] args){System.out.println("Hello World");}}' > Test.java
javac Test.java && java Test
rm Test.java Test.class

# Test Python
python3 -c "print('Hello World')"
\`\`\`

## Installation

1. **Clone the repository**:
   \`\`\`bash
   git clone <repository-url>
   cd contest-platform
   \`\`\`

2. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

3. **Create temp directory**:
   \`\`\`bash
   mkdir temp
   \`\`\`

4. **Start development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open in browser**:
   \`\`\`
   http://localhost:3000
   \`\`\`

## Features

### 🔧 **Direct Server Execution**
- **No Docker required**: Code runs directly on the Node.js server
- **Fast execution**: No container overhead
- **Simple setup**: Just install language compilers
- **Resource monitoring**: Built-in timeout and memory tracking

### 🛡️ **Security Features**
- **Process isolation**: Each execution in separate process
- **Timeout protection**: 10-second execution limit
- **File cleanup**: Automatic temporary file removal
- **Input validation**: Code validation before execution

### 🚀 **Performance**
- **Quick compilation**: Direct compiler access
- **Real-time feedback**: Immediate execution results
- **Memory efficient**: No container overhead
- **Scalable**: Handles multiple concurrent executions

## Supported Languages

| Language | Version | Compiler/Interpreter |
|----------|---------|---------------------|
| C++ | C++17 | g++ |
| Java | Java 8+ | javac + java |
| Python | Python 3.x | python3 |

## Troubleshooting

### Common Issues

1. **Compiler not found**:
   \`\`\`
   Error: g++ is not available
   \`\`\`
   - Install the required compiler for your language
   - Ensure it's in your system PATH

2. **Permission denied**:
   \`\`\`
   Error: EACCES: permission denied
   \`\`\`
   - Check file permissions in temp directory
   - Ensure Node.js has write access

3. **Timeout errors**:
   \`\`\`
   Error: Time Limit Exceeded
   \`\`\`
   - Optimize your algorithm
   - Check for infinite loops
   - Reduce time complexity

4. **Memory issues**:
   \`\`\`
   Error: out of memory
   \`\`\`
   - Optimize memory usage
   - Check for memory leaks
   - Use more efficient data structures

### Development Tips

1. **Testing locally**:
   \`\`\`bash
   # Test individual components
   npm run dev
   
   # Check logs
   tail -f .next/trace
   \`\`\`

2. **Debugging execution**:
   - Check temp directory for generated files
   - Monitor server logs for execution errors
   - Use browser dev tools for client-side issues

3. **Performance monitoring**:
   - Monitor server CPU usage during contests
   - Check memory consumption
   - Set up log rotation for production

## Production Deployment

### Server Requirements
- **CPU**: Multi-core recommended for concurrent executions
- **Memory**: 4GB+ RAM recommended
- **Storage**: SSD for faster compilation
- **OS**: Linux/macOS/Windows with compilers installed

### Deployment Steps

1. **Install compilers on server**:
   \`\`\`bash
   # Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install build-essential default-jdk python3
   \`\`\`

2. **Build application**:
   \`\`\`bash
   npm run build
   \`\`\`

3. **Start production server**:
   \`\`\`bash
   npm start
   \`\`\`

4. **Set up process manager** (PM2 recommended):
   \`\`\`bash
   npm install -g pm2
   pm2 start npm --name "contest-platform" -- start
   pm2 startup
   pm2 save
   \`\`\`

### Security Considerations

1. **File system isolation**: Ensure temp directory is isolated
2. **Resource limits**: Monitor CPU and memory usage
3. **Input sanitization**: Validate all user inputs
4. **Regular cleanup**: Schedule cleanup of temporary files
5. **Monitoring**: Set up logging and monitoring

### Scaling

For high-traffic scenarios:
1. **Load balancing**: Use multiple server instances
2. **Queue system**: Implement execution queue for fairness
3. **Caching**: Cache compilation results when possible
4. **Database**: Use proper database for persistence
5. **CDN**: Serve static assets via CDN

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review server logs for error details
3. Ensure all prerequisites are installed
4. Test individual language compilers separately
