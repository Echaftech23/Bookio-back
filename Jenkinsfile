pipeline {
    agent any
    
    environment {
        EC2_HOST = 'ec2-3-72-63-253.eu-central-1.compute.amazonaws.com'
        EC2_USER = 'ubuntu'
        GITHUB_REPO = 'https://github.com/Echaftech23/Bookio-back'
        BRANCH = 'feat/BB-13-cicd-workflow'
        DEPLOY_DIR = 'Bookio-back'
    }

    stages {
        stage('Setup Environment') {
            steps {
                withCredentials([file(credentialsId: 'back-env-production', variable: 'ENV_FILE')]) {
                    sh 'cp $ENV_FILE .env'
                }
            }
        }
        stage('Deploy to EC2') {
            steps {
                script {
                    def remote = [:]
                    remote.name = 'ec2-server'
                    remote.host = EC2_HOST
                    remote.user = EC2_USER
                    remote.allowAnyHosts = true
                    
                    // Use Jenkins credentials for SSH key
                    withCredentials([sshUserPrivateKey(credentialsId: 'bookio-backendec2-key', keyFileVariable: 'identity')]) {
                        remote.identityFile = identity

                        // Copy .env file to EC2 instance
                        sshPut remote: remote, from: '.env', into: "${DEPLOY_DIR}/.env"
                        
                        // SSH commands using the plugin syntax
                        sshCommand remote: remote, command: """
                            cd ${DEPLOY_DIR}
                            git pull origin ${BRANCH}
                            npm install
                            npm run build
                            pm2 restart nestjs-app
                        """
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo 'Successfully deployed to EC2 instance'
        }
        failure {
            echo 'Deployment failed'
        }
    }
}