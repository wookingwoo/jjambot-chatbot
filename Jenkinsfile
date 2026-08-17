pipeline {
  agent any

  options {
    disableConcurrentBuilds()
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Write env') {
      steps {
        withCredentials([file(credentialsId: 'jjambot-chatbot-env', variable: 'ENV_FILE')]) {
          sh 'cp "$ENV_FILE" .env'
        }
      }
    }

    stage('Deploy') {
      steps {
        sh 'docker compose up -d --build'
      }
    }
  }

  post {
    always {
      sh 'docker image prune -f'
    }
  }
}
