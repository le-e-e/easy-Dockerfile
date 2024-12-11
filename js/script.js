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

// 요소 제거 함수
function removeElement(element) {
    element.remove();
    updatePreview();
}

// 폼 데이터 수집
function collectFormData() {
    const data = {
        baseImage: document.querySelector('input[name="base_image"]').value,
        workdir: document.querySelector('input[name="workdir"]').value,
        labels: {},
        env: [],
        ports: [],
        copies: [],
        runs: [],
        cmds: [],
        volumes: [],
        user: document.querySelector('input[name="user"]').value,
        shells: [],
        healthchecks: []
    };

    // 라벨 수집
    document.querySelectorAll('#labels input[readonly]').forEach(input => {
        const [key, value] = input.value.split('=');
        data.labels[key] = value;
    });

    // 환경변수 수집
    document.querySelectorAll('#envs input[readonly]').forEach(input => {
        const [key, value] = input.value.split('=');
        data.env.push({ key, value });
    });

    // 포트 수집
    document.querySelectorAll('#ports input[readonly]').forEach(input => {
        const [number, protocol] = input.value.split('/');
        data.ports.push({ number, protocol });
    });

    // 파일 복사 수집
    document.querySelectorAll('#copies input[readonly]').forEach(input => {
        const [src, dest] = input.value.split(' → ');
        data.copies.push({ src, dest });
    });

    // RUN 명령어 수집
    document.querySelectorAll('#runs input[readonly]').forEach(input => {
        data.runs.push(input.value);
    });

    // CMD 수집
    document.querySelectorAll('#cmds input[readonly]').forEach(input => {
        data.cmds.push(input.value);
    });

    // VOLUME 수집
    document.querySelectorAll('#volumes input[readonly]').forEach(input => {
        data.volumes.push(input.value);
    });

    // SHELL 수집
    document.querySelectorAll('#shells input[readonly]').forEach(input => {
        data.shells.push(input.value);
    });

    // HEALTHCHECK 수집
    document.querySelectorAll('#healthchecks input[readonly]').forEach(input => {
        const [interval, command] = input.value.split(' ');
        data.healthchecks.push({
            interval: interval.split('=')[1].replace('s', ''),
            command: command
        });
    });

    return data;
}

// 라벨 추가
function addLabel() {
    const key = document.querySelector('.label-key').value.trim();
    const value = document.querySelector('.label-value').value.trim();
    
    if (key && value) {
        const labelsDiv = document.getElementById('labels');
        const labelGroup = document.createElement('div');
        labelGroup.className = 'input-group';
        labelGroup.innerHTML = `
            <input type="text" value="${key}=${value}" readonly>
            <button type="button" onclick="removeElement(this.parentElement)" class="remove-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;
        labelsDiv.appendChild(labelGroup);
        document.querySelector('.label-key').value = '';
        document.querySelector('.label-value').value = '';
        updatePreview();
    }
}

// 포트 추가
function addPort() {
    const number = document.querySelector('.port-number').value.trim();
    const protocol = document.querySelector('.port-protocol').value;
    
    if (number) {
        const portsDiv = document.getElementById('ports');
        const portGroup = document.createElement('div');
        portGroup.className = 'input-group';
        portGroup.innerHTML = `
            <input type="text" value="${number}/${protocol}" readonly>
            <button type="button" onclick="removeElement(this.parentElement)" class="remove-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;
        portsDiv.appendChild(portGroup);
        document.querySelector('.port-number').value = '';
        updatePreview();
    }
}

// 환경변수 추가
function addEnv() {
    const key = document.querySelector('.env-key').value.trim();
    const value = document.querySelector('.env-value').value.trim();
    
    if (key && value) {
        const envsDiv = document.getElementById('envs');
        const envGroup = document.createElement('div');
        envGroup.className = 'input-group';
        envGroup.innerHTML = `
            <input type="text" value="${key}=${value}" readonly>
            <button type="button" onclick="removeElement(this.parentElement)" class="remove-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;
        envsDiv.appendChild(envGroup);
        document.querySelector('.env-key').value = '';
        document.querySelector('.env-value').value = '';
        updatePreview();
    }
}

// 파일 복사 추가
function addCopy() {
    const src = document.querySelector('.copy-src').value.trim();
    const dest = document.querySelector('.copy-dest').value.trim();
    
    if (src && dest) {
        const copiesDiv = document.getElementById('copies');
        const copyGroup = document.createElement('div');
        copyGroup.className = 'input-group';
        copyGroup.innerHTML = `
            <input type="text" value="${src} → ${dest}" readonly>
            <button type="button" onclick="removeElement(this.parentElement)" class="remove-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;
        copiesDiv.appendChild(copyGroup);
        document.querySelector('.copy-src').value = '';
        document.querySelector('.copy-dest').value = '';
        updatePreview();
    }
}

