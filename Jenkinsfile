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
        PROJECT_NAME = '2401205_Learniva' 
        
        // These match the names in your k8s/server.yaml and k8s/client.yaml
        BACKEND_IMAGE = 'learniva-server'
        FRONTEND_IMAGE = 'learniva-client'
        // --------------------------------------------------------
    }

    stages {
        stage('Build Docker Images') {
            steps {
                container('dind') {
                    sh '''
                        echo "--- 🐳 Waiting for Docker Daemon ---"
                        sleep 5
                        
                        echo "--- 🔨 Building Backend Image (Server) ---"
                        # Build from the 'server' folder
                        docker build -t ${BACKEND_IMAGE}:latest ./server

                        echo "--- 🔨 Building Frontend Image (Client) ---"
                        # Build from the 'client' folder
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
        
    
        stage('Deploy Learniva App') {
            steps {
                container('kubectl') {
                    script {
                        sh '''
                            echo "--- ☸️ Deploying to Kubernetes ---"
                            
                            # Apply all configs in the k8s folder
                            # Using namespace 2401205 (Ensure this exists!)
                            kubectl apply -f k8s/ -n 2401205

                            # Restart deployments to pick up the new images
                            # These names (server, client) MUST match metadata.name in your YAML files
                            kubectl rollout restart deployment/server -n 2401205
                            kubectl rollout restart deployment/client -n 2401205
                            
                            echo "--- ⏳ Waiting for Rollout ---"
                            kubectl rollout status deployment/server -n 2401205
                            kubectl rollout status deployment/client -n 2401205
                        '''
                    }
                }
            }
        }
    }
}