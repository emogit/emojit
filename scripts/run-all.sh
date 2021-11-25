set -ex

command=$@

${command}

(cd core && ${command})
(cd extension && ${command})
