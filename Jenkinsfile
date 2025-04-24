pipeline {
    agent {
        label (
            env.BRANCH_NAME == 'main' ? 'Heracles' :
            env.BRANCH_NAME == 'dev' ? 'valinfo' :
            env.BRANCH_NAME == 'charts' ? 'cloud' : ''
        )
    }

    environment {
        DEV_PORT_FRONTEND = '3000'
        DEV_PORT_INDEXER = '3001'
        MAIN_PORT_FRONTEND = '4000'
        MAIN_PORT_INDEXER = '4001'
        CHARTS_PORT_FRONTEND = '5000'
        CHARTS_PORT_INDEXER = '5001'

        COMPOSE_FILE = (
            env.BRANCH_NAME == 'main' ? 'docker-compose.main.yml' :
            env.BRANCH_NAME == 'dev' ? 'docker-compose.dev.yml' :
            env.BRANCH_NAME == 'charts' ? 'docker-compose.charts.yml' : ''
        )
    }

    stages {
        stage('Build') {
            steps {
                script {
                    if (!COMPOSE_FILE) {
                        error "Unknown branch: ${env.BRANCH_NAME}"
                    }
                    sh "docker-compose -f ${COMPOSE_FILE} build"
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    sh "docker-compose -f ${COMPOSE_FILE} up -d --build"
                }
            }
        }
    }

    post {
        failure {
            echo "❌ Something went wrong."
        }
        success {
            echo "✅ Deploy finished successfully on branch ${env.BRANCH_NAME}"
        }
    }
}