// pipeline {
//     agent any
    
//     environment {
//         DOCKER_REGISTRY = 'jingluv'
//         GIT_HASH = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
//         GITLAB_CREDENTIALS = credentials('s108_gitlab')
//         DOCKER_CREDENTIALS = credentials('khk-docker')
//     }

//     stages {
//         stage('Docker Login') {
//             steps {
//                 sh "echo ${DOCKER_CREDENTIALS_PSW} | docker login ${DOCKER_REGISTRY} -u ${DOCKER_CREDENTIALS_USR} --password-stdin"
//             }
//         }

//         stage('Parallel Build and Push') {
//             parallel {
//                 stage('Backend') {
//                     steps {
//                         dir('backend') {
//                             script {
//                                 sh """
//                                     docker-compose -f docker-compose-ci.yml build backend
//                                     docker-compose -f docker-compose-ci.yml build backend-lts
//                                     docker-compose -f docker-compose-ci.yml push backend
//                                     docker-compose -f docker-compose-ci.yml push backend-lts
//                                 """
//                             }
//                         }
//                     }
//                 }

//                 stage('Data Service') {
//                     steps {
//                         dir('data') {
//                             script {
//                                 sh """
//                                     docker-compose -f docker-compose-ci.yml build data
//                                     docker-compose -f docker-compose-ci.yml build data-lts
//                                     docker-compose -f docker-compose-ci.yml push data
//                                     docker-compose -f docker-compose-ci.yml push data-lts
//                                 """
//                             }
//                         }
//                     }
//                 }

//                 stage('Frontend') {
//                     steps {
//                         dir('frontend') {
//                             script {
//                                 sh """
//                                     docker-compose -f docker-compose-ci.yml build frontend
//                                     docker-compose -f docker-compose-ci.yml build frontend-lts
//                                     docker-compose -f docker-compose-ci.yml push frontend
//                                     docker-compose -f docker-compose-ci.yml push frontend-lts
//                                 """
//                             }
//                         }
//                     }
//                 }
//             }
//         }

//         stage('Deploy') {
//             when { branch 'main' }
//             steps {
//                 withCredentials([sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'SSH_KEY')]) {
//                     sh """
//                         ssh -i ${SSH_KEY} ec2-user@your-ec2-ip '
//                             cd /path/to/your/app
//                             docker-compose -f docker-compose-cd.yml pull
//                             docker-compose -f docker-compose-cd.yml up -d
//                         '
//                     """
//                 }
//             }
//         }
//     }
    
//     post {
//         always {
//             sh 'docker system prune -f'
//             sh 'docker logout ${DOCKER_REGISTRY}'
//         }
//     }
// }