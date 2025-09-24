pipeline {
    agent none  // Глобального агента не задаём

    environment {
        DEV_PORT_FRONTEND = '3000'
        DEV_PORT_INDEXER = '3001'
        MAIN_PORT_FRONTEND = '4000'
        MAIN_PORT_INDEXER = '4001'
        CHARTS_PORT_FRONTEND = '5000'
        CHARTS_PORT_INDEXER = '5001'

        // Определяем файл Docker Compose в зависимости от ветки
        COMPOSE_FILE = "${env.BRANCH_NAME == 'main' ? 'docker-compose.main.yml' : env.BRANCH_NAME == 'dev' ? 'docker-compose.dev.yml' : env.BRANCH_NAME == 'charts' ? 'docker-compose.charts.yml' : ''}"
    }

    stages {
        stage('Build') {
            agent {
                label getAgentLabel(env.BRANCH_NAME)
            }
            steps {
                script {
                    if (!env.COMPOSE_FILE) {
                        error "Unknown branch: ${env.BRANCH_NAME}. Supported branches: main, dev, charts."
                    }
                    sh "docker compose -f ${env.COMPOSE_FILE} build"
                }
            }
        }

        stage('Deploy') {
            agent {
                label getAgentLabel(env.BRANCH_NAME)
            }
            steps {
                script {
                    sh "docker compose -f ${env.COMPOSE_FILE} up -d --build"
                }
            }
        }
    }

    post {
        failure {
            echo "❌ Pipeline failed for branch ${env.BRANCH_NAME}. Check logs for details."
        }
        success {
            echo "✅ Deploy completed successfully for branch ${env.BRANCH_NAME}"
        }
    }
}

// Функция для выбора метки агента
def getAgentLabel(String branchName) {
    if (branchName == 'main') {
        return 'Heracles'
    } else if (branchName == 'dev') {
        return 'Heracles'
    } else if (branchName == 'charts') {
        return 'cloud'
    } else {
        error "Unknown branch: ${branchName}. Supported branches: main, dev, charts."
    }
}