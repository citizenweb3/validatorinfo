pipeline {
    agent any
    environment {
        // Определяем переменные окружения для портов (для документации или будущих расширений)
        DEV_PORT_FRONTEND = '3000'
        DEV_PORT_INDEXER = '3001'
        MAIN_PORT_FRONTEND = '4000'
        MAIN_PORT_INDEXER = '4001'
        // Переменная для секрета базы данных (будет подтягиваться из Jenkins Credentials)
        //POSTGRES_PASSWORD = credentials('postgres-password')
    }
    stages {
        stage('Build') {
            steps {
                script {
                    if (env.BRANCH_NAME == 'dev') {
                        sh 'docker compose -f docker-compose.dev.yml build'
                    } else if (env.BRANCH_NAME == 'main') {
                        sh 'docker compose -f docker-compose.main.yml build'
                    }
                }
            }
        }
        stage('Deploy') {
            steps {
                script {
                    if (env.BRANCH_NAME == 'dev') {
                        sh 'docker compose -f docker-compose.dev.yml down'
                        sh 'docker compose -f docker-compose.dev.yml up -d'
                    } else if (env.BRANCH_NAME == 'main') {
                        sh 'docker compose -f docker-compose.main.yml down'
                        sh 'docker compose -f docker-compose.main.yml up -d'
                    }
                }
            }
        }
    }
}