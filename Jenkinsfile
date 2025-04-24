pipeline {
    agent {
        label {
            // Определяем агент на основе ветки
            script {
                if (env.BRANCH_NAME == 'main') {
                    return 'Heracles'
                } else if (env.BRANCH_NAME == 'dev') {
                    return 'valinfo'
                } else if (env.BRANCH_NAME == 'charts') {
                    return 'cloud'
                } else {
                    error "Unknown branch: ${env.BRANCH_NAME}. Supported branches: main, dev, charts."
                }
            }
        }
    }
    environment {
        DEV_PORT_FRONTEND = '3000'
        DEV_PORT_INDEXER = '3001'
        MAIN_PORT_FRONTEND = '4000'
        MAIN_PORT_INDEXER = '4001'
        CHARTS_PORT_FRONTEND = '5000'
        CHARTS_PORT_INDEXER = '5001'
        // Определяем файл Docker Compose на основе ветки
        COMPOSE_FILE = "${env.BRANCH_NAME == 'main' ? 'docker-compose.main.yml' : env.BRANCH_NAME == 'dev' ? 'docker-compose.dev.yml' : 'docker-compose.charts.yml'}"
    }
    stages {
        stage('Build') {
            steps {
                script {
                    // Проверка на случай, если COMPOSE_FILE не установлен (хотя это уже проверено в agent)
                    if (!env.COMPOSE_FILE) {
                        error "COMPOSE_FILE is not defined for branch: ${env.BRANCH_NAME}"
                    }
                    // Используем docker compose v2
                    sh "docker compose -f ${env.COMPOSE_FILE} build"
                }
            }
        }
        stage('Deploy') {
            steps {
                script {
                    // Запускаем контейнеры с пересборкой, если нужно
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