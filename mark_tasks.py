import re
import os

repo_root = "/Users/camiloalzate/repos/adk-tools-personal-assistant"
tasks_path = os.path.join(repo_root, "specs/001-react-assistant-webapp/tasks.md")

with open(tasks_path, "r") as f:
    content = f.read()

lines = content.split('\n')
new_lines = []

for line in lines:
    match = re.match(r'^(- \[ )( )(\].*?`(.*?)`.*)', line)
    if match:
        file_path_in_task = match.group(4)
        full_path = os.path.join(repo_root, file_path_in_task)
        if os.path.exists(full_path):
            line = f"- [x]{match.group(3)}"
    new_lines.append(line)

with open(tasks_path, "w") as f:
    f.write('\n'.join(new_lines))

