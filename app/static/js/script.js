let currentStep = 1;
const totalSteps = 4;

// 단계 관리
function showStep(step) {
    document.querySelectorAll('.step').forEach(el => el.style.display = 'none');
    document.getElementById(`step${step}`).style.display = 'block';
    
    document.getElementById('prevBtn').style.display = step === 1 ? 'none' : 'flex';
    document.getElementById('nextBtn').textContent = step === totalSteps ? '완료' : '다음';
    document.querySelector('.download-btn').style.display = step === totalSteps ? 'flex' : 'none';
}

function nextStep() {
    if (currentStep < totalSteps) {
        currentStep++;
        showStep(currentStep);
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
}

// 패키지 관련 함수들
const defaultPackages = {
    'python': {
        manager: 'pip',
        packages: [
            'flask', 'django', 'requests', 'pandas', 'numpy', 
            'pytest', 'sqlalchemy', 'pillow', 'gunicorn'
        ]
    },
    'node': {
        manager: 'npm',
        packages: [
            'express', 'react', 'vue', 'axios', 'lodash', 
            'moment', 'jest', 'typescript', 'webpack'
        ]
    },
    'openjdk': {
        manager: 'apt-get',
        packages: [
            'maven', 'gradle', 'ant', 'git', 'curl', 
            'wget', 'unzip', 'vim'
        ]
    },
    'php': {
        manager: 'apt-get',
        packages: [
            'php-mysql', 'php-pgsql', 'php-redis', 
            'php-gd', 'php-xml', 'composer'
        ]
    },
    'nginx': {
        manager: 'apt-get',
        packages: [
            'curl', 'wget', 'vim', 'certbot', 
            'python3-certbot-nginx', 'logrotate'
        ]
    },
    'httpd': {
        manager: 'apt-get',
        packages: [
            'curl', 'wget', 'vim', 'ssl-cert', 
            'mod_ssl', 'certbot'
        ]
    },
    'ubuntu': {
        manager: 'apt-get',
        packages: [
            'curl', 'wget', 'git', 'vim', 'nginx', 
            'postgresql', 'redis', 'supervisor'
        ]
    },
    'debian': {
        manager: 'apt-get',
        packages: [
            'curl', 'wget', 'git', 'vim', 'nginx', 
            'postgresql', 'redis', 'supervisor'
        ]
    },
    'alpine': {
        manager: 'apk',
        packages: [
            'curl', 'wget', 'git', 'vim', 'nginx', 
            'postgresql', 'redis', 'supervisor'
        ]
    }
};

function updatePackageList(image) {
    // 이미지 타입 추출 (예: python:3.9-slim -> python)
    const imageType = image.split(':')[0].toLowerCase();
    const packages = defaultPackages[imageType];
    const packageSelector = document.getElementById('packageSelector');
    
    if (packages && packages.packages.length > 0) {
        packageSelector.innerHTML = `
            <div class="common-packages">
                ${packages.packages.map(pkg => `
                    <button type="button" class="package-btn" data-package="${pkg}">
                        ${pkg}
                    </button>
                `).join('')}
            </div>
        `;

        // 패키지 선택 이벤트
        packageSelector.querySelectorAll('.package-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                this.classList.toggle('selected');
                updateSelectedPackages();
            });
        });
        
        packageSelector.style.display = 'block';
    } else {
        packageSelector.innerHTML = '<p>이 이미지에 대한 기본 패키지가 없습니다.</p>';
        packageSelector.style.display = 'block';
    }
}

