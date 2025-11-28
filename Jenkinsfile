pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: sonar-scanner
    image: sonarsource/sonar-scanner-cli
    command:
    - cat
    tty: true
  - name: kubectl
    image: bitnami/kubectl:latest
    command:
    - cat
    tty: true
    securityContext:
      runAsUser: 0
    env:
    - name: KUBECONFIG
      value: /kube/config        
    volumeMounts:
    - name: kubeconfig-secret
      mountPath: /kube/config
      subPath: kubeconfig
  - name: dind
    image: docker:dind
    securityContext:
      privileged: true
    env:
    - name: DOCKER_TLS_CERTDIR
      value: ""
    volumeMounts:
    - name: docker-config
      mountPath: /etc/docker/daemon.json
      subPath: daemon.json
  volumes:
  - name: docker-config
    configMap:
      name: docker-daemon-config
  - name: kubeconfig-secret
    secret:
      secretName: kubeconfig-secret
'''
        }
    }
    
    environment {
        NEXUS_URL = 'nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085'
        
        // This matches the folder/tag in Nexus
        PROJECT_NAME = '2401205_learniva' 
        
        // These match the names in your k8s/server.yaml and k8s/client.yaml
        BACKEND_IMAGE = 'learniva-server'
        FRONTEND_IMAGE = 'learniva-client'
        // --------------------------------------------------------
    }

    stages {
       // 1. Build the Docker Images
        stage('Build Docker Images') {
            steps {
                container('dind') {
                    sh '''
                        echo "--- 🐳 Waiting for Docker Daemon to be ready... ---"
                        
                        # loops until 'docker info' returns success (daemon is up)
                        while ! docker info > /dev/null 2>&1; do
                            echo "Waiting for Docker daemon..."
                            sleep 1
                        done
                        
                        echo "--- 🐳 Docker is Ready! ---"
                        
                        echo "--- 🔨 Building Backend Image (Server) ---"
                        docker build -t ${BACKEND_IMAGE}:latest ./server

                        echo "--- 🔨 Building Frontend Image (Client) ---"
                        docker build -t ${FRONTEND_IMAGE}:latest ./client
                        
                        echo "--- ✅ Images Built ---"
                        docker image ls
                    '''
                }
            }
        }
    
        stage('SonarQube Analysis') {
            steps {
                container('sonar-scanner') {
                      // Ensure '2401205_Learniva' exists in Jenkins Credentials
                      withCredentials([string(credentialsId: '2401205_Learniva', variable: 'SONAR_TOKEN')]) {
                        sh '''
                            echo "--- 🔍 Starting Code Analysis ---"
                            sonar-scanner \
                                -Dsonar.projectKey=2401205_Learniva_key \
                                -Dsonar.host.url=http://my-sonarqube-sonarqube.sonarqube.svc.cluster.local:9000 \
                                -Dsonar.login=$SONAR_TOKEN \
                                -Dsonar.sources=. \
                                -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/coverage/** \
                                -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                        '''
                    }
                }
            }
        }

    
        stage('Login to Docker Registry') {
            steps {
                container('dind') {
                    sh "docker login ${NEXUS_URL} -u admin -p Changeme@2025"
                }
            }
        }

    
        stage('Tag & Push Images') {
            steps {
                container('dind') {
                    sh '''
                        echo "--- 🚀 Pushing Backend to Nexus ---"
                        docker tag ${BACKEND_IMAGE}:latest ${NEXUS_URL}/${PROJECT_NAME}/${BACKEND_IMAGE}:latest
                        docker push ${NEXUS_URL}/${PROJECT_NAME}/${BACKEND_IMAGE}:latest

                        echo "--- 🚀 Pushing Frontend to Nexus ---"
                        docker tag ${FRONTEND_IMAGE}:latest ${NEXUS_URL}/${PROJECT_NAME}/${FRONTEND_IMAGE}:latest
                        docker push ${NEXUS_URL}/${PROJECT_NAME}/${FRONTEND_IMAGE}:latest
                    '''
                }
            }
        }
        
    
        // 5. Deploy to Kubernetes
        stage('Deploy Learniva App') {
            steps {
                container('kubectl') {
                    script {
                        sh '''
                            echo "--- ☸️ Deploying to Kubernetes ---"
                            

                            # Apply all configs to that namespace
                            kubectl apply -f k8/ -n 2401205

                        '''
                    }
                }
            }
        }
    }
}