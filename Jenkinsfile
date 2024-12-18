pipeline {
    agent any

    stages {
        stage('Checkout code') {
            steps {
                git branch: 'next', url: 'https://github.com/citizenweb3/validatorinfo.git'
            }
        }
        
        stage('Install dependencies') {
            steps {
                script {
                    sh 'yarn'
                    sh 'make generate-schema'
                    sh 'yarn build'
                    sh 'pm2 restart next'
                }
            }
        }
            
        stage('Indexer') {
            steps {
                script {
                    sh 'pm2 restart indexer'
                }
            }
        }
    } // Закрытие блока stages

    post {
        always {
            script {
                sh 'pm2 save'
                sh 'pm2 list'
            }
        }
    } // Закрытие блока post
}
