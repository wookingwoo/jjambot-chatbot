pipeline {
  agent any

  options {
    disableConcurrentBuilds()
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Deploy') {
      when { branch 'main' }
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
