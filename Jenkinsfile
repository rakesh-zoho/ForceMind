pipeline {
  agent any

  tools {
    nodejs 'Node20'
  }

  parameters {
    choice(
      name: 'TEST_SUITE',
      choices: ['all', 'lead', 'account', 'opportunity', 'contact', 'case'],
      description: 'Which test suite to run'
    )
    booleanParam(
      name: 'HEADED',
      defaultValue: false,
      description: 'Run browser in headed mode'
    )
    string(
      name: 'RETRIES',
      defaultValue: '2',
      description: 'Playwright retry count on failure'
    )
  }

  environment {
    CI       = 'true'
    HEADLESS = "${!params.HEADED}"
    NODE_PATH = "${WORKSPACE}/node_modules"
  }

  options {
    timeout(time: 60, unit: 'MINUTES')
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
    timestamps()
  }

  triggers {
    cron('H 2 * * *')
  }

  stages {
    stage('Clean Workspace') {
      steps {
        bat 'if exist reports\\allure-results rmdir /s /q reports\\allure-results'
        bat 'if exist reports\\allure-report rmdir /s /q reports\\allure-report'
        bat 'if exist reports\\playwright-report rmdir /s /q reports\\playwright-report'
        bat 'if exist reports\\junit-results.xml del /f reports\\junit-results.xml'
      }
    }

    stage('Checkout') {
      steps {
        checkout scm
        bat '''
          echo "Branch: ${GIT_BRANCH}"
          echo "Commit: ${GIT_COMMIT}"
          node --version
          npm  --version
        '''
      }
    }

    stage('Install Dependencies') {
      steps {
        bat 'npm ci'
      }
    }

    stage('Install Playwright Browsers') {
      steps {
        bat 'npx playwright install chromium --with-deps'
      }
    }

    stage('Run Tests') {
      steps {
        withCredentials([
          string(credentialsId: 'SF_URL',     variable: 'SF_URL'),
          string(credentialsId: 'SF_USERNAME', variable: 'SF_USERNAME'),
          string(credentialsId: 'SF_PASSWORD', variable: 'SF_PASSWORD'),
        ]) {
          script {
            def cmd = 'npx playwright test --config=config/playwright.config.js'
            cmd += " --retries=${params.RETRIES}"

            switch (params.TEST_SUITE) {
              case 'lead':
                cmd += ' tests/lead-creation.spec.js'
                break
              case 'opportunity':
                cmd += ' tests/opportunity-creation.spec.js'
                break
              case 'account':
                cmd += ' tests/account-creation.spec.js'
                break
              case 'contact':
                cmd += ' tests/contact-creation.spec.js'
                break
              case 'case':
                cmd += ' tests/case-creation.spec.js'
                break
              default:
                break
            }

            bat cmd
          }
        }
      }
      post {
        always {
          stash includes: 'reports/**', name: 'test-results', allowEmpty: true
        }
      }
    }
  }

  post {
    always {
      allure([
        includeProperties: false,
        jdk: '',
        results: [[path: 'reports/allure-results']],
        report: 'reports/allure-report',
        reportBuildPolicy: 'ALWAYS'
      ])

      junit(
        testResults: 'reports/junit-results.xml',
        allowEmptyResults: true
      )

      archiveArtifacts(
        artifacts: 'reports/test-results/**,reports/screenshots/**',
        allowEmptyArchive: true
      )

      publishHTML(target: [
        allowMissing:          true,
        alwaysLinkToLastBuild: true,
        keepAll:               true,
        reportDir:             'reports/playwright-report',
        reportFiles:           'index.html',
        reportName:            'Playwright Report'
      ])
    }

    success {
      echo 'All SF tests passed!'
    }

    failure {
      echo 'Tests failed - check Allure report and archived screenshots.'
    }
  }
}
