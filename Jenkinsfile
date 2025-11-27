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
        // Define your Registry URL and Project Name here for easier updates
        NEXUS_URL = 'nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085'
        PROJECT_NAME = '2401205_Learniva' // Keep your specific project folder
        BACKEND_IMAGE = 'learniva-backend'
        FRONTEND_IMAGE = 'learniva-frontend'
    }

    stages {
        // 1. Build the Docker Images
        stage('Build Docker Images') {
            steps {
                container('dind') {
                    sh '''
                        # Wait for Docker daemon
                        sleep 5
                        
                        echo "--- Building Backend Image ---"
                        # Assuming server code is in ./server folder
                        docker build -t ${BACKEND_IMAGE}:latest ./server

                        echo "--- Building Frontend Image ---"
                        # Assuming frontend Dockerfile is in root (based on previous steps)
                        docker build -t ${FRONTEND_IMAGE}:latest .
                        
                        docker image ls
                    '''
                }
            }
        }

        // 2. Code Quality Check
        stage('SonarQube Analysis') {
            steps {
                container('sonar-scanner') {
                     // Ensure you use the correct credentials ID from your Jenkins
                     withCredentials([string(credentialsId: '2401205_Learniva', variable: 'SONAR_TOKEN')]) {
                        sh '''
                            sonar-scanner \
                                -Dsonar.projectKey= 2401205_Learniva_key\
                                -Dsonar.host.url=http://my-sonarqube-sonarqube.sonarqube.svc.cluster.local:9000 \
                                -Dsonar.login=$SONAR_TOKEN \
                                -Dsonar.sources=. \
                                -Dsonar.exclusions=*/node_modules/,/dist/,/coverage/* \
                                -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                        '''
                    }
                }
            }
        }

        // 3. Login to Nexus
        stage('Login to Docker Registry') {
            steps {
                container('dind') {
                    // Update username/password if they are different
                    sh "docker login ${NEXUS_URL} -u admin -p Changeme@2025"
                }
            }
        }

        // 4. Push Images to Nexus
        stage('Tag & Push Images') {
            steps {
                container('dind') {
                    sh '''
                        # --- Handle Backend ---
                        docker tag ${BACKEND_IMAGE}:latest ${NEXUS_URL}/${PROJECT_NAME}/${BACKEND_IMAGE}:latest
                        docker push ${NEXUS_URL}/${PROJECT_NAME}/${BACKEND_IMAGE}:latest

                        # --- Handle Frontend ---
                        docker tag ${FRONTEND_IMAGE}:latest ${NEXUS_URL}/${PROJECT_NAME}/${FRONTEND_IMAGE}:latest
                        docker push ${NEXUS_URL}/${PROJECT_NAME}/${FRONTEND_IMAGE}:latest
                    '''
                }
            }
        }
        
        // 5. Deploy to Kubernetes
        stage('Deploy SwarSetu App') {
            steps {
                container('kubectl') {
                    script {
                        // Assuming your K8s YAML files are in a folder named 'k8s'
                        // or listing specific files if they are in root
                        sh '''
                            # Apply Database, Backend, and Frontend
                            kubectl apply -f k8s/ -n 2401205

                            # Force restart to pick up new images
                            kubectl rollout restart deployment/backend-deployment -n 2401205
                            kubectl rollout restart deployment/frontend-deployment -n 2401205
                            
                            # Wait for rollout to verify success
                            kubectl rollout status deployment/backend-deployment -n 2401205
                            kubectl rollout status deployment/frontend-deployment -n 2401205
                        '''
                    }
                }
            }
        }
    }
}