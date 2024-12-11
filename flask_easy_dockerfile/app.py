from flask import Flask, render_template, jsonify, request, send_file
import io

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate_dockerfile():
    data = request.get_json()
    dockerfile_content = generate_dockerfile_content(data)
    return jsonify({'dockerfile': dockerfile_content})

@app.route('/download', methods=['POST'])
def download_dockerfile():
    data = request.get_json()
    content = generate_dockerfile_content(data)
    
    # 파일 생성
    buffer = io.BytesIO()
    buffer.write(content.encode('utf-8'))
    buffer.seek(0)
    
    return send_file(
        buffer,
        mimetype='text/plain',
        as_attachment=True,
        download_name='Dockerfile'
    )

def generate_dockerfile_content(data):
    dockerfile = []
    
    # 베이스 이미지
    if data.get('baseImage'):
        dockerfile.append(f"FROM {data['baseImage']}")
        dockerfile.append("")
    
    # 라벨
    if data.get('labels'):
        for key, value in data['labels'].items():
            dockerfile.append(f'LABEL {key}="{value}"')
        dockerfile.append("")
    
    # 작업 디렉토리
    if data.get('workdir'):
        dockerfile.append(f"WORKDIR {data['workdir']}")
        dockerfile.append("")
    
    # 환경변수
    if data.get('env'):
        for env in data['env']:
            if env.get('key') and env.get('value'):
                dockerfile.append(f"ENV {env['key']}={env['value']}")
        dockerfile.append("")
    
    # 포트
    if data.get('ports'):
        for port in data['ports']:
            if port.get('number') and port.get('protocol'):
                dockerfile.append(f"EXPOSE {port['number']}/{port['protocol']}")
        dockerfile.append("")
    
    # 볼륨 (고급 설정)
    if data.get('volumes'):
        for volume in data['volumes']:
            dockerfile.append(f"VOLUME {volume}")
        dockerfile.append("")
    
    # 사용자 (고급 설정)
    if data.get('user'):
        dockerfile.append(f"USER {data['user']}")
        dockerfile.append("")
    
    # 셸 (고급 설정)
    if data.get('shells'):
        for shell in data['shells']:
            dockerfile.append(f"SHELL {shell}")
        dockerfile.append("")
    
    # 파일 복사
    if data.get('copies'):
        for copy in data['copies']:
            if copy.get('src') and copy.get('dest'):
                dockerfile.append(f"COPY {copy['src']} {copy['dest']}")
        dockerfile.append("")
    
    # RUN 명령어
    if data.get('runs'):
        for run in data['runs']:
            if run:
                dockerfile.append(f"RUN {run}")
        dockerfile.append("")
    
    # HEALTHCHECK (고급 설정)
    if data.get('healthchecks'):
        for check in data['healthchecks']:
            if check.get('command') and check.get('interval'):
                dockerfile.append(f"HEALTHCHECK --interval={check['interval']}s CMD {check['command']}")
        dockerfile.append("")
    
    # ENTRYPOINT
    if data.get('entrypoint'):
        parts = data['entrypoint'].split()
        entrypoint_formatted = '[' + ', '.join(f'"{part}"' for part in parts) + ']'
        dockerfile.append(f"ENTRYPOINT {entrypoint_formatted}")
        dockerfile.append("")
    
    # CMD
    if data.get('cmds'):
        for cmd in data['cmds']:
            parts = cmd.split()
            cmd_formatted = '[' + ', '.join(f'"{part}"' for part in parts) + ']'
            dockerfile.append(f"CMD {cmd_formatted}")
    
    # 마지막 빈 줄 제거
    while dockerfile and not dockerfile[-1]:
        dockerfile.pop()
    
    return '\n'.join(dockerfile)

if __name__ == '__main__':
    app.run(debug=True) 