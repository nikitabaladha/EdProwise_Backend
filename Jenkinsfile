pipeline {
    agent any

    stages {
        stage('Clone Repository') {
            steps {
                echo '📥 Cloning code from GitHub...'
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                echo '🐳 Building Docker image...'
                sh 'docker build -t edprowise-backend .'
            }
        }

        stage('Run Docker Container') {
            steps {
                echo '🚀 Running Docker container...'

                // Stop and remove old container if exists
                sh '''
                if [ $(docker ps -aq -f name=edprowise-backend-container) ]; then
                  docker stop edprowise-backend-container || true
                  docker rm edprowise-backend-container || true
                fi

                docker run -d \
                  --name edprowise-backend-container \
                  -p 3001:3001 \
                  edprowise-backend
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Deployment completed successfully!'
        }
        failure {
            echo '❌ Build or deployment failed!'
        }
    }
}
