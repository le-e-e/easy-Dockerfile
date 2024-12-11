// Dockerfile 생성 로직
function generateDockerfileContent(data) {
    let dockerfile = [];
    
    // 베이스 이미지
    if (data.baseImage) {
        dockerfile.push(`FROM ${data.baseImage}`);
        dockerfile.push("");
    }
    
    // 라벨
    if (data.labels) {
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
        const entrypoint_formatted = '[' + parts.map(part => `"${part}"`).join(', ') + ']';
        dockerfile.push(`ENTRYPOINT ${entrypoint_formatted}`);
        dockerfile.push("");
    }
    
    // CMD
    if (data.cmds && data.cmds.length > 0) {
        data.cmds.forEach(cmd => {
            const parts = cmd.split(' ');
            const cmd_formatted = '[' + parts.map(part => `"${part}"`).join(', ') + ']';
            dockerfile.push(`CMD ${cmd_formatted}`);
        });
    }
    
    // 마지막 빈 줄 제거
    while (dockerfile.length > 0 && !dockerfile[dockerfile.length - 1]) {
        dockerfile.pop();
    }
    
    return dockerfile.join('\n');
}

// Dockerfile 다운로드 함수
function downloadDockerfile(content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Dockerfile';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
} 