// RUN 명령어 추가
function addRun() {
    const command = document.querySelector('.run-command').value.trim();
    
    if (command) {
        const runsDiv = document.getElementById('runs');
        const runGroup = document.createElement('div');
        runGroup.className = 'input-group';
        runGroup.innerHTML = `
            <input type="text" value="${command}" readonly>
            <button type="button" onclick="removeElement(this.parentElement)" class="remove-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;
        runsDiv.appendChild(runGroup);
        document.querySelector('.run-command').value = '';
        updatePreview();
    }
}

// CMD 추가
function addCmd() {
    const command = document.querySelector('.cmd-command').value.trim();
    
    if (command) {
        const cmdsDiv = document.getElementById('cmds');
        const cmdGroup = document.createElement('div');
        cmdGroup.className = 'input-group';
        cmdGroup.innerHTML = `
            <input type="text" value="${command}" readonly>
            <button type="button" onclick="removeElement(this.parentElement)" class="remove-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;
        cmdsDiv.appendChild(cmdGroup);
        document.querySelector('.cmd-command').value = '';
        updatePreview();
    }
}
// VOLUME 추가
function addVolume() {
    const path = document.querySelector('.volume-path').value.trim();
    
    if (path) {
        const volumesDiv = document.getElementById('volumes');
        const volumeGroup = document.createElement('div');
        volumeGroup.className = 'input-group';
        volumeGroup.innerHTML = `
            <input type="text" value="${path}" readonly>
            <button type="button" onclick="removeElement(this.parentElement)" class="remove-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;
        volumesDiv.appendChild(volumeGroup);
        document.querySelector('.volume-path').value = '';
        updatePreview();
    }
}

// SHELL 추가
function addShell() {
    const command = document.querySelector('.shell-command').value.trim();
    
    if (command) {
        const shellsDiv = document.getElementById('shells');
        const shellGroup = document.createElement('div');
        shellGroup.className = 'input-group';
        shellGroup.innerHTML = `
            <input type="text" value="${command}" readonly>
            <button type="button" onclick="removeElement(this.parentElement)" class="remove-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;
        shellsDiv.appendChild(shellGroup);
        document.querySelector('.shell-command').value = '';
        updatePreview();
    }
}

