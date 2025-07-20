# Docker Setup for Secure Code Execution

## Prerequisites

1. **Install Docker**: Make sure Docker is installed and running on your system
   - [Docker Desktop](https://www.docker.com/products/docker-desktop/) for Windows/Mac
   - [Docker Engine](https://docs.docker.com/engine/install/) for Linux

2. **Verify Docker Installation**:
   \`\`\`bash
   docker --version
   docker run hello-world
   \`\`\`

## Setup Instructions

### 1. Build Docker Images

Run the following command to build all language-specific Docker images:

\`\`\`bash
npm run docker:build
\`\`\`

Or build them individually:

\`\`\`bash
# C++ Runner
docker build -t contest-runner-cpp --target cpp-runner -f Dockerfile.contest-runner .

# Java Runner  
docker build -t contest-runner-java --target java-runner -f Dockerfile.contest-runner .

# Python Runner
docker build -t contest-runner-python --target python-runner -f Dockerfile.contest-runner .
\`\`\`

### 2. Test Docker Images

Test each language runner:

\`\`\`bash
# Test Python
echo 'print("Hello World")' | docker run -i --rm contest-runner-python python3 -c "import sys; exec(sys.stdin.read())"

# Test C++
echo '#include<iostream>
int main(){std::cout<<"Hello World";return 0;}' > test.cpp
docker run --rm -v $(pwd)/test.cpp:/tmp/solution.cpp contest-runner-cpp sh -c "g++ -o /tmp/solution /tmp/solution.cpp && /tmp/solution"

# Test Java
echo 'public class Solution{public static void main(String[] args){System.out.println("Hello World");}}' > Solution.java
docker run --rm -v $(pwd)/Solution.java:/tmp/Solution.java contest-runner-java sh -c "javac /tmp/Solution.java && java -cp /tmp Solution"
\`\`\`

## Security Features

### Container Security
- **Non-root user**: All code runs as user `runner`
- **Read-only filesystem**: Prevents file system modifications
- **No network access**: `--network none` isolates containers
- **Resource limits**: Memory (128MB) and CPU (0.5 cores) constraints
- **Capability dropping**: `--cap-drop ALL` removes all Linux capabilities
- **No new privileges**: `--security-opt no-new-privileges`

### Execution Limits
- **Time limit**: 10 seconds maximum execution time
- **Memory limit**: 128MB RAM limit
- **Temporary filesystem**: Limited tmpfs for temporary files
- **Process isolation**: Each execution in separate container

### File System Security
- **Temporary files**: Code files are mounted read-only
- **Automatic cleanup**: Containers and files are automatically removed
- **Isolated execution**: No access to host filesystem

## Troubleshooting

### Common Issues

1. **Docker not found**:
   \`\`\`
   Error: Docker is not available
   \`\`\`
   - Install Docker and ensure it's running
   - Check Docker daemon is started

2. **Permission denied**:
   \`\`\`
   Error: permission denied while trying to connect to Docker daemon
   \`\`\`
   - Add user to docker group: `sudo usermod -aG docker $USER`
   - Restart terminal/system

3. **Image build fails**:
   \`\`\`
   Error: Failed to build Docker image
   \`\`\`
   - Check internet connection for package downloads
   - Ensure sufficient disk space
   - Try building images individually

4. **Container execution timeout**:
   \`\`\`
   Error: Time Limit Exceeded
   \`\`\`
   - This is expected for infinite loops or slow algorithms
   - Optimize your code or check for logical errors

### Performance Tips

1. **Pre-build images**: Build Docker images during deployment
2. **Image caching**: Docker will cache layers for faster subsequent builds
3. **Resource monitoring**: Monitor system resources during contests
4. **Cleanup**: Regular cleanup of old containers and images

## Development Mode

For development without Docker, the system falls back to mock execution:

\`\`\`bash
# Disable Docker temporarily
sudo systemctl stop docker

# The application will use mock execution
npm run dev
\`\`\`

## Production Deployment

For production deployment:

1. **Build images on server**:
   \`\`\`bash
   npm run docker:build
   \`\`\`

2. **Set up monitoring**:
   \`\`\`bash
   # Monitor Docker resources
   docker stats
   
   # Monitor container logs
   docker logs <container-id>
   \`\`\`

3. **Configure resource limits** based on server capacity

4. **Set up log rotation** for Docker logs

5. **Regular cleanup**:
   \`\`\`bash
   # Clean up old containers and images
   docker system prune -f
