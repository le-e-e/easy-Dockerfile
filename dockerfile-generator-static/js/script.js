let currentStep = 1;
const totalSteps = 4;

// 기본 패키지 정의
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

// 데이터 저장소
let dockerfileData = {
    baseImage: '',
    labels: {},
    workdir: '',
    env: [],
    ports: [],
    copies: [],
    runs: [],
    volumes: [],
    user: '',
    shells: [],
    healthchecks: [],
    entrypoint: '',
    cmds: []
};

// 단계 이동 함수
function showStep(step) {
    document.querySelectorAll('.step').forEach(el => el.style.display = 'none');
    document.getElementById(`step${step}`).style.display = 'block';
    
    // 마지막 단계에서만 다운로드 버튼과 고급 설정 토글 표시
    const downloadBtn = document.querySelector('.download-btn');
    const advancedToggle = document.querySelector('.advanced-toggle');
    
    if (step === 4) {
        downloadBtn.style.display = 'inline-block';
        advancedToggle.style.display = 'block';
    } else {
        downloadBtn.style.display = 'none';
        advancedToggle.style.display = 'none';
        // 다른 단계로 이동할 때 고급 설정 닫기
        document.getElementById('advancedToggle').checked = false;
        document.getElementById('step5').style.display = 'none';
    }
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

// 기본 패키지 관련 함수
function updatePackageList(image) {
    const imageType = image.split(':')[0].toLowerCase();
    const packages = defaultPackages[imageType];
    const packageSelector = document.getElementById('packageSelector');
    
    if (packages) {
        let html = `<p>패키지 관리자: ${packages.manager}</p><div class="package-list">`;
        packages.packages.forEach(pkg => {
            html += `
                <button type="button" class="package-btn" onclick="togglePackage(this)" data-package="${pkg}">
                    ${pkg}
                </button>
            `;
        });
        html += '</div>';
        packageSelector.innerHTML = html;
        packageSelector.style.display = 'block';
    } else {
        packageSelector.innerHTML = '<p>이 이미지에 대한 기본 패키지가 없습니다.</p>';
        packageSelector.style.display = 'block';
    }
}

function togglePackage(btn) {
    btn.classList.toggle('selected');
    updatePreview();
}

// 항목 추가/삭제 함수들
function addPort() {
    const number = document.querySelector('.port-number').value;
    const protocol = document.querySelector('.port-protocol').value;
    
    if (number) {
        dockerfileData.ports.push({ number, protocol });
        const portsDiv = document.getElementById('ports');
        const portGroup = document.createElement('div');
        portGroup.className = 'input-group';
        portGroup.innerHTML = `
            <input type="text" value="${number}/${protocol}" readonly>
            <button type="button" onclick="removePort(this)" class="remove-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;
        portsDiv.appendChild(portGroup);
        document.querySelector('.port-number').value = '';
        updatePreview();
    }
}

function removePort(btn) {
    const index = Array.from(btn.parentElement.parentElement.children).indexOf(btn.parentElement);
    dockerfileData.ports.splice(index, 1);
    btn.parentElement.remove();
    updatePreview();
}

// 비슷한 패턴으로 다른 추가/삭제 함수들 구현
function addEnv() {
    const key = document.querySelector('.env-key').value;
    const value = document.querySelector('.env-value').value;
    
    if (key && value) {
        dockerfileData.env.push({ key, value });
        const envsDiv = document.getElementById('envs');
        const envGroup = document.createElement('div');
        envGroup.className = 'input-group';
        envGroup.innerHTML = `
            <input type="text" value="${key}=${value}" readonly>
            <button type="button" onclick="removeEnv(this)" class="remove-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;
        envsDiv.appendChild(envGroup);
        document.querySelector('.env-key').value = '';
        document.querySelector('.env-value').value = '';
        updatePreview();
    }
}

// ... 다른 추가/삭제 함수들 (Label, Copy, Run, CMD 등) ...

// 미리보기 업데이트
function updatePreview() {
    // 현재 선택된 패키지들 수집
    const selectedPackages = Array.from(document.querySelectorAll('.package-btn.selected'))
        .map(btn => btn.dataset.package);
    
    // 패키지 설치 명령어 생성
    if (selectedPackages.length > 0) {
        const imageType = dockerfileData.baseImage.split(':')[0].toLowerCase();
        const manager = defaultPackages[imageType]?.manager;
        if (manager) {
            const installCmd = getPackageInstallCommand(manager, selectedPackages);
            if (!dockerfileData.runs.includes(installCmd)) {
                dockerfileData.runs.unshift(installCmd);
            }
        }
    }

    // Dockerfile 내용 생성 및 표시
    const content = generateDockerfileContent(dockerfileData);
    const preview = document.getElementById('dockerfilePreview');
    preview.textContent = content;
    Prism.highlightElement(preview);
}

// 패키지 설치 명령어 생성
function getPackageInstallCommand(manager, packages) {
    switch (manager) {
        case 'pip':
            return `pip install ${packages.join(' ')}`;
        case 'npm':
            return `npm install -g ${packages.join(' ')}`;
        case 'apt-get':
            return `apt-get update && apt-get install -y ${packages.join(' ')}`;
        case 'apk':
            return `apk add --no-cache ${packages.join(' ')}`;
        default:
            return '';
    }
}

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 이벤트 리스너 설정
    document.getElementById('commonImages').addEventListener('change', function(e) {
        const customInput = this.nextElementSibling;
        if (this.value) {
            customInput.value = this.value;
            dockerfileData.baseImage = this.value;
            updatePackageList(this.value);
            updatePreview();
        }
    });

    // 기존의 엔터키 이벤트 리스너들...

    // 초기 단계 표시
    showStep(1);
});

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

// Dockerfile 다운로드
function downloadDockerfile() {
    const content = document.getElementById('dockerfilePreview').textContent;
    downloadDockerfile(content);
} 