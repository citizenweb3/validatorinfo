pipeline {
    agent any

    environment {
        PM2_SERVICE_APP = "${env.BRANCH_NAME == 'main' ? 'main-app' : 'next'}"
        PM2_SERVICE_INDEXER = "${env.BRANCH_NAME == 'main' ? 'main-indexer' : 'indexer'}"
    }

    triggers {
        githubPush() // Trigger
    }

    stages {
        stage('Checkout code') {
            steps {
                git branch: "${env.BRANCH_NAME}", url: 'https://github.com/citizenweb3/validatorinfo.git'
            }
        }

        stage('Install dependencies') {
            steps {
                script {
                    sh 'yarn'
                    sh 'make generate-schema'
                    sh 'yarn build'
                    sh "pm2 restart ${PM2_SERVICE_APP}"
                }
            }
        }

        stage('Indexer') {
            steps {
                script {
                    sh "pm2 restart ${PM2_SERVICE_INDEXER}"
                }
            }
        }
    }

    post {
        always {
            script {
                sh 'pm2 save'
                sh 'pm2 list'
            }
        }
    }
}
