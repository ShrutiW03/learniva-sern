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
        // Registry URL (Keep your specific lab/environment URL)
        NEXUS_URL = 'nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085'
        
        // Your Project Name (Keep your specific ID)
        PROJECT_NAME = '2401205_Learniva'
        
        // ✅ CHANGED: Match your server/client naming convention
        BACKEND_IMAGE = 'learniva-server'
        FRONTEND_IMAGE = 'learniva-client'
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
                        # ✅ Server is in ./server folder
                        docker build -t ${BACKEND_IMAGE}:latest ./server

                        echo "--- Building Frontend Image ---"
                        # ✅ CHANGED: Frontend is in ./client folder (not root)
                        docker build -t ${FRONTEND_IMAGE}:latest ./client
                        
                        docker image ls
                    '''
                }
            }
        }

        // 2. Code Quality Check
        stage('SonarQube Analysis') {
            steps {
                container('sonar-scanner') {
                      // Ensure '2401205_Learniva' matches the ID inside Jenkins "Manage Credentials"
                      withCredentials([string(credentialsId: '2401205_Learniva', variable: 'SONAR_TOKEN')]) {
                        sh '''
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

        // 3. Login to Nexus
        stage('Login to Docker Registry') {
            steps {
                container('dind') {
                    // Update password if you changed it from the default
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
        stage('Deploy Learniva App') {
            steps {
                container('kubectl') {
                    script {
                        sh '''
                            # Apply all configs in the k8s folder
                            # Using namespace 2401205 (Make sure this exists in your cluster!)
                            kubectl apply -f k8s/ -n 2401205

                            # ✅ CHANGED: Use correct deployment names from your YAML files
                            # In k8s/server.yaml we named it "server"
                            kubectl rollout restart deployment/server -n 2401205
                            
                            # In k8s/client.yaml we named it "client"
                            kubectl rollout restart deployment/client -n 2401205
                            
                            # Verify success
                            kubectl rollout status deployment/server -n 2401205
                            kubectl rollout status deployment/client -n 2401205
                        '''
                    }
                }
            }
        }
    }
}