pipeline {
    agent any

    environment {
        BRANCH_NAME = "blog"
        IMAGE_NAME = "blog"
        CONTAINER_NAME = "blog"
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: "${BRANCH_NAME}", url: 'https://github.com/citizenweb3/validatorinfo.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh """
                    docker build -t ${IMAGE_NAME}:latest .
                    """
                }
            }
        }

        stage('Run Docker Container') {
            steps {
                script {
                    sh """
                    docker stop ${CONTAINER_NAME} || true
                    docker rm ${CONTAINER_NAME} || true
                    """

                    sh """
                    docker run -d --name ${CONTAINER_NAME} -p 5000:4000 ${IMAGE_NAME}:latest
                    """
                }
            }
        }

        stage('Test Application') {
            steps {
                script {
                    sh """
                    docker ps | grep ${CONTAINER_NAME}
                    """
                }
            }
        }
    }

    post {
        always {
            echo "Pipeline for branch '${BRANCH_NAME}' finished!"
        }
        success {
            echo "Blog successfully built and started in Docker!"
        }
        failure {
            echo "Something went wrong in the pipeline!"
        }
    }
}