// HEALTHCHECK 추가
function addHealthcheck() {
    const command = document.querySelector('.healthcheck-command').value.trim();
    const interval = document.querySelector('.healthcheck-interval').value.trim();
    
    if (command && interval) {
        const healthchecksDiv = document.getElementById('healthchecks');
        const healthcheckGroup = document.createElement('div');
        healthcheckGroup.className = 'input-group';
        healthcheckGroup.innerHTML = `
            <input type="text" value="interval=${interval}s ${command}" readonly>
            <button type="button" onclick="removeElement(this.parentElement)" class="remove-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;
        healthchecksDiv.appendChild(healthcheckGroup);
        document.querySelector('.healthcheck-command').value = '';
        document.querySelector('.healthcheck-interval').value = '';
        updatePreview();
    }
}

// Dockerfile 생성
function generateDockerfileContent(data) {
    const dockerfile = [];
    
    // 베이스 이미지
    if (data.baseImage) {
        dockerfile.push(`FROM ${data.baseImage}`);
        dockerfile.push("");
    }
    
    // 라벨
    if (Object.keys(data.labels).length > 0) {
        for (const [key, value] of Object.entries(data.labels)) {
            dockerfile.push(`LABEL ${key}="${value}"`);
        }
        dockerfile.push("");
    }
    
    // 작업 디렉토리
    if (data.workdir) {
        dockerfile.push(`WORKDIR ${data.workdir}`);
        dockerfile.push("");
    }
    
    // 환경변수
    if (data.env && data.env.length > 0) {
        data.env.forEach(env => {
            if (env.key && env.value) {
                dockerfile.push(`ENV ${env.key}=${env.value}`);
            }
        });
        dockerfile.push("");
    }
    
    // 포트
    if (data.ports && data.ports.length > 0) {
        data.ports.forEach(port => {
            if (port.number && port.protocol) {
                dockerfile.push(`EXPOSE ${port.number}/${port.protocol}`);
            }
        });
        dockerfile.push("");
    }
    
    // 볼륨
    if (data.volumes && data.volumes.length > 0) {
        data.volumes.forEach(volume => {
            dockerfile.push(`VOLUME ${volume}`);
        });
        dockerfile.push("");
    }
    
    // 사용자
    if (data.user) {
        dockerfile.push(`USER ${data.user}`);
        dockerfile.push("");
    }
    
    // 셸
    if (data.shells && data.shells.length > 0) {
        data.shells.forEach(shell => {
            dockerfile.push(`SHELL ${shell}`);
        });
        dockerfile.push("");
    }
    
    // 파일 복사
    if (data.copies && data.copies.length > 0) {
        data.copies.forEach(copy => {
            if (copy.src && copy.dest) {
                dockerfile.push(`COPY ${copy.src} ${copy.dest}`);
            }
        });
        dockerfile.push("");
    }
    
    // RUN 명령어
    if (data.runs && data.runs.length > 0) {
        data.runs.forEach(run => {
            if (run) {
                dockerfile.push(`RUN ${run}`);
            }
        });
        dockerfile.push("");
    }
    
    // HEALTHCHECK
    if (data.healthchecks && data.healthchecks.length > 0) {
        data.healthchecks.forEach(check => {
            if (check.command && check.interval) {
                dockerfile.push(`HEALTHCHECK --interval=${check.interval}s CMD ${check.command}`);
            }
        });
        dockerfile.push("");
    }
    
    // ENTRYPOINT
    if (data.entrypoint) {
        const parts = data.entrypoint.split(' ');
        const entrypointFormatted = '[' + parts.map(part => `"${part}"`).join(', ') + ']';
        dockerfile.push(`ENTRYPOINT ${entrypointFormatted}`);
        dockerfile.push("");
    }
    
    // CMD
    if (data.cmds && data.cmds.length > 0) {
        data.cmds.forEach(cmd => {
            const parts = cmd.split(' ');
            const cmdFormatted = '[' + parts.map(part => `"${part}"`).join(', ') + ']';
            dockerfile.push(`CMD ${cmdFormatted}`);
        });
    }
    
    // 마지막 빈 줄 제거
    while (dockerfile.length > 0 && !dockerfile[dockerfile.length - 1]) {
        dockerfile.pop();
    }
    
    return dockerfile.join('\n');
}

// 미리보기 업데이트
function updatePreview() {
    const formData = collectFormData();
    const dockerfile = generateDockerfileContent(formData);
    document.getElementById('dockerfilePreview').textContent = dockerfile;
    Prism.highlightElement(document.getElementById('dockerfilePreview'));
}

// 클립보드에 복사
function copyToClipboard() {
    const dockerfile = document.getElementById('dockerfilePreview').textContent;
    navigator.clipboard.writeText(dockerfile).then(() => {
        const copyBtn = document.getElementById('copyBtn');
        copyBtn.innerHTML = '<i class="fas fa-check"></i> 복사됨';
        setTimeout(() => {
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> 복사';
        }, 2000);
    });
}

// Dockerfile 다운로드
function downloadDockerfile() {
    const formData = collectFormData();
    const content = generateDockerfileContent(formData);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Dockerfile';
    a.click();
    window.URL.revokeObjectURL(url);
}

// 고급 설정 토글
function toggleAdvancedSettings() {
    const step5 = document.getElementById('step5');
    if (document.getElementById('advancedToggle').checked) {
        step5.style.display = 'block';
    } else {
        step5.style.display = 'none';
    }
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    showStep(1);
    
    // 베이스 이미지 선택 이벤트
    document.getElementById('commonImages').addEventListener('change', function() {
        if (this.value) {
            document.querySelector('input[name="base_image"]').value = this.value;
            updatePreview();
        }
    });

    // 모든 입력 필드에 대한 변경 감지
    document.addEventListener('input', updatePreview);

    // 엔터키 이벤트 리스너들
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const inputClass = this.className;
                if (inputClass.includes('label-value')) addLabel();
                else if (inputClass.includes('port-number')) addPort();
                else if (inputClass.includes('env-value')) addEnv();
                else if (inputClass.includes('copy-dest')) addCopy();
                else if (inputClass.includes('run-command')) addRun();
                else if (inputClass.includes('cmd-command')) addCmd();
                else if (inputClass.includes('volume-path')) addVolume();
                else if (inputClass.includes('shell-command')) addShell();
                else if (inputClass.includes('healthcheck-interval')) addHealthcheck();
            }
        });
    });
});

// 패키지 관련 함수들
function updatePackageList(image) {
    const imageType = image.split(':')[0].toLowerCase();
    const packages = defaultPackages[imageType];
    const packageListDiv = document.getElementById('packageList');
    
    if (packages && packages.packages.length > 0) {
        packageListDiv.innerHTML = `
            <div class="package-selector">
                <div class="common-packages">
                    ${packages.packages.map(pkg => `
                        <button type="button" class="package-btn" onclick="addPackage('${pkg}')">
                            ${pkg}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    } else {
        packageListDiv.innerHTML = '';
    }
}

function addPackage(packageName) {
    const imageType = document.querySelector('input[name="base_image"]').value.split(':')[0].toLowerCase();
    const packages = defaultPackages[imageType];
    
    if (packages) {
        const runsDiv = document.getElementById('runs');
        const runGroup = document.createElement('div');
        runGroup.className = 'input-group';
        
        let installCommand = '';
        switch (packages.manager) {
            case 'pip':
                installCommand = `pip install ${packageName}`;
                break;
            case 'npm':
                installCommand = `npm install ${packageName}`;
                break;
            case 'apt-get':
                installCommand = `apt-get update && apt-get install -y ${packageName}`;
                break;
            case 'apk':
                installCommand = `apk add --no-cache ${packageName}`;
                break;
            default:
                return;
        }
        
        runGroup.innerHTML = `
            <input type="text" value="${installCommand}" readonly>
            <button type="button" onclick="removeElement(this.parentElement)" class="remove-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;
        runsDiv.appendChild(runGroup);
        updatePreview();
    }
}