function updateSelectedPackages() {
    // 기존 패키지 설치 명령어 제거
    const runsDiv = document.getElementById('runs');
    Array.from(runsDiv.children).forEach(child => {
        if (child.querySelector('input') && 
            child.querySelector('input').value.includes('install')) {
            child.remove();
        }
    });
    
    const selectedPackages = Array.from(document.querySelectorAll('.package-btn.selected'))
        .map(btn => btn.dataset.package);
    
    if (selectedPackages.length > 0) {
        const imageType = document.querySelector('input[name="base_image"]').value.split(':')[0];
        const manager = defaultPackages[imageType]?.manager;
        
        if (manager) {
            let installCommands = [];
            switch(manager) {
                case 'pip':
                    installCommands.push(`pip install ${selectedPackages.join(' ')}`);
                    break;
                case 'npm':
                    installCommands.push(`npm install ${selectedPackages.join(' ')}`);
                    break;
                case 'apt-get':
                    // apt-get update는 한 번만 추가
                    if (!Array.from(runsDiv.children).some(child => 
                        child.querySelector('input')?.value.includes('apt-get update'))) {
                        installCommands.push('apt-get update');
                    }
                    installCommands.push(`apt-get install -y ${selectedPackages.join(' ')}`);
                    break;
            }
            
            installCommands.forEach(cmd => {
                const runGroup = document.createElement('div');
                runGroup.className = 'input-group';
                runGroup.innerHTML = `
                    <input type="text" value="${cmd}" readonly>
                    <button type="button" onclick="removeElement(this.parentElement)" class="remove-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                runsDiv.appendChild(runGroup);
            });
            
            updatePreview();
        }
    }
}

// 요소 추가/제거 함수들
function addPort() {
    const portsDiv = document.getElementById('ports');
    const portNumber = document.querySelector('.port-number').value;
    const protocol = document.querySelector('.port-protocol').value;
    
    if (portNumber) {
        const portGroup = document.createElement('div');
        portGroup.className = 'input-group';
        portGroup.innerHTML = `
            <input type="text" value="${portNumber}/${protocol}" readonly>
            <button type="button" onclick="removeElement(this.parentElement)" class="remove-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;
        portsDiv.appendChild(portGroup);
        document.querySelector('.port-number').value = '';
        updatePreview();
    }
}

function addEnv() {
    const envsDiv = document.getElementById('envs');
    const keyInput = document.querySelector('.env-key');
    const valueInput = document.querySelector('.env-value');
    
    if (keyInput.value && valueInput.value) {
        const envGroup = document.createElement('div');
        envGroup.className = 'input-group';
        envGroup.innerHTML = `
            <input type="text" value="${keyInput.value}=${valueInput.value}" readonly>
            <button type="button" onclick="removeElement(this.parentElement)" class="remove-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;
        envsDiv.appendChild(envGroup);
        keyInput.value = '';
        valueInput.value = '';
        updatePreview();
    }
}

function addCopy() {
    const copiesDiv = document.getElementById('copies');
    const srcInput = document.querySelector('.copy-src');
    const destInput = document.querySelector('.copy-dest');
    
    if (srcInput.value && destInput.value) {
        const copyGroup = document.createElement('div');
        copyGroup.className = 'input-group';
        copyGroup.innerHTML = `
            <input type="text" value="${srcInput.value} → ${destInput.value}" readonly>
            <button type="button" onclick="removeElement(this.parentElement)" class="remove-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;
        copiesDiv.appendChild(copyGroup);
        srcInput.value = '';
        destInput.value = '';
        updatePreview();
    }
}

function addRun() {
    const runsDiv = document.getElementById('runs');
    const commandInput = document.querySelector('.run-command');
    
    if (commandInput.value.trim()) {
        const runGroup = document.createElement('div');
        runGroup.className = 'input-group';
        runGroup.innerHTML = `
            <input type="text" value="${commandInput.value}" readonly>
            <button type="button" onclick="removeElement(this.parentElement)" class="remove-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;
        runsDiv.appendChild(runGroup);
        commandInput.value = '';
        updatePreview();
    }
}

function addCmd() {
    const cmdsDiv = document.getElementById('cmds');
    const commandInput = document.querySelector('.cmd-command');
    const command = commandInput.value.trim();
    
    if (command) {
        const cmdGroup = document.createElement('div');
        cmdGroup.className = 'input-group';
        cmdGroup.innerHTML = `
            <input type="text" value="${command}" readonly>
            <button type="button" onclick="removeElement(this.parentElement)" class="remove-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;
        cmdsDiv.appendChild(cmdGroup);
        commandInput.value = '';
        updatePreview();
    }
}

function removeElement(element) {
    element.remove();
    updatePreview();
}

// 데벨 추가
function addLabel() {
    const labelsDiv = document.getElementById('labels');
    const keyInput = document.querySelector('.label-key');
    const valueInput = document.querySelector('.label-value');
    
    if (keyInput.value.trim() && valueInput.value.trim()) {
        const labelGroup = document.createElement('div');
        labelGroup.className = 'input-group';
        labelGroup.innerHTML = `
            <input type="text" value="${keyInput.value}=${valueInput.value}" readonly>
            <button type="button" onclick="removeElement(this.parentElement)" class="remove-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;
        labelsDiv.appendChild(labelGroup);
        keyInput.value = '';
        valueInput.value = '';
        updatePreview();
    }
}

// ENTRYPOINT 추가
function addEntrypoint() {
    const entrypointsDiv = document.getElementById('entrypoints');
    const commandInput = document.querySelector('.entrypoint-command');
    const command = commandInput.value.trim();
    
    if (command) {
        // 기존 ENTRYPOINT 제거 (하나만 유지)
        entrypointsDiv.querySelectorAll('.input-group').forEach(group => {
            group.remove();
        });
        
        const entrypointGroup = document.createElement('div');
        entrypointGroup.className = 'input-group';
        entrypointGroup.innerHTML = `
            <input type="text" value="${command}" readonly>
            <button type="button" onclick="removeElement(this.parentElement)" class="remove-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;
        entrypointsDiv.appendChild(entrypointGroup);
        commandInput.value = '';
        updatePreview();
    }
}

// 데이터 수집 및 미리보기
function collectFormData() {
    const data = {
        baseImage: document.querySelector('input[name="base_image"]').value,
        workdir: document.querySelector('input[name="workdir"]').value,
        labels: {},  // 라벨을 객체로 변경
        ports: Array.from(document.querySelectorAll('#ports .input-group input')).map(input => {
            const [number, protocol] = input.value.split('/');
            return { number, protocol };
        }),
        env: Array.from(document.querySelectorAll('#envs .input-group input')).map(input => {
            const [key, value] = input.value.split('=');
            return { key, value };
        }),
        copies: Array.from(document.querySelectorAll('#copies .input-group input')).map(input => {
            const [src, dest] = input.value.split(' → ');
            return { src, dest };
        }),
        runs: Array.from(document.querySelectorAll('#runs .input-group input')).map(input => input.value),
        cmds: Array.from(document.querySelectorAll('#cmds .input-group input')).map(input => input.value),
        entrypoint: Array.from(document.querySelectorAll('#entrypoints .input-group input')).map(input => input.value)[0],
        volumes: Array.from(document.querySelectorAll('#volumes .input-group input')).map(input => input.value),
        user: document.querySelector('input[name="user"]')?.value,
        shells: Array.from(document.querySelectorAll('#shells .input-group input')).map(input => input.value),
        healthchecks: Array.from(document.querySelectorAll('#healthchecks .input-group input')).map(input => {
            const [interval, ...command] = input.value.split(' ');
            return {
                interval: interval.replace('--interval=', '').replace('s', ''),
                command: command.join(' ')
            };
        })
    };

    // 라벨 데이터 수집
    document.querySelectorAll('#labels .input-group input').forEach(input => {
        const [key, value] = input.value.split('=');
        data.labels[key] = value;
    });

    return data;
}

function updatePreview() {
    const formData = collectFormData();
    fetch('/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('dockerfilePreview').textContent = data.dockerfile;
    });
}

function downloadDockerfile() {
    const content = document.getElementById('dockerfilePreview').textContent;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Dockerfile';
    a.click();
    window.URL.revokeObjectURL(url);
}

// 클립보드 복사 함수
function copyToClipboard() {
    const content = document.getElementById('dockerfilePreview').textContent;
    navigator.clipboard.writeText(content).then(() => {
        const copyBtn = document.getElementById('copyBtn');
        copyBtn.innerHTML = '<i class="fas fa-check"></i> 복사됨';
        setTimeout(() => {
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> 복사';
        }, 2000);
    });
}

// 고급 설정 토글
function toggleAdvancedSettings() {
    const isAdvanced = document.getElementById('advancedToggle').checked;
    document.getElementById('step5').style.display = isAdvanced ? 'block' : 'none';
}

// 볼륨 추가
function addVolume() {
    const volumesDiv = document.getElementById('volumes');
    const pathInput = document.querySelector('.volume-path');
    
    if (pathInput.value.trim()) {
        const volumeGroup = document.createElement('div');
        volumeGroup.className = 'input-group';
        volumeGroup.innerHTML = `
            <input type="text" value="${pathInput.value}" readonly>
            <button type="button" onclick="removeElement(this.parentElement)" class="remove-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;
        volumesDiv.appendChild(volumeGroup);
        pathInput.value = '';
        updatePreview();
    }
}

// SHELL 추가
function addShell() {
    const shellsDiv = document.getElementById('shells');
    const commandInput = document.querySelector('.shell-command');
    
    if (commandInput.value.trim()) {
        const shellGroup = document.createElement('div');
        shellGroup.className = 'input-group';
        shellGroup.innerHTML = `
            <input type="text" value="${commandInput.value}" readonly>
            <button type="button" onclick="removeElement(this.parentElement)" class="remove-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;
        shellsDiv.appendChild(shellGroup);
        commandInput.value = '';
        updatePreview();
    }
}

// HEALTHCHECK 추가
function addHealthcheck() {
    const healthchecksDiv = document.getElementById('healthchecks');
    const commandInput = document.querySelector('.healthcheck-command');
    const intervalInput = document.querySelector('.healthcheck-interval');
    
    if (commandInput.value.trim() && intervalInput.value.trim()) {
        const healthcheckGroup = document.createElement('div');
        healthcheckGroup.className = 'input-group';
        healthcheckGroup.innerHTML = `
            <input type="text" value="--interval=${intervalInput.value}s ${commandInput.value}" readonly>
            <button type="button" onclick="removeElement(this.parentElement)" class="remove-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;
        healthchecksDiv.appendChild(healthcheckGroup);
        commandInput.value = '';
        intervalInput.value = '';
        updatePreview();
    }
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    showStep(1);
    
    // 베이스 이미지 선택 이벤트
    document.getElementById('commonImages').addEventListener('change', function() {
        if (this.value) {
            document.querySelector('input[name="base_image"]').value = this.value;
            updatePackageList(this.value);
            updatePreview();
        }
    });

    // 모든 입력 필드에 대한 변경 감지
    document.addEventListener('input', updatePreview);

    // 엔터키로 추가하는 기능
    document.querySelector('.port-number').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addPort();
        }
    });

    // 환경변수 추가
    document.querySelector('.env-value').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addEnv();
        }
    });

    // 라벨 추가
    document.querySelector('.label-value').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addLabel();
        }
    });

    // 파일 복사 추가
    document.querySelector('.copy-dest').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addCopy();
        }
    });

    // RUN 명령어 추가
    document.querySelector('.run-command').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addRun();
        }
    });

    // CMD 명령어 추가
    document.querySelector('.cmd-command').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addCmd();
        }
    });

    // ENTRYPOINT 추가
    document.querySelector('.entrypoint-command').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addEntrypoint();
        }
    });

    // 볼륨 추가
    document.querySelector('.volume-path').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addVolume();
        }
    });

    // SHELL 추가
    document.querySelector('.shell-command').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addShell();
        }
    });

    // HEALTHCHECK 추가
    document.querySelector('.healthcheck-interval').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addHealthcheck();
        }
    });
}